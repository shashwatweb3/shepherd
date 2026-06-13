import type { ScoreTier } from "@/lib/tiers";
import { getTier } from "@/lib/tiers";
import type { Issue, IssueSeverity, ScanResult } from "@/lib/scanner-types";
import {
  scanFile,
  detectLang,
  langLabel,
  SCANNABLE_EXT,
  totalRuleCount,
} from "@/lib/rules/engine";
import { findingToIssue } from "@/lib/rules/types";

export type { ScoreTier, Issue, IssueSeverity, ScanResult };

// ── GitHub plumbing ────────────────────────────────────────────────────────
interface TreeItem {
  path: string;
  type: string;
  size?: number;
}
interface RepoInfo {
  default_branch: string;
  private: boolean;
  full_name: string;
}

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes("github.com")) return null;
    const parts = u.pathname.replace(/^\//, "").replace(/\/$/, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

async function gh(path: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Shepherd-Scanner/3.0",
  };
  if (process.env.GITHUB_TOKEN) headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  return fetch(`https://api.github.com${path}`, { headers, next: { revalidate: 0 } });
}

async function fetchFile(owner: string, repo: string, p: string): Promise<string | null> {
  try {
    const res = await gh(`/repos/${owner}/${repo}/contents/${encodeURIComponent(p)}`);
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

const isTestPath = (p: string) =>
  /\.(test|spec)\.[a-z]+$/.test(p) ||
  /(^|\/)(tests?|__tests__|fixtures|examples|e2e|mocks)\//.test(p);

// ── OSV.dev: real CVEs for the versions actually used ────────────────────────
interface OsvQuery {
  package: { name: string; ecosystem: string };
  version: string;
}

function cleanVersion(v: string): string | null {
  const m = v.match(/\d+\.\d+\.\d+/);
  return m ? m[0] : null;
}

async function queryOsv(
  deps: Record<string, string>,
  ecosystem: string
): Promise<Issue[]> {
  const queries: OsvQuery[] = [];
  for (const [name, range] of Object.entries(deps)) {
    const version = cleanVersion(range);
    if (version) queries.push({ package: { name, ecosystem }, version });
  }
  if (queries.length === 0) return [];

  try {
    const res = await fetch("https://api.osv.dev/v1/querybatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queries }),
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { results: { vulns?: { id: string }[] }[] };

    const issues: Issue[] = [];
    data.results.forEach((r, i) => {
      if (r.vulns && r.vulns.length > 0) {
        const dep = queries[i];
        const ids = r.vulns.map((v) => v.id).slice(0, 4).join(", ");
        issues.push({
          severity: "critical",
          category: "dependencies",
          title: `Known vulnerability in ${dep.package.name}`,
          roast: "This one is not a guess. It has a CVE number and everything.",
          description: `${dep.package.name}@${dep.version} has a known public vulnerability (${ids}). This came from the OSV database, not a hunch.\nHow sure are we: very. It is published.\nMore reading: https://osv.dev/vulnerability/${r.vulns[0].id}`,
          fix: `Update ${dep.package.name} to a patched version. Run your package manager's audit (npm audit, pip-audit, or cargo audit) to see the safe version.`,
          file: dep.package.ecosystem === "npm" ? "package.json" : undefined,
        });
      }
    });
    return issues;
  } catch {
    return [];
  }
}

// ── Repo-level checks (not tied to one language) ─────────────────────────────
const DEPRECATED: { name: string; reason: string; replacement?: string; severity: IssueSeverity }[] = [
  { name: "event-stream", reason: "was hijacked to steal crypto wallets back in 2018", replacement: "remove it", severity: "critical" },
  { name: "node-ipc", reason: "the author shipped code that wiped files in 2022", replacement: "remove it", severity: "critical" },
  { name: "colors", reason: "the author broke it on purpose in 2022", replacement: "chalk or kleur", severity: "critical" },
  { name: "request", reason: "no longer maintained, so no security fixes", replacement: "native fetch or axios", severity: "medium" },
  { name: "moment", reason: "retired and heavy", replacement: "date-fns or dayjs", severity: "low" },
];

const ENV_FILES = [".env", ".env.local", ".env.production", ".env.development", ".env.staging"];

// ── Main scan ────────────────────────────────────────────────────────────────
export async function scanRepo(repoUrl: string): Promise<ScanResult> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new Error("That does not look like a GitHub URL. Try https://github.com/owner/repo");
  const { owner, repo } = parsed;

  const repoRes = await gh(`/repos/${owner}/${repo}`);
  if (repoRes.status === 404) throw new Error("Could not find that repo. Is it public and spelled right?");
  if (repoRes.status === 403) throw new Error("GitHub told us to slow down. Give it a few minutes and try again.");
  if (!repoRes.ok) throw new Error(`GitHub returned ${repoRes.status}. Try again in a bit.`);

  const info: RepoInfo = await repoRes.json();
  if (info.private) throw new Error("That repo is private. For now Shepherd only scans public repos.");

  const treeRes = await gh(`/repos/${owner}/${repo}/git/trees/${info.default_branch}?recursive=1`);
  if (!treeRes.ok) throw new Error("Could not read the file list. Try again in a bit.");
  const treeData = await treeRes.json();
  const tree: TreeItem[] = treeData.tree || [];
  const files = tree.filter((f) => f.type === "blob");
  const paths = new Set(files.map((f) => f.path));

  const issues: Issue[] = [];
  let filesChecked = 0;
  let linesChecked = 0;
  const langsSeen = new Set<string>();

  // env files committed
  for (const name of ENV_FILES) {
    if (paths.has(name)) {
      issues.push({
        severity: "critical",
        category: "secrets",
        title: `${name} is committed to the repo`,
        roast: "You committed your .env. To a public repo. We will wait while you panic.",
        description: `The file ${name} is in version control. These files almost always hold keys and passwords that should never be public.\nHow sure are we: very.`,
        fix: `1. Remove it: git rm --cached ${name}\n2. Add it to .gitignore.\n3. Treat every value inside as leaked and rotate them all.`,
        file: name,
      });
    }
  }

  // .gitignore
  const gitignore = await fetchFile(owner, repo, ".gitignore");
  if (!gitignore) {
    issues.push({
      severity: "medium",
      category: "repo-health",
      title: "No .gitignore",
      roast: "One careless 'git add .' away from leaking everything.",
      description: "Without a .gitignore, secret files and build junk can slip into the repo by accident.\nHow sure are we: very.",
      fix: "Add a .gitignore with at least: .env, .env.*, node_modules/, dist/, .next/",
    });
  } else if (!gitignore.includes(".env")) {
    issues.push({
      severity: "medium",
      category: "repo-health",
      title: ".env is not in .gitignore",
      roast: "The safety is off and .env is one commit from going public.",
      description: "Your .gitignore does not list .env, so it can be committed by accident.\nHow sure are we: very.",
      fix: "Add these lines to .gitignore: .env and .env.*",
      file: ".gitignore",
    });
  }

  // README
  if (!files.some((f) => /^readme\.md$/i.test(f.path))) {
    issues.push({
      severity: "low",
      category: "repo-health",
      title: "No README",
      roast: "Future you opens this in six months and has no idea what it does.",
      description: "A README tells people (and future you) what this is and how to run it.\nHow sure are we: very.",
      fix: "Add a README with what it does, how to run it, and what env vars it needs.",
    });
  }

  // package.json + npm CVEs
  const pkgRaw = await fetchFile(owner, repo, "package.json");
  if (pkgRaw) {
    try {
      const pkg = JSON.parse(pkgRaw) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

      const wild = Object.entries(all).filter(([, v]) => v === "*" || v === "latest");
      if (wild.length) {
        issues.push({
          severity: "medium",
          category: "dependencies",
          title: `${wild.length} package(s) pinned to "latest" or "*"`,
          roast: '"latest" is not a version. It is a wish.',
          description: `These can change under you on the next install: ${wild.map(([n]) => n).join(", ")}.\nHow sure are we: very.`,
          fix: "Pin real version numbers and commit your lockfile.",
          file: "package.json",
        });
      }
      for (const d of DEPRECATED) {
        if (all[d.name]) {
          issues.push({
            severity: d.severity,
            category: "dependencies",
            title: `Risky package: ${d.name}`,
            roast: d.severity === "critical" ? `${d.name} has a bad history. Get it out.` : `${d.name} has better replacements now.`,
            description: `${d.name} ${d.reason}.\nHow sure are we: very.`,
            fix: d.replacement ? `Replace it with ${d.replacement}.` : `Remove ${d.name}.`,
            file: "package.json",
          });
        }
      }
      // real CVEs
      const cve = await queryOsv(all, "npm");
      issues.push(...cve);
    } catch {
      // ignore unparseable package.json
    }
  }

  // Cargo.toml CVEs (Rust)
  const cargoRaw = await fetchFile(owner, repo, "Cargo.toml");
  if (cargoRaw) {
    const deps: Record<string, string> = {};
    const depSection = cargoRaw.split(/\[dependencies\]/)[1]?.split(/\n\[/)[0] ?? "";
    for (const line of depSection.split("\n")) {
      const m = line.match(/^\s*([a-zA-Z0-9_\-]+)\s*=\s*"([^"]+)"/);
      if (m) deps[m[1]] = m[2];
    }
    const cve = await queryOsv(deps, "crates.io");
    issues.push(...cve);
  }

  // ── Source-file scanning via the multi-language engine ─────────────────────
  const toScan = files
    .filter((f) => {
      const ext = f.path.split(".").pop()?.toLowerCase() ?? "";
      const skip = /^(node_modules|\.git|dist|build|out|vendor|target|\.next)\//.test(f.path);
      return SCANNABLE_EXT.has(ext) && !skip && (f.size ?? 0) < 200_000;
    })
    .slice(0, 120);

  for (const f of toScan) {
    const lang = detectLang(f.path);
    if (!lang) continue;
    const content = await fetchFile(owner, repo, f.path);
    if (!content) continue;

    filesChecked++;
    linesChecked += content.split("\n").length;
    langsSeen.add(langLabel(lang));

    const out = scanFile({
      path: f.path,
      content,
      lang,
      isTest: isTestPath(f.path),
      allPaths: paths,
    });
    for (const finding of out.findings) issues.push(findingToIssue(finding));
  }

  // ── Dedupe, score, return ──────────────────────────────────────────────────
  const seen = new Set<string>();
  const deduped = issues.filter((i) => {
    const key = `${i.title}|${i.file ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const crit = deduped.filter((i) => i.severity === "critical").length;
  const med = deduped.filter((i) => i.severity === "medium").length;
  const low = deduped.filter((i) => i.severity === "low").length;

  const penalty = crit * 16 + med * 6 + low * 2;
  const score = Math.max(0, Math.min(100, 100 - penalty));

  // "checks passed" = rules that ran but did not fire, kept honest and simple
  const rulesRun = totalRuleCount();
  const checksPassed = Math.max(0, rulesRun - new Set(deduped.map((i) => i.title)).size);

  return {
    repo: info.full_name,
    score,
    tier: getTier(score),
    issues: deduped.sort((a, b) => sevRank(a.severity) - sevRank(b.severity)),
    scannedAt: new Date().toISOString(),
    filesChecked,
    linesChecked,
    rulesRun,
    checksPassed,
    languages: Array.from(langsSeen).sort(),
  };
}

function sevRank(s: IssueSeverity): number {
  return s === "critical" ? 0 : s === "medium" ? 1 : 2;
}
