export type IssueSeverity = "critical" | "medium" | "low";

export interface Issue {
  severity: IssueSeverity;
  title: string;
  description: string;
  file?: string;
}

export interface ScanResult {
  repo: string;
  score: number;
  issues: Issue[];
  scannedAt: string;
  filesChecked: number;
}

// Patterns for secret detection
const SECRET_PATTERNS: { pattern: RegExp; title: string; description: string }[] = [
  {
    pattern: /sk-[a-zA-Z0-9]{20,}/,
    title: "OpenAI API key exposed",
    description: "A string matching an OpenAI secret key (sk-...) was found in source code. Rotate this key immediately.",
  },
  {
    pattern: /AKIA[0-9A-Z]{16}/,
    title: "AWS Access Key ID exposed",
    description: "An AWS access key ID was found in source code. This could allow unauthorized access to your AWS resources.",
  },
  {
    pattern: /ghp_[a-zA-Z0-9]{36}/,
    title: "GitHub Personal Access Token exposed",
    description: "A GitHub PAT was found in source code. Revoke it in GitHub Settings immediately.",
  },
  {
    pattern: /["']?password["']?\s*[:=]\s*["'][^"']{8,}["']/i,
    title: "Hardcoded password detected",
    description: "A hardcoded password literal was found. Use environment variables or a secrets manager instead.",
  },
  {
    pattern: /["']?secret["']?\s*[:=]\s*["'][^"']{8,}["']/i,
    title: "Hardcoded secret detected",
    description: "A hardcoded secret literal was found in source code. Move secrets to environment variables.",
  },
  {
    pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/,
    title: "JWT token hardcoded",
    description: "A JWT token was found hardcoded in source code. Never commit live tokens — use env vars.",
  },
  {
    pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    title: "Private key committed",
    description: "A private key was found in the repository. This is a critical security risk — revoke and regenerate.",
  },
];

// Risky dependency patterns
const RISKY_DEPS: { name: string; reason: string }[] = [
  { name: "event-stream", reason: "supply-chain attack vector (historical)" },
  { name: "flatmap-stream", reason: "known malicious package" },
  { name: "colors", reason: "author sabotaged this package in 2022" },
  { name: "node-ipc", reason: "author sabotaged this package in 2022" },
];

interface GitHubTreeItem {
  path: string;
  type: string;
  sha: string;
  size?: number;
}

interface GitHubRepoInfo {
  default_branch: string;
  private: boolean;
  name: string;
  full_name: string;
}

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return null;
    const parts = parsed.pathname.replace(/^\//, "").replace(/\/$/, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

async function fetchGitHub(path: string): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Shepherd-Scanner/1.0",
    },
    next: { revalidate: 0 },
  });
}

async function fetchFileContent(owner: string, repo: string, path: string): Promise<string | null> {
  try {
    const res = await fetchGitHub(`/repos/${owner}/${repo}/contents/${path}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.encoding === "base64" && data.content) {
      return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

function scanContentForSecrets(content: string, filePath: string): Issue[] {
  const issues: Issue[] = [];
  for (const { pattern, title, description } of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      issues.push({ severity: "critical", title, description, file: filePath });
    }
  }
  return issues;
}

function countTodosFixmes(content: string): number {
  const matches = content.match(/\b(TODO|FIXME|HACK|XXX)\b/gi);
  return matches ? matches.length : 0;
}

export async function scanRepo(repoUrl: string): Promise<ScanResult> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    throw new Error("Invalid GitHub URL. Please enter a URL like https://github.com/owner/repo");
  }

  const { owner, repo } = parsed;

  // Fetch repo info
  const repoRes = await fetchGitHub(`/repos/${owner}/${repo}`);
  if (repoRes.status === 404) {
    throw new Error("Repository not found. Make sure the URL is correct and the repo is public.");
  }
  if (repoRes.status === 403) {
    throw new Error("GitHub rate limit exceeded. Please try again in a few minutes.");
  }
  if (!repoRes.ok) {
    throw new Error(`GitHub returned an error (${repoRes.status}). Please try again.`);
  }

  const repoInfo: GitHubRepoInfo = await repoRes.json();
  if (repoInfo.private) {
    throw new Error("This repository is private. Shepherd currently supports public repositories only.");
  }

  // Fetch file tree
  const treeRes = await fetchGitHub(
    `/repos/${owner}/${repo}/git/trees/${repoInfo.default_branch}?recursive=1`
  );
  if (!treeRes.ok) {
    throw new Error("Could not fetch repository file tree. Please try again.");
  }

  const treeData = await treeRes.json();
  const tree: GitHubTreeItem[] = treeData.tree || [];
  const files = tree.filter((f) => f.type === "blob");

  const issues: Issue[] = [];
  let totalTodos = 0;
  let filesChecked = 0;

  // Check for .env files committed
  const envFiles = files.filter(
    (f) => f.path === ".env" || f.path.match(/^\.env\.(local|production|development|staging)$/)
  );
  for (const envFile of envFiles) {
    issues.push({
      severity: "critical",
      title: ".env file committed to repository",
      description: `The file "${envFile.path}" was found in version control. .env files often contain secrets and should never be committed.`,
      file: envFile.path,
    });
  }

  // Check .gitignore
  const gitignoreContent = await fetchFileContent(owner, repo, ".gitignore");
  if (!gitignoreContent) {
    issues.push({
      severity: "medium",
      title: "No .gitignore found",
      description: "This repo has no .gitignore file. Without it, secrets and build artifacts can easily be committed accidentally.",
    });
  } else {
    if (!gitignoreContent.includes(".env")) {
      issues.push({
        severity: "medium",
        title: ".env not in .gitignore",
        description: "Your .gitignore doesn't include .env. This makes it easy to accidentally commit secrets.",
        file: ".gitignore",
      });
    }
    if (!gitignoreContent.includes("node_modules")) {
      issues.push({
        severity: "low",
        title: "node_modules not in .gitignore",
        description: "node_modules should be excluded from version control to keep the repo size manageable.",
        file: ".gitignore",
      });
    }
  }

  // Check package.json
  const pkgContent = await fetchFileContent(owner, repo, "package.json");
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent);
      const allDeps = {
        ...((pkg.dependencies as Record<string, string>) ?? {}),
        ...((pkg.devDependencies as Record<string, string>) ?? {}),
      };
      const depCount = Object.keys(allDeps).length;

      if (depCount > 100) {
        issues.push({
          severity: "low",
          title: `High dependency count (${depCount} packages)`,
          description: "This repo has many dependencies. More packages = more attack surface. Consider auditing unused dependencies.",
          file: "package.json",
        });
      }

      for (const { name, reason } of RISKY_DEPS) {
        if (allDeps[name]) {
          issues.push({
            severity: "critical",
            title: `Risky package: ${name}`,
            description: `The package "${name}" is flagged (${reason}). Review and replace if possible.`,
            file: "package.json",
          });
        }
      }

      // Check for missing lockfile
      const hasLockfile = files.some(
        (f) =>
          f.path === "package-lock.json" ||
          f.path === "yarn.lock" ||
          f.path === "pnpm-lock.yaml" ||
          f.path === "bun.lockb"
      );
      if (!hasLockfile) {
        issues.push({
          severity: "medium",
          title: "No lockfile found",
          description: "Without a lockfile (package-lock.json, yarn.lock, etc.), dependency versions are not pinned. This can cause inconsistent builds and supply-chain issues.",
        });
      }
    } catch {
      // malformed package.json — not our problem to diagnose
    }
  }

  // Scan source files for secrets and patterns
  const sourceExtensions = /\.(ts|tsx|js|jsx|mjs|cjs|py|rb|go|php|java|env\.example)$/;
  const skipDirs = /^(node_modules|\.git|\.next|dist|build|out)\//;

  const filesToScan = files
    .filter((f) => sourceExtensions.test(f.path) && !skipDirs.test(f.path))
    .slice(0, 40); // cap at 40 files to avoid rate limiting

  for (const file of filesToScan) {
    const content = await fetchFileContent(owner, repo, file.path);
    if (!content) continue;
    filesChecked++;

    const secretIssues = scanContentForSecrets(content, file.path);
    issues.push(...secretIssues);

    // Check for Supabase public key with RLS hint
    if (content.includes("supabase") && content.includes("NEXT_PUBLIC_") && !content.includes("rls")) {
      const alreadyFlagged = issues.some((i) => i.title.includes("Supabase") && i.file === file.path);
      if (!alreadyFlagged) {
        issues.push({
          severity: "medium",
          title: "Supabase public key exposed without RLS check",
          description: "Your Supabase anon key is in client-side code. Ensure Row Level Security (RLS) is enabled on all tables, otherwise any user can read/write all data.",
          file: file.path,
        });
      }
    }

    // Check for auth code without rate limiting
    if (
      (content.includes("/api/auth") || content.includes("signIn") || content.includes("login")) &&
      !content.includes("rateLimit") &&
      !content.includes("rate-limit") &&
      !content.includes("rate_limit") &&
      !content.includes("@upstash/ratelimit") &&
      !content.includes("express-rate-limit")
    ) {
      const alreadyFlagged = issues.some((i) => i.title.includes("rate limit") && i.file === file.path);
      if (!alreadyFlagged) {
        issues.push({
          severity: "medium",
          title: "Auth endpoint without rate limiting",
          description: "Authentication code found without any rate limiting. This makes brute-force attacks easy. Add rate limiting to protect your users.",
          file: file.path,
        });
      }
    }

    totalTodos += countTodosFixmes(content);
  }

  // TODO density
  if (filesChecked > 0 && totalTodos / filesChecked > 3) {
    issues.push({
      severity: "low",
      title: `High TODO/FIXME density (${totalTodos} found)`,
      description: `${totalTodos} TODO or FIXME comments found across ${filesChecked} files. This suggests known issues that haven't been addressed.`,
    });
  }

  // Deduplicate issues by title+file
  const seen = new Set<string>();
  const deduped = issues.filter((issue) => {
    const key = `${issue.title}:${issue.file ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Score calculation
  const criticalCount = deduped.filter((i) => i.severity === "critical").length;
  const mediumCount = deduped.filter((i) => i.severity === "medium").length;
  const lowCount = deduped.filter((i) => i.severity === "low").length;

  const penalty = criticalCount * 20 + mediumCount * 8 + lowCount * 3;
  const score = Math.max(0, Math.min(100, 100 - penalty));

  // --- STUB: Replace this section with an Anthropic API call to generate
  // smarter, context-aware explanations for each issue. Example:
  //
  // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  // for (const issue of deduped) {
  //   const message = await anthropic.messages.create({
  //     model: "claude-opus-4-6",
  //     max_tokens: 256,
  //     messages: [{ role: "user", content: `Explain this security issue in plain English for a non-technical founder: ${issue.title}. File: ${issue.file ?? "unknown"}` }],
  //   });
  //   issue.description = message.content[0].text;
  // }
  // --- END STUB

  return {
    repo: `${owner}/${repo}`,
    score,
    issues: deduped,
    scannedAt: new Date().toISOString(),
    filesChecked,
  };
}
