"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import VibeSheep from "@/components/mascots/VibeSheep";

// ── Section data ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "how-it-works", label: "How it works" },
  { id: "survival-score", label: "Survival Score" },
  { id: "rule-catalog", label: "Rule Catalog" },
  { id: "limitations", label: "Limitations" },
  { id: "privacy", label: "Privacy" },
  { id: "faq", label: "FAQ" },
];

// ── Rule catalog (manually maintained — scanner v2 checks) ──────────────────
const RULES = [
  // Secrets
  { id: "sec-openai-key",       category: "Secrets",      severity: "critical", title: "OpenAI API key exposed",        desc: "OPENAI_API_KEY pattern found in source files." },
  { id: "sec-stripe-key",       category: "Secrets",      severity: "critical", title: "Stripe secret key exposed",     desc: "sk_live_ or sk_test_ key found in source files." },
  { id: "sec-anthropic-key",    category: "Secrets",      severity: "critical", title: "Anthropic API key exposed",     desc: "sk-ant- key found in source files." },
  { id: "sec-aws-key",          category: "Secrets",      severity: "critical", title: "AWS access key exposed",        desc: "AKIA... AWS access key ID found." },
  { id: "sec-github-pat",       category: "Secrets",      severity: "critical", title: "GitHub PAT exposed",            desc: "ghp_... or github_pat_ token found." },
  { id: "sec-supabase-service", category: "Secrets",      severity: "critical", title: "Supabase service key exposed",  desc: "service_role key found — grants admin DB access." },
  { id: "sec-firebase-key",     category: "Secrets",      severity: "critical", title: "Firebase private key exposed",  desc: "Firebase private_key found in source." },
  { id: "sec-mongodb-uri",      category: "Secrets",      severity: "critical", title: "MongoDB URI exposed",           desc: "mongodb+srv:// connection string with credentials." },
  { id: "sec-postgres-uri",     category: "Secrets",      severity: "critical", title: "Postgres URL with credentials", desc: "postgresql:// URI with user:password found." },
  { id: "sec-twilio-key",       category: "Secrets",      severity: "critical", title: "Twilio credentials exposed",   desc: "AC... account SID or auth token found." },
  { id: "sec-sendgrid-key",     category: "Secrets",      severity: "critical", title: "SendGrid key exposed",          desc: "SG. API key found in source." },
  { id: "sec-slack-webhook",    category: "Secrets",      severity: "critical", title: "Slack webhook URL exposed",     desc: "hooks.slack.com URL hardcoded in source." },
  { id: "sec-discord-webhook",  category: "Secrets",      severity: "critical", title: "Discord webhook URL exposed",   desc: "discordapp.com/api/webhooks URL hardcoded." },
  { id: "sec-private-key",      category: "Secrets",      severity: "critical", title: "Private key in source",         desc: "-----BEGIN ... PRIVATE KEY----- block found." },
  { id: "sec-jwt-secret",       category: "Secrets",      severity: "critical", title: "JWT secret hardcoded",          desc: "JWT_SECRET or jwt.sign( with string literal." },
  // Dependencies
  { id: "dep-no-lockfile",      category: "Dependencies", severity: "medium",   title: "No lockfile committed",         desc: "No package-lock.json or yarn.lock or pnpm-lock.yaml." },
  { id: "dep-deprecated",       category: "Dependencies", severity: "medium",   title: "Deprecated or abandoned package", desc: "Package is deprecated, unmaintained, or has known malicious history." },
  // Auth
  { id: "auth-no-rate-limit",   category: "Auth",         severity: "medium",   title: "Auth route without rate limiting", desc: "Login/register endpoint has no apparent rate limit middleware." },
  { id: "auth-jwt-none",        category: "Auth",         severity: "critical", title: "JWT algorithm: none risk",      desc: "jwt.verify call may accept alg:none, bypassing signature check." },
  // Security
  { id: "sec-eval",             category: "Security",     severity: "medium",   title: "eval() in production code",     desc: "eval() executes arbitrary strings — big XSS/injection vector." },
  { id: "sec-sql-inject",       category: "Security",     severity: "medium",   title: "Possible SQL injection",        desc: "db.query() called with string concatenation — parameterize it." },
  { id: "sec-dangeroushtml",    category: "Security",     severity: "medium",   title: "dangerouslySetInnerHTML",       desc: "React's XSS bypass. Ensure the content is sanitized." },
  { id: "sec-console-secret",   category: "Security",     severity: "low",      title: "console.log with sensitive key", desc: "Logging password/token/secret to console." },
  // Supabase
  { id: "sup-no-rls",           category: "Supabase",     severity: "medium",   title: "Supabase anon key — verify RLS", desc: "Anon key is public-safe, but tables must have RLS enabled." },
  { id: "sup-admin-client",     category: "Supabase",     severity: "critical", title: "Supabase admin client in browser bundle", desc: "createClient with service_role key in client code." },
  // Repo health
  { id: "repo-no-gitignore",    category: "Repo Health",  severity: "medium",   title: "No .gitignore",                 desc: "No .gitignore — .env and node_modules may get committed." },
  { id: "repo-env-committed",   category: "Repo Health",  severity: "critical", title: ".env file committed",           desc: ".env found in the repo tree — credentials are exposed." },
  { id: "repo-no-readme",       category: "Repo Health",  severity: "low",      title: "No README",                     desc: "No README.md — hard for collaborators to understand the project." },
  // Code quality
  { id: "cq-todos",             category: "Code Quality", severity: "low",      title: "TODO comments in code",         desc: "Unfixed TODOs often indicate unfinished or skipped work." },
  { id: "cq-password-plain",    category: "Code Quality", severity: "medium",   title: "Plaintext password comparison", desc: "Password compared with == instead of bcrypt or similar." },
];

// ── Score formula diagram ────────────────────────────────────────────────────
function PipelineDiagram() {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="flex items-center gap-0 min-w-max text-sm py-2">
        {[
          { icon: "🔗", label: "GitHub URL" },
          { icon: "🗺️", label: "File tree" },
          { icon: "🔍", label: "30+ rule checks" },
          { icon: "⚖️", label: "Weighted score" },
          { icon: "📊", label: "Report" },
        ].map(({ icon, label }, i, arr) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5 px-4">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E5E5E0] flex items-center justify-center text-xl shadow-sm">
                {icon}
              </div>
              <span className="text-xs text-[#6B7280] font-medium text-center">{label}</span>
            </div>
            {i < arr.length - 1 && (
              <div className="w-8 h-0.5 bg-[#E5E5E0] flex-shrink-0 relative -top-3">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-[#E5E5E0] border-y-2 border-y-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ active }: { active: string }) {
  return (
    <nav className="w-48 flex-shrink-0">
      <ul className="space-y-1 sticky top-24">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`block text-sm px-3 py-1.5 rounded-md transition-colors ${
                active === s.id
                  ? "bg-[#111] text-white font-medium"
                  : "text-[#6B7280] hover:text-[#111] hover:bg-[#F5F5F0]"
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-xs text-[#9CA3AF] hover:text-[#111] transition-colors"
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("how-it-works");
  const [ruleSearch, setRuleSearch] = useState("");
  const [ruleCategory, setRuleCategory] = useState("All");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) { sectionRefs.current[id] = el; observer.observe(el); }
    });
    return () => observer.disconnect();
  }, []);

  const categories = ["All", ...Array.from(new Set(RULES.map((r) => r.category)))];
  const filteredRules = RULES.filter((r) => {
    const matchesSearch = !ruleSearch || r.title.toLowerCase().includes(ruleSearch.toLowerCase()) || r.desc.toLowerCase().includes(ruleSearch.toLowerCase());
    const matchesCat = ruleCategory === "All" || r.category === ruleCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Nav */}
      <nav className="border-b border-[#E5E5E0] px-6 py-4 sticky top-0 bg-[#FAFAF7]/90 backdrop-blur-sm z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#111] text-lg">
            <span>🐑</span>
            <span>Shepherd</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-[#6B7280]">
            <Link href="/wall" className="hover:text-[#111] transition-colors hidden sm:block">Wall of Fame</Link>
            <Link href="/scan" className="bg-[#111] text-white px-4 py-2 rounded-md hover:bg-[#333] transition-colors">
              Scan my app
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-3 font-medium">Documentation</p>
          <h1 className="text-3xl font-bold text-[#111] mb-3">How Shepherd works</h1>
          <p className="text-[#6B7280] max-w-xl">
            Everything about the scan pipeline, scoring formula, rule catalog, and what we can and can&apos;t detect.
          </p>
        </div>

        <div className="flex gap-12">
          {/* Sidebar — desktop only */}
          <div className="hidden md:block">
            <Sidebar active={activeSection} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-16">

            {/* How it works */}
            <section id="how-it-works">
              <h2 className="text-xl font-bold text-[#111] mb-4">How it works</h2>
              <p className="text-[#4B5563] mb-6 leading-relaxed">
                Shepherd uses the GitHub REST API to inspect your public repo — no OAuth, no token, no account.
                It fetches the file tree, reads up to 150 files, runs 30+ static checks, and produces a weighted Survival Score.
              </p>
              <div className="bg-white border border-[#E5E5E0] rounded-xl p-6 mb-6">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-4">Scan pipeline</p>
                <PipelineDiagram />
              </div>
              <div className="space-y-3">
                {[
                  ["GitHub REST API", "We call the /git/trees endpoint with ?recursive=1 to get the full file tree in one request. Then we batch-fetch file contents via /contents."],
                  ["File limits", "We read up to 150 files, skipping node_modules, .git, dist, build, and test fixtures. Files over 100KB are skipped."],
                  ["Static analysis only", "We don't execute your code. All checks are regex, pattern-matching, and structural analysis on raw file content."],
                  ["No data stored", "Results are not stored. Scan data lives only in the HTTP response. The Wall of Fame stores anonymous score + tier only."],
                ].map(([term, def]) => (
                  <div key={term} className="flex gap-3">
                    <div className="w-1 bg-[#E5E5E0] rounded-full flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-sm font-medium text-[#111]">{term}: </span>
                      <span className="text-sm text-[#4B5563]">{def}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Survival Score */}
            <section id="survival-score">
              <h2 className="text-xl font-bold text-[#111] mb-4">Survival Score</h2>
              <p className="text-[#4B5563] mb-6 leading-relaxed">
                The score is a 0–100 integer. Every issue found applies a penalty based on severity.
                We start at 100 and subtract.
              </p>

              {/* Formula */}
              <div className="bg-[#F5F5F0] rounded-xl p-5 mb-6 font-mono text-sm">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[#9CA3AF] text-xs font-sans">Penalty formula</span>
                  <CopyButton text="penalty = (criticals × 18) + (mediums × 7) + (lows × 2)" />
                </div>
                <pre className="text-[#111] overflow-x-auto">{`penalty = (criticals × 18) + (mediums × 7) + (lows × 2)
score   = max(0, min(100, 100 − penalty))`}</pre>
              </div>

              {/* Worked example */}
              <div className="bg-white border border-[#E5E5E0] rounded-xl p-5 mb-6">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-3">Worked example</p>
                <div className="space-y-1 text-sm font-mono">
                  <div>2 criticals → <span className="text-[#DC2626]">−36</span></div>
                  <div>1 medium  → <span className="text-[#D97706]">−7</span></div>
                  <div>3 lows    → <span className="text-[#6B7280]">−6</span></div>
                  <div className="border-t border-[#E5E5E0] pt-1 mt-1">Score: 100 − 49 = <span className="font-bold text-[#111]">51</span> (Limping Along)</div>
                </div>
              </div>

              {/* Tiers */}
              <div className="space-y-2">
                {[
                  { range: "90–100", label: "Immortal Sheep", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
                  { range: "70–89", label: "Mostly Alive",   color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
                  { range: "50–69", label: "Limping Along",  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
                  { range: "30–49", label: "One Deploy From Disaster", color: "#EA580C", bg: "#FFF7ED", border: "#FDBA74" },
                  { range: "0–29",  label: "Call the Vet",   color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
                ].map(({ range, label, color, bg, border }) => (
                  <div key={range} className="flex items-center gap-3 p-3 rounded-lg border text-sm" style={{ background: bg, borderColor: border }}>
                    <span className="font-mono text-xs text-[#9CA3AF] w-14">{range}</span>
                    <span className="font-semibold" style={{ color }}>{label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Rule catalog */}
            <section id="rule-catalog">
              <h2 className="text-xl font-bold text-[#111] mb-4">Rule Catalog</h2>
              <p className="text-[#4B5563] mb-6 leading-relaxed">
                Every check Shepherd runs. {RULES.length} rules across 6 categories.
              </p>

              {/* Search + filter */}
              <div className="flex gap-3 mb-5 flex-wrap">
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  className="flex-1 min-w-[160px] border border-[#E5E5E0] rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#111] transition-colors"
                />
                <select
                  value={ruleCategory}
                  onChange={(e) => setRuleCategory(e.target.value)}
                  className="border border-[#E5E5E0] rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#111] transition-colors"
                >
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                {filteredRules.map((rule) => (
                  <div key={rule.id} className="bg-white border border-[#E5E5E0] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                        rule.severity === "critical"
                          ? "bg-[#FEF2F2] text-[#DC2626]"
                          : rule.severity === "medium"
                          ? "bg-[#FFFBEB] text-[#D97706]"
                          : "bg-[#F5F5F0] text-[#6B7280]"
                      }`}>{rule.severity}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#111]">{rule.title}</div>
                        <div className="text-xs text-[#6B7280] mt-0.5">{rule.desc}</div>
                      </div>
                      <span className="text-xs text-[#9CA3AF] flex-shrink-0 font-mono">{rule.category}</span>
                    </div>
                  </div>
                ))}
                {filteredRules.length === 0 && (
                  <div className="text-sm text-[#9CA3AF] text-center py-8">No rules match your search.</div>
                )}
              </div>
            </section>

            {/* Limitations */}
            <section id="limitations">
              <h2 className="text-xl font-bold text-[#111] mb-4">Limitations</h2>
              <p className="text-[#4B5563] mb-4 leading-relaxed">
                Shepherd is a static analysis tool. It&apos;s useful, but it&apos;s not a security audit.
              </p>
              <div className="space-y-3">
                {[
                  ["Private repos", "We can only scan public GitHub repos. Private repos require GitHub Actions or a local CLI (coming soon)."],
                  ["False positives", "Pattern matching can misfire on test fixtures, example files, or commented-out code. We skip obvious test paths but can't catch all cases."],
                  ["False negatives", "We won't catch logic bugs, CSRF, IDOR, or runtime vulnerabilities. A score of 100 does not mean your app is secure — it means our static checks found nothing."],
                  ["Dependency depth", "We check your direct dependencies from package.json but don't analyze the full transitive dependency tree."],
                  ["Language support", "Optimized for JavaScript/TypeScript repos. Some checks (SQL injection, auth patterns) may fire incorrectly on Python/Go repos."],
                  ["Rate limits", "The GitHub REST API rate-limits unauthenticated requests to 60/hour. Large repos may time out. We retry once."],
                ].map(([term, def]) => (
                  <div key={term} className="bg-white border border-[#E5E5E0] rounded-lg p-4">
                    <div className="text-sm font-semibold text-[#111] mb-1">{term}</div>
                    <div className="text-sm text-[#4B5563]">{def}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Privacy */}
            <section id="privacy">
              <h2 className="text-xl font-bold text-[#111] mb-4">Privacy</h2>
              <div className="space-y-4 text-sm text-[#4B5563] leading-relaxed">
                <p>
                  Shepherd does not store scan results. When you submit a URL, the server fetches the repo,
                  runs analysis, and returns the result. The result is not persisted anywhere.
                </p>
                <p>
                  The Wall of Fame stores only: a random ID, anonymous score, tier, top issue category, and issue count.
                  No repo URLs, no file contents, no IP addresses. It&apos;s stored in memory and resets on every server restart.
                </p>
                <p>
                  The waitlist email form is optional. Emails are stored only for product update notifications.
                  We don&apos;t sell or share them.
                </p>
                <p>
                  We make unauthenticated GitHub API requests. GitHub may log these requests, but we do not.
                </p>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq">
              <h2 className="text-xl font-bold text-[#111] mb-4">FAQ</h2>
              <div className="space-y-4">
                {[
                  {
                    q: "My score is 23. Am I going to die?",
                    a: "The sheep has concerns. But no, 23 doesn't mean your app is down — it means we found some serious issues. Start with the criticals. Each one fixed is worth 18 points.",
                  },
                  {
                    q: "My score is 100. Am I invincible?",
                    a: "You passed our 30+ static checks, which is genuinely impressive. But a 100 doesn't mean your app has zero vulnerabilities — it means our pattern-based scanner found nothing obvious. A real security audit would still find things we can't.",
                  },
                  {
                    q: "Why did my open-source project score badly?",
                    a: "Large repos often have test fixtures, example configs, or documentation that triggers our checks. Test-file paths are skipped, but we can't catch everything. Check the actual finding — it usually includes the file name.",
                  },
                  {
                    q: "Can I scan a private repo?",
                    a: "Not yet. We're working on a GitHub Actions integration that would let you scan private repos in your own CI pipeline. Sign up for the waitlist to be notified.",
                  },
                  {
                    q: "Is this safe to run on production repos?",
                    a: "Yes. We make read-only unauthenticated GitHub API calls. We don't modify anything, don't store your code, and don't require any credentials from you.",
                  },
                  {
                    q: "Why is this free?",
                    a: "We're building in public and this is a good tool for the ecosystem. Also watching vibe-coded apps explode in production makes us sad. No free tier, no paywalls, no account required. Scan as many repos as you want, you menace.",
                  },
                  {
                    q: "How do I get a perfect score?",
                    a: "Don't commit secrets. Keep dependencies updated. Add a .gitignore. Fix auth patterns. The criticals are worth the most — fixing two criticals is worth 36 points.",
                  },
                ].map(({ q, a }) => (
                  <div key={q} className="bg-white border border-[#E5E5E0] rounded-xl p-5">
                    <div className="text-sm font-semibold text-[#111] mb-2">{q}</div>
                    <div className="text-sm text-[#4B5563] leading-relaxed">{a}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="border border-[#E5E5E0] rounded-xl p-6 text-center bg-white">
              <VibeSheep mood="happy" size={60} className="mx-auto mb-4" />
              <p className="text-sm font-medium text-[#111] mb-1">Ready to see your score?</p>
              <p className="text-sm text-[#6B7280] mb-4">Free scan. No account. Paste a repo URL.</p>
              <Link href="/scan" className="bg-[#111] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#333] transition-colors">
                Scan my app →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
