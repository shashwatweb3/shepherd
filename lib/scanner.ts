export type IssueSeverity = "critical" | "medium" | "low";

export interface Issue {
  severity: IssueSeverity;
  title: string;
  roast: string;
  description: string;
  fix: string;
  file?: string;
  category: IssueCategory;
}

export type IssueCategory =
  | "secrets"
  | "dependencies"
  | "auth"
  | "security"
  | "supabase"
  | "repo-health"
  | "code-quality";

export interface ScanResult {
  repo: string;
  score: number;
  tier: ScoreTier;
  issues: Issue[];
  scannedAt: string;
  filesChecked: number;
}

export type ScoreTier =
  | "immortal"    // 90–100
  | "mostly-alive"   // 70–89
  | "limping"        // 50–69
  | "one-deploy"     // 30–49
  | "call-the-vet";  // 0–29

export function getTier(score: number): ScoreTier {
  if (score >= 90) return "immortal";
  if (score >= 70) return "mostly-alive";
  if (score >= 50) return "limping";
  if (score >= 30) return "one-deploy";
  return "call-the-vet";
}

export const TIER_LABELS: Record<ScoreTier, string> = {
  "immortal": "Immortal Sheep 🛡️",
  "mostly-alive": "Mostly Alive",
  "limping": "Limping Along",
  "one-deploy": "One Deploy From Disaster",
  "call-the-vet": "Call the Vet 💀",
};

export const TIER_COLORS: Record<ScoreTier, string> = {
  "immortal": "#16A34A",
  "mostly-alive": "#16A34A",
  "limping": "#D97706",
  "one-deploy": "#DC2626",
  "call-the-vet": "#DC2626",
};

// ── Secret patterns ────────────────────────────────────────────────────────────
interface SecretPattern {
  pattern: RegExp;
  title: string;
  roast: string;
  description: string;
  fix: string;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    pattern: /sk-[a-zA-Z0-9]{20,}/,
    title: "OpenAI API key exposed",
    roast: "Congratulations, you're now funding a stranger's GPT-4 hobby project.",
    description: "An OpenAI secret key (sk-...) was found in source code. Anyone with this key can make API calls billed to your account.",
    fix: "1. Rotate immediately at platform.openai.com/api-keys\n2. Remove from code\n3. Add to .env as OPENAI_API_KEY\n4. Add .env to .gitignore",
  },
  {
    pattern: /sk_live_[a-zA-Z0-9]{20,}/,
    title: "Stripe live secret key exposed",
    roast: "You've published the keys to your money. Bold strategy.",
    description: "A Stripe live secret key was found in source code. This gives anyone full access to your Stripe account — charges, refunds, data.",
    fix: "1. Rotate immediately at dashboard.stripe.com/apikeys\n2. Remove from code\n3. Use process.env.STRIPE_SECRET_KEY\n4. Never use live keys in client-side code",
  },
  {
    pattern: /pk_live_[a-zA-Z0-9]{20,}/,
    title: "Stripe live publishable key exposed in server code",
    roast: "Publishable keys are less scary, but still — tidy up.",
    description: "A Stripe live publishable key was found in server-side code. Publishable keys are meant for clients, but hardcoding them still prevents easy rotation.",
    fix: "Move to process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and reference from there.",
  },
  {
    pattern: /sk-ant-[a-zA-Z0-9\-]{20,}/,
    title: "Anthropic API key exposed",
    roast: "Even AI has limits. The person who found this key doesn't.",
    description: "An Anthropic API key was found in source code. Anyone with this can make API calls billed to your account.",
    fix: "1. Rotate at console.anthropic.com\n2. Remove from code\n3. Use process.env.ANTHROPIC_API_KEY",
  },
  {
    pattern: /AKIA[0-9A-Z]{16}/,
    title: "AWS Access Key ID exposed",
    roast: "Your cloud bill is about to become someone else's crypto mine.",
    description: "An AWS access key ID was found in source code. Combined with the secret key, this gives full programmatic access to your AWS account.",
    fix: "1. Deactivate in AWS IAM Console immediately\n2. Check CloudTrail for unauthorized usage\n3. Use IAM roles or AWS Secrets Manager\n4. Never commit AWS credentials",
  },
  {
    pattern: /ghp_[a-zA-Z0-9]{36}/,
    title: "GitHub Personal Access Token exposed",
    roast: "Someone now has write access to your repos. Hopefully it's a friend.",
    description: "A GitHub PAT was found in source code. This token can read/write repos, depending on its scope.",
    fix: "1. Revoke at github.com/settings/tokens\n2. Audit recent repo activity\n3. Use GitHub Actions secrets or environment variables instead",
  },
  {
    pattern: /service_role[^"'\n]{0,20}eyJ[a-zA-Z0-9_-]{20,}/,
    title: "Supabase service_role key exposed",
    roast: "You've handed out the master key to your database. To the internet.",
    description: "The Supabase service_role key bypasses Row Level Security entirely. Anyone with this key can read, write, or delete all your data.",
    fix: "1. Rotate in Supabase dashboard → Settings → API\n2. The service_role key must NEVER go client-side\n3. Only use it in server-side code via environment variables",
  },
  {
    pattern: /AIza[0-9A-Za-z\-_]{35}/,
    title: "Firebase/Google API key exposed",
    roast: "Google knows. Google always knows. Now so does everyone else.",
    description: "A Firebase or Google API key was found in source code. Depending on restrictions, this can allow unauthorized use of Firebase services.",
    fix: "1. Restrict the key in Google Cloud Console → APIs & Services → Credentials\n2. Move to environment variables\n3. Enable app/domain restrictions",
  },
  {
    pattern: /mongodb(\+srv)?:\/\/[^"'\s]{10,}/i,
    title: "MongoDB connection string exposed",
    roast: "Whole database, free for anyone who reads this line.",
    description: "A MongoDB connection string including credentials was found in source code.",
    fix: "1. Change your database password immediately in MongoDB Atlas\n2. Move the connection string to process.env.MONGODB_URI\n3. Review database access logs for unauthorized queries",
  },
  {
    pattern: /postgres(?:ql)?:\/\/[^"'\s]{10,}/i,
    title: "PostgreSQL connection string exposed",
    roast: "SELECT * FROM your_users WHERE oops = true;",
    description: "A PostgreSQL connection string including credentials was found in source code.",
    fix: "1. Rotate database password immediately\n2. Use process.env.DATABASE_URL\n3. Consider connection pooling (PgBouncer, Supabase pooler)",
  },
  {
    pattern: /twilio[^"'\n]{0,30}SK[0-9a-fA-F]{32}/i,
    title: "Twilio API key exposed",
    roast: "Your SMS budget just became a stranger's marketing tool.",
    description: "A Twilio API key was found in source code.",
    fix: "1. Revoke in Twilio Console\n2. Use process.env.TWILIO_AUTH_TOKEN\n3. Set spending limits in Twilio dashboard",
  },
  {
    pattern: /SG\.[a-zA-Z0-9\-_]{22}\.[a-zA-Z0-9\-_]{43}/,
    title: "SendGrid API key exposed",
    roast: "Spam campaigns, courtesy of you. Congrats on your new hobby.",
    description: "A SendGrid API key was found in source code. This allows sending emails from your account.",
    fix: "1. Delete key at app.sendgrid.com/settings/api_keys\n2. Create a new restricted key\n3. Use process.env.SENDGRID_API_KEY",
  },
  {
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+/,
    title: "Slack webhook URL exposed",
    roast: "Your Slack channel is now open for unsolicited motivational messages.",
    description: "A Slack incoming webhook URL was found in source code. Anyone can send messages to your Slack workspace.",
    fix: "1. Revoke at api.slack.com/apps → Incoming Webhooks\n2. Create a new webhook\n3. Move to environment variable",
  },
  {
    pattern: /https:\/\/discord\.com\/api\/webhooks\/[0-9]+\/[a-zA-Z0-9_-]+/,
    title: "Discord webhook URL exposed",
    roast: "Someone's about to drop a wall of text in your Discord. It won't be nice.",
    description: "A Discord webhook URL was found in source code. Anyone can post messages to your Discord channel.",
    fix: "1. Delete webhook in Discord Channel Settings → Integrations\n2. Create a new webhook\n3. Store as environment variable",
  },
  {
    pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    title: "Private key committed to repo",
    roast: "This is the nuclear option of bad security practices. You did it.",
    description: "A private key was found in the repository. This can be used to impersonate your server, decrypt traffic, or gain unauthorized access.",
    fix: "1. Consider this key permanently compromised — revoke/replace it\n2. Rotate any certificates using this key\n3. Check git history: `git log --all --full-history -- '**/*.pem'`\n4. If exposed on GitHub, assume it's already been scraped",
  },
  {
    pattern: /jwt[^"'\n]{0,20}["'][a-zA-Z0-9]{16,}["']/i,
    title: "Hardcoded JWT secret",
    roast: "Your JWT secret is in the repo. Every token you ever issued is now forgeable.",
    description: "A hardcoded JWT signing secret was found. Anyone who reads this can forge authentication tokens for any user.",
    fix: "1. Rotate: generate a new 256-bit secret: `openssl rand -base64 32`\n2. Move to process.env.JWT_SECRET\n3. Invalidate all existing tokens by changing the secret",
  },
];

// ── Deprecated / abandoned packages ───────────────────────────────────────────
const DEPRECATED_PACKAGES: { name: string; reason: string; replacement?: string }[] = [
  { name: "event-stream", reason: "supply-chain compromised (2018)", replacement: "N/A — remove it" },
  { name: "flatmap-stream", reason: "malicious package (2018)" },
  { name: "colors", reason: "author intentionally sabotaged it (2022)", replacement: "chalk or kleur" },
  { name: "node-ipc", reason: "author added destructive payload (2022)", replacement: "N/A — remove it" },
  { name: "request", reason: "deprecated since 2020, no security patches", replacement: "node-fetch, axios, or native fetch" },
  { name: "moment", reason: "deprecated, 300KB bundle size", replacement: "date-fns or dayjs" },
  { name: "lodash", reason: "often misused as full import (+70KB)", replacement: "import specific functions: lodash/get" },
  { name: "crypto-js", reason: "slow, outdated, use built-in Node crypto instead", replacement: "Node.js built-in `crypto`" },
  { name: "node-uuid", reason: "deprecated — use uuid instead", replacement: "uuid or crypto.randomUUID()" },
  { name: "bcrypt", reason: "native bindings can break across Node versions", replacement: "bcryptjs (pure JS) or argon2" },
];

// ── Boilerplate signatures ─────────────────────────────────────────────────────
const BOILERPLATE_SIGNATURES = [
  "lovable",
  "bolt.new",
  "replit",
  "generated by cursor",
  "this app was created with",
  "// Generated by",
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

interface GitHubCommit {
  commit: { message: string };
}

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url.trim());
    if (!parsed.hostname.includes("github.com")) return null;
    const parts = parsed.pathname.replace(/^\//, "").replace(/\/$/, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

async function fetchGitHub(path: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Shepherd-Scanner/2.0",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return fetch(`https://api.github.com${path}`, {
    headers,
    next: { revalidate: 0 },
  });
}

async function fetchFileContent(owner: string, repo: string, filePath: string): Promise<string | null> {
  try {
    const res = await fetchGitHub(`/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`);
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

function scanForSecrets(content: string, filePath: string): Issue[] {
  const issues: Issue[] = [];
  for (const p of SECRET_PATTERNS) {
    if (p.pattern.test(content)) {
      issues.push({
        severity: "critical",
        category: "secrets",
        title: p.title,
        roast: p.roast,
        description: p.description,
        fix: p.fix,
        file: filePath,
      });
    }
  }
  return issues;
}

export async function scanRepo(repoUrl: string): Promise<ScanResult> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    throw new Error("Invalid GitHub URL. Try: https://github.com/owner/repo");
  }
  const { owner, repo } = parsed;

  // ── Fetch repo metadata ──────────────────────────────────────────────────────
  const repoRes = await fetchGitHub(`/repos/${owner}/${repo}`);
  if (repoRes.status === 404) throw new Error("Repo not found. Is it public?");
  if (repoRes.status === 403) throw new Error("GitHub rate limit hit. Try again in a few minutes.");
  if (!repoRes.ok) throw new Error(`GitHub returned ${repoRes.status}. Try again.`);

  const repoInfo: GitHubRepoInfo = await repoRes.json();
  if (repoInfo.private) throw new Error("This repo is private. Shepherd only scans public repos for now.");

  // ── Fetch file tree ──────────────────────────────────────────────────────────
  const treeRes = await fetchGitHub(
    `/repos/${owner}/${repo}/git/trees/${repoInfo.default_branch}?recursive=1`
  );
  if (!treeRes.ok) throw new Error("Could not fetch file tree. Try again.");

  const treeData = await treeRes.json();
  const tree: GitHubTreeItem[] = treeData.tree || [];
  const files = tree.filter((f) => f.type === "blob");
  const filePaths = new Set(files.map((f) => f.path));

  const issues: Issue[] = [];
  let filesChecked = 0;
  let totalTodos = 0;

  // ── .env files committed ────────────────────────────────────────────────────
  const envFileNames = [".env", ".env.local", ".env.production", ".env.development", ".env.staging"];
  for (const name of envFileNames) {
    if (filePaths.has(name)) {
      issues.push({
        severity: "critical",
        category: "secrets",
        title: `.env file committed (${name})`,
        roast: "You committed the .env file. To a public repo. On the internet. We'll give you a minute.",
        description: `The file "${name}" is in version control. .env files almost always contain API keys, database passwords, and other secrets that should never be public.`,
        fix: `1. Remove: git rm --cached ${name} && git commit -m "remove committed env file"\n2. Add to .gitignore: echo "${name}" >> .gitignore\n3. Rotate EVERY credential that was in that file — assume they're compromised\n4. Check git history: git log --oneline --all -- ${name}`,
        file: name,
      });
    }
  }

  // ── .gitignore checks ────────────────────────────────────────────────────────
  const gitignoreContent = await fetchFileContent(owner, repo, ".gitignore");
  if (!gitignoreContent) {
    issues.push({
      severity: "medium",
      category: "repo-health",
      title: "No .gitignore file",
      roast: "No .gitignore? You're one fat-fingered `git add .` away from committing your secrets.",
      description: "Without .gitignore, build artifacts, node_modules, and secret files can be accidentally committed.",
      fix: 'Create .gitignore with at minimum:\n```\n.env\n.env.*\nnode_modules/\n.next/\ndist/\n*.log\n```\nOr use gitignore.io to generate one for your stack.',
    });
  } else {
    if (!gitignoreContent.includes(".env")) {
      issues.push({
        severity: "medium",
        category: "repo-health",
        title: ".env not in .gitignore",
        roast: "The gun is loaded. The safety is off. .env is one commit away.",
        description: ".gitignore exists but doesn't include .env. Secrets are one `git add .` away from being public.",
        fix: 'Add these lines to .gitignore:\n```\n.env\n.env.local\n.env.*.local\n.env.production\n```',
        file: ".gitignore",
      });
    }
    if (!gitignoreContent.includes("node_modules")) {
      issues.push({
        severity: "low",
        category: "repo-health",
        title: "node_modules not in .gitignore",
        roast: "Your repo must be delightfully huge right now.",
        description: "node_modules should always be in .gitignore. Committing it bloats the repo and can cause platform-specific binary issues.",
        fix: 'Add to .gitignore:\n```\nnode_modules/\n```\nThen: git rm -r --cached node_modules && git commit -m "remove node_modules"',
        file: ".gitignore",
      });
    }
  }

  // ── README check ─────────────────────────────────────────────────────────────
  const hasReadme = files.some((f) => /^readme\.md$/i.test(f.path));
  if (!hasReadme) {
    issues.push({
      severity: "low",
      category: "repo-health",
      title: "No README.md",
      roast: "No README. Future you will open this repo in 6 months and have absolutely no idea what it does.",
      description: "A README helps contributors (and future you) understand what the project does, how to run it, and how to deploy it.",
      fix: "Create README.md with at minimum:\n- What it does\n- How to run locally\n- Required environment variables\n- How to deploy",
    });
  }

  // ── package.json analysis ────────────────────────────────────────────────────
  const pkgContent = await fetchFileContent(owner, repo, "package.json");
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = pkg.dependencies ?? {};
      const devDeps = pkg.devDependencies ?? {};
      const allDeps = { ...deps, ...devDeps };
      const depCount = Object.keys(allDeps).length;

      if (depCount > 80) {
        issues.push({
          severity: "low",
          category: "dependencies",
          title: `Dependency sprawl (${depCount} packages)`,
          roast: `${depCount} dependencies. Each one a tiny door into your app. Sleep well.`,
          description: "Large dependency trees increase attack surface, bundle size, and the chance of a supply-chain compromise.",
          fix: "Run `npx depcheck` to find unused dependencies and remove them. Audit with `npm audit` regularly.",
          file: "package.json",
        });
      }

      // Wildcard / floating versions
      const wildcardDeps = Object.entries(allDeps).filter(([, v]) => v === "*" || v === "latest" || v === "x");
      if (wildcardDeps.length > 0) {
        issues.push({
          severity: "medium",
          category: "dependencies",
          title: `Unpinned dependency versions (${wildcardDeps.length} packages using * or latest)`,
          roast: `"latest" is not a version. It's a prayer.`,
          description: `Packages using * or "latest" can silently break your app on the next npm install. Found: ${wildcardDeps.map(([n]) => n).join(", ")}`,
          fix: 'Pin versions: replace "*" and "latest" with exact versions from `npm info <package> version`. Use `npm shrinkwrap` or commit your lockfile.',
          file: "package.json",
        });
      }

      // Deprecated/abandoned packages
      for (const { name, reason, replacement } of DEPRECATED_PACKAGES) {
        if (allDeps[name]) {
          issues.push({
            severity: "critical",
            category: "dependencies",
            title: `Dangerous or deprecated package: ${name}`,
            roast: `You're using ${name}. That's a choice.`,
            description: `"${name}" is flagged: ${reason}.`,
            fix: replacement
              ? `Replace with: ${replacement}\nRun: npm uninstall ${name} && npm install ${replacement.split(" or ")[0].trim()}`
              : `Remove: npm uninstall ${name}`,
            file: "package.json",
          });
        }
      }

      // No lockfile
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
          category: "dependencies",
          title: "No lockfile committed",
          roast: "No lockfile means every `npm install` is a blind date with your dependencies.",
          description: "Without a lockfile, you can't guarantee reproducible installs. Different environments may get different (possibly vulnerable) versions.",
          fix: "Run `npm install` to generate package-lock.json, then commit it. Never add lockfiles to .gitignore.",
        });
      }
    } catch {
      // malformed package.json
    }
  }

  // ── Tests check ───────────────────────────────────────────────────────────────
  const hasTests = files.some(
    (f) =>
      f.path.includes("__tests__") ||
      f.path.includes(".test.") ||
      f.path.includes(".spec.") ||
      f.path.includes("/test/") ||
      f.path.includes("/tests/")
  );
  if (!hasTests) {
    issues.push({
      severity: "low",
      category: "repo-health",
      title: "No tests found",
      roast: "No tests. The vibe-coded experience is complete.",
      description: "No test files found. Without tests, every change is a live experiment on your users.",
      fix: "Start small: add Vitest or Jest, write one test for your most critical function. Something is better than nothing.",
    });
  }

  // ── Source file scanning ──────────────────────────────────────────────────────
  const sourceExtensions = /\.(ts|tsx|js|jsx|mjs|cjs|py|rb|go|php|java|env\.example|sql)$/;
  const skipDirs = /^(node_modules|\.git|\.next|dist|build|out|vendor)\//;
  const filesToScan = files
    .filter((f) => sourceExtensions.test(f.path) && !skipDirs.test(f.path))
    .slice(0, 50);

  // Track per-file issues to avoid duplication
  const authRateLimitFlagged = new Set<string>();
  const supabaseFlagged = new Set<string>();
  const corsStarFlagged = new Set<string>();

  for (const file of filesToScan) {
    const content = await fetchFileContent(owner, repo, file.path);
    if (!content) continue;
    filesChecked++;

    // Secrets
    const secretIssues = scanForSecrets(content, file.path);
    issues.push(...secretIssues);

    // TODO/FIXME density
    const todos = content.match(/\b(TODO|FIXME|HACK|XXX)\b/gi);
    totalTodos += todos ? todos.length : 0;

    // eval() usage
    if (/\beval\s*\(/.test(content)) {
      issues.push({
        severity: "critical",
        category: "security",
        title: "eval() usage detected",
        roast: "eval() is a remote code execution waiting to happen. Whoever approved this PR owes us an apology.",
        description: "eval() executes arbitrary strings as code. If any user input reaches it, attackers can run arbitrary code on your server.",
        fix: "Remove eval(). Almost every use case has a safer alternative:\n- JSON: use JSON.parse()\n- Dynamic imports: use import()\n- Math: use a safe expression parser like `expr-eval`",
        file: file.path,
      });
    }

    // dangerouslySetInnerHTML
    if (content.includes("dangerouslySetInnerHTML")) {
      issues.push({
        severity: "medium",
        category: "security",
        title: "dangerouslySetInnerHTML used",
        roast: "The API is literally called 'dangerously'. That's not a warning. That's a confession.",
        description: "dangerouslySetInnerHTML injects raw HTML, enabling XSS attacks if the content comes from user input or an external source.",
        fix: "If you must render HTML, sanitize it first:\n```\nnpm install dompurify\nimport DOMPurify from 'dompurify';\n<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />\n```",
        file: file.path,
      });
    }

    // SQL string concatenation
    if (/query\s*[+=]\s*["'`].*\$\{|["'`]\s*\+\s*\w+.*WHERE/i.test(content)) {
      issues.push({
        severity: "critical",
        category: "security",
        title: "Possible SQL injection via string concatenation",
        roast: "'; DROP TABLE users; -- is not a hypothetical. It's a Tuesday.",
        description: "SQL queries built by concatenating user input are vulnerable to SQL injection — one of the oldest and most destructive web vulnerabilities.",
        fix: "Use parameterized queries:\n```\n// Bad: db.query('SELECT * FROM users WHERE id = ' + userId)\n// Good: db.query('SELECT * FROM users WHERE id = $1', [userId])\n```\nOr use an ORM (Prisma, Drizzle) that handles this automatically.",
        file: file.path,
      });
    }

    // console.log of sensitive vars
    if (/console\.log\([^)]*(?:password|secret|token|key|auth)[^)]*\)/i.test(content)) {
      issues.push({
        severity: "medium",
        category: "security",
        title: "console.log of sensitive variable",
        roast: "console.log('password:', password) — a debugging classic. A security nightmare.",
        description: "Logging sensitive values (passwords, tokens, keys) can expose them in server logs, browser dev tools, or error monitoring services.",
        fix: "Remove all console.log statements containing sensitive data before deploying. Use a proper logger (winston, pino) with log level controls that prevent sensitive data from reaching production.",
        file: file.path,
      });
    }

    // CORS star
    if (!corsStarFlagged.has(file.path) && /cors[^"'\n]{0,50}["']\*["']/i.test(content)) {
      corsStarFlagged.add(file.path);
      issues.push({
        severity: "medium",
        category: "security",
        title: "CORS set to wildcard (*)",
        roast: "CORS: *. Translated: 'Any website on the internet can make requests as your users.' Cozy.",
        description: "Setting CORS to * allows any domain to make cross-origin requests to your API, enabling CSRF-style attacks.",
        fix: "Restrict to your actual domain:\n```\ncors({ origin: process.env.ALLOWED_ORIGIN || 'https://yourdomain.com' })\n```",
        file: file.path,
      });
    }

    // Auth without rate limiting
    if (
      !authRateLimitFlagged.has(file.path) &&
      (content.includes("/api/auth") || content.includes("signIn(") || /\blogin\b/i.test(content)) &&
      !content.includes("rateLimit") &&
      !content.includes("rate-limit") &&
      !content.includes("rate_limit") &&
      !content.includes("@upstash/ratelimit") &&
      !content.includes("express-rate-limit") &&
      !content.includes("limiter")
    ) {
      authRateLimitFlagged.add(file.path);
      issues.push({
        severity: "medium",
        category: "auth",
        title: "Auth endpoint without rate limiting",
        roast: "No rate limiting on login. Script kiddie tools are already warming up.",
        description: "Authentication endpoints without rate limiting are vulnerable to brute-force attacks. An attacker can try millions of password combinations.",
        fix: "Add rate limiting with Upstash:\n```\nnpm install @upstash/ratelimit @upstash/redis\nconst ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m') });\n```\nOr use middleware: next-rate-limit, express-rate-limit",
        file: file.path,
      });
    }

    // Password without bcrypt/argon2
    if (
      /password/i.test(content) &&
      !content.includes("bcrypt") &&
      !content.includes("argon2") &&
      !content.includes("scrypt") &&
      !content.includes("pbkdf2") &&
      /hash|store|save|insert/i.test(content) &&
      file.path.match(/\.(ts|js|py|rb|php)$/)
    ) {
      issues.push({
        severity: "critical",
        category: "auth",
        title: "Passwords may not be hashed",
        roast: "If you're storing plain-text passwords, we need to have a talk. A long one.",
        description: "Code handling passwords doesn't appear to use a proper hashing library (bcrypt, argon2, scrypt). Storing plain-text passwords means a database breach exposes every user's password.",
        fix: "Hash passwords before storing:\n```\nnpm install bcryptjs\nimport bcrypt from 'bcryptjs';\nconst hash = await bcrypt.hash(password, 12); // store hash\nconst valid = await bcrypt.compare(input, hash); // verify\n```",
        file: file.path,
      });
    }

    // JWT algorithm:none
    if (/algorithm[s]?\s*:\s*["']none["']/i.test(content) || /alg[^"'\n]{0,10}["']none["']/i.test(content)) {
      issues.push({
        severity: "critical",
        category: "auth",
        title: 'JWT "none" algorithm — authentication bypass',
        roast: 'JWT with algorithm "none" means "no signature required". Meaning anyone can log in as anyone. Good luck.',
        description: 'Setting JWT algorithm to "none" disables signature verification entirely, allowing anyone to forge tokens for any user.',
        fix: 'Remove "none" from allowed algorithms. Use RS256 or HS256:\n```\njwt.verify(token, secret, { algorithms: ["HS256"] })\n```',
        file: file.path,
      });
    }

    // Supabase key + RLS hint
    if (
      !supabaseFlagged.has(file.path) &&
      (content.includes("supabase") || content.includes("SUPABASE")) &&
      content.includes("NEXT_PUBLIC_") &&
      !content.includes("rls") &&
      !content.includes("Row Level Security")
    ) {
      supabaseFlagged.add(file.path);
      issues.push({
        severity: "medium",
        category: "supabase",
        title: "Supabase client key present — verify RLS is enabled",
        roast: "Supabase anon key in client code is fine IF your RLS policies are tight. Are they? Really?",
        description: "The Supabase anon key is client-side (expected), but we couldn't find evidence of Row Level Security policies. Without RLS, any user can query all rows in all tables.",
        fix: "In Supabase dashboard:\n1. Go to Database → Tables → [your table] → RLS\n2. Enable RLS\n3. Add policies: 'Users can only read their own data'\n4. Test with a different user account",
        file: file.path,
      });
    }

    // Security headers
    if (
      file.path.match(/next\.config\.(js|mjs|ts)$/) &&
      !content.includes("headers") &&
      !content.includes("Content-Security-Policy")
    ) {
      issues.push({
        severity: "low",
        category: "security",
        title: "No security headers configured",
        roast: "No security headers. Your app is serving content with the energy of an unlocked front door.",
        description: "Missing headers like Content-Security-Policy, X-Frame-Options, and X-Content-Type-Options leave users exposed to XSS, clickjacking, and MIME-type attacks.",
        fix: "Add to next.config.js:\n```\nheaders: async () => [{\n  source: '/(.*)',\n  headers: [\n    { key: 'X-Frame-Options', value: 'DENY' },\n    { key: 'X-Content-Type-Options', value: 'nosniff' },\n    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },\n  ]\n}]\n```",
        file: file.path,
      });
    }

    // Boilerplate still present
    const contentLower = content.toLowerCase();
    for (const sig of BOILERPLATE_SIGNATURES) {
      if (contentLower.includes(sig.toLowerCase())) {
        issues.push({
          severity: "low",
          category: "repo-health",
          title: "AI boilerplate / platform template not cleaned up",
          roast: `Still has "${sig}" in the code. Ship it, but maybe clean the scaffolding off first.`,
          description: "Template or boilerplate code was found. This isn't dangerous, but it means you might be running code you don't fully understand.",
          fix: "Review and clean up template files. Delete example code, placeholder comments, and default configurations that aren't relevant to your app.",
          file: file.path,
        });
        break;
      }
    }
  }

  // ── Commit message quality ───────────────────────────────────────────────────
  try {
    const commitsRes = await fetchGitHub(`/repos/${owner}/${repo}/commits?per_page=20`);
    if (commitsRes.ok) {
      const commits: GitHubCommit[] = await commitsRes.json();
      if (Array.isArray(commits) && commits.length > 3) {
        const messages = commits.map((c) => c.commit.message.split("\n")[0].toLowerCase().trim());
        const slopMessages = messages.filter((m) =>
          /^(update|fix|wip|changes|stuff|misc|test|asdf|asd|commit|save|work|oops|typo|cleanup|clean up|temp|.)$/.test(m) ||
          m.startsWith("ai:") ||
          m.includes("generated by") ||
          m.includes("cursor") ||
          (m.length < 8)
        );
        if (slopMessages.length / messages.length > 0.5) {
          issues.push({
            severity: "low",
            category: "repo-health",
            title: "Low-quality commit messages",
            roast: `${slopMessages.length} of your last ${messages.length} commits are just "${slopMessages[0]}". Your git log is a cry for help.`,
            description: "Most recent commits have vague messages like 'update', 'fix', or 'wip'. Good commit messages are the only free documentation you'll ever get.",
            fix: "Use conventional commits: feat:, fix:, docs:, chore:, refactor:\nExample: 'fix: prevent duplicate email signup on /api/auth/register'\nSet up commitlint to enforce this automatically.",
          });
        }
      }
    }
  } catch {
    // non-blocking
  }

  // ── TODO density ───────────────────────────────────────────────────────────
  if (filesChecked > 0 && totalTodos / filesChecked > 3) {
    issues.push({
      severity: "low",
      category: "code-quality",
      title: `High TODO/FIXME density (${totalTodos} across ${filesChecked} files)`,
      roast: `${totalTodos} TODOs. That's not a backlog. That's a confession.`,
      description: "High density of TODO/FIXME comments suggests known technical debt that hasn't been addressed. Some of these might be security-relevant.",
      fix: "Run: grep -r 'TODO\\|FIXME\\|HACK' src/ to get a full list. Triage: which ones are security-relevant? Fix those first. Create GitHub issues for the rest.",
    });
  }

  // ── Deduplication ─────────────────────────────────────────────────────────
  const seen = new Set<string>();
  const deduped = issues.filter((issue) => {
    const key = `${issue.title}:${issue.file ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ── Scoring ───────────────────────────────────────────────────────────────
  const criticalCount = deduped.filter((i) => i.severity === "critical").length;
  const mediumCount = deduped.filter((i) => i.severity === "medium").length;
  const lowCount = deduped.filter((i) => i.severity === "low").length;

  // Recalibrated weights: critical hits hard, medium moderate, low minor
  const penalty = criticalCount * 18 + mediumCount * 7 + lowCount * 2;
  const score = Math.max(0, Math.min(100, 100 - penalty));

  return {
    repo: `${owner}/${repo}`,
    score,
    tier: getTier(score),
    issues: deduped,
    scannedAt: new Date().toISOString(),
    filesChecked,
  };
}
