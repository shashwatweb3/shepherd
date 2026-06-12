"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ScanResult, Issue, IssueSeverity, ScoreTier, TIER_LABELS, TIER_COLORS } from "@/lib/scanner";

// ── Scanning status lines ──────────────────────────────────────────────────────
const SCAN_LINES = [
  "Sniffing around your repo...",
  "Counting the landmines...",
  "Judging your commit messages...",
  "Checking if you committed your .env (please no)...",
  "Consulting the elder sheep...",
  "Scanning for secrets you definitely didn't mean to push...",
  "Auditing your dependency choices...",
  "Checking if eval() appears. Please no...",
  "Looking for hardcoded passwords with one eye closed...",
  "Almost done. The sheep is thinking.",
];

// ── localStorage history ───────────────────────────────────────────────────────
interface HistoryEntry {
  repo: string;
  score: number;
  tier: ScoreTier;
  scannedAt: string;
}

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem("shepherd_history") ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(entry: HistoryEntry) {
  try {
    const hist = loadHistory().filter((h) => h.repo !== entry.repo);
    hist.unshift(entry);
    localStorage.setItem("shepherd_history", JSON.stringify(hist.slice(0, 10)));
  } catch {
    // localStorage unavailable
  }
}

// ── Score ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, tier, animate: doAnimate }: { score: number; tier: ScoreTier; animate: boolean }) {
  const [displayed, setDisplayed] = useState(doAnimate ? 0 : score);
  const prefersReduced = useReducedMotion();
  const color = TIER_COLORS[tier];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    if (!doAnimate || prefersReduced) {
      setDisplayed(score);
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.floor(score / 40));
    const interval = setInterval(() => {
      current = Math.min(score, current + step);
      setDisplayed(current);
      if (current >= score) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [score, doAnimate, prefersReduced]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128" aria-hidden>
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#E5E5E0" strokeWidth="10" />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: prefersReduced ? "none" : "stroke-dashoffset 0.05s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-[#111]" aria-live="polite">{displayed}</span>
          <span className="text-xs text-[#6B7280]">/100</span>
        </div>
      </div>
    </div>
  );
}

// ── Issue accordion item ───────────────────────────────────────────────────────
function IssueItem({ issue, index }: { issue: Issue; index: number }) {
  const [open, setOpen] = useState(false);
  const prefersReduced = useReducedMotion();
  const dotColors: Record<IssueSeverity, string> = {
    critical: "bg-[#DC2626]",
    medium: "bg-[#D97706]",
    low: "bg-[#6B7280]",
  };

  return (
    <motion.li
      initial={prefersReduced ? {} : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="border border-[#E5E5E0] rounded-lg overflow-hidden bg-white"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#FAFAF7] transition-colors"
      >
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${dotColors[issue.severity]} ${issue.severity === "critical" ? "animate-pulse" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[#111]">{issue.title}</div>
          {issue.file && (
            <div className="text-xs text-[#9CA3AF] font-mono mt-0.5 truncate">{issue.file}</div>
          )}
          <div className="text-xs text-[#6B7280] mt-1 italic">{issue.roast}</div>
        </div>
        <span className="text-[#9CA3AF] text-xs flex-shrink-0 mt-0.5">{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[#E5E5E0] pt-4 space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-[#9CA3AF] font-medium mb-1">What this means</div>
                <p className="text-sm text-[#4B5563] leading-relaxed">{issue.description}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-[#9CA3AF] font-medium mb-1">How to fix it</div>
                <pre className="text-sm text-[#111] bg-[#F5F5F0] rounded-md p-3 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                  {issue.fix}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
type ScanState = "idle" | "loading" | "done" | "error";

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanLineIndex, setScanLineIndex] = useState(0);
  const [addToWall, setAddToWall] = useState(true);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [confettiFired, setConfettiFired] = useState(false);
  const scanLineRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Scan line cycling while loading
  useEffect(() => {
    if (state === "loading") {
      scanLineRef.current = setInterval(() => {
        setScanLineIndex((i) => (i + 1) % SCAN_LINES.length);
      }, 1800);
    } else {
      if (scanLineRef.current) clearInterval(scanLineRef.current);
    }
    return () => { if (scanLineRef.current) clearInterval(scanLineRef.current); };
  }, [state]);

  // Confetti on high scores
  useEffect(() => {
    if (result && result.score >= 90 && !confettiFired && !prefersReduced) {
      setConfettiFired(true);
      import("canvas-confetti").then((mod) => {
        const confetti = mod.default;
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ["#16A34A", "#BBF7D0", "#111", "#FAFAF7"] });
      });
    }
  }, [result, confettiFired, prefersReduced]);

  // Screen shake on terrible scores
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (result && result.score < 30 && !prefersReduced) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [result, prefersReduced]);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setResult(null);
    setErrorMsg("");
    setScanLineIndex(0);
    setConfettiFired(false);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. The sheep are confused.");
        setState("error");
        return;
      }
      setResult(data as ScanResult);
      setState("done");

      // Save to history
      const entry: HistoryEntry = {
        repo: (data as ScanResult).repo,
        score: (data as ScanResult).score,
        tier: (data as ScanResult).tier,
        scannedAt: (data as ScanResult).scannedAt,
      };
      saveHistory(entry);
      setHistory(loadHistory());

      // Submit to wall if opted in
      if (addToWall) {
        const d = data as ScanResult;
        const topCategory = d.issues[0]?.category ?? "none";
        fetch("/api/wall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: d.score, topCategory, issueCount: d.issues.length }),
        }).catch(() => {});
      }

      // Scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" }), 100);
    } catch {
      setErrorMsg("Network error. Check your connection and try again.");
      setState("error");
    }
  }

  function buildMarkdownReport(r: ScanResult): string {
    const lines: string[] = [
      `# Shepherd Survival Report — ${r.repo}`,
      `**Score:** ${r.score}/100 — ${TIER_LABELS[r.tier]}`,
      `**Scanned:** ${new Date(r.scannedAt).toLocaleString()}`,
      `**Files checked:** ${r.filesChecked}`,
      "",
      `## Issues (${r.issues.length} total)`,
      "",
    ];
    for (const issue of r.issues) {
      lines.push(`### [${issue.severity.toUpperCase()}] ${issue.title}`);
      if (issue.file) lines.push(`_File: ${issue.file}_`);
      lines.push(`> 🔥 ${issue.roast}`);
      lines.push("");
      lines.push(`**What this means:** ${issue.description}`);
      lines.push("");
      lines.push(`**How to fix:**\n\`\`\`\n${issue.fix}\n\`\`\``);
      lines.push("");
    }
    lines.push("---");
    lines.push("_Generated by [Shepherd](https://shepherd-ivory.vercel.app) — You vibe-coded it. Shepherd keeps it alive._");
    return lines.join("\n");
  }

  async function copyReport() {
    if (!result) return;
    await navigator.clipboard.writeText(buildMarkdownReport(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const criticals = result?.issues.filter((i) => i.severity === "critical") ?? [];
  const mediums = result?.issues.filter((i) => i.severity === "medium") ?? [];
  const lows = result?.issues.filter((i) => i.severity === "low") ?? [];
  const shareUrl =
    result && typeof window !== "undefined"
      ? `${window.location.origin}/scan?score=${result.score}&repo=${encodeURIComponent(result.repo)}`
      : "";

  return (
    <motion.div
      className="min-h-screen bg-[#FAFAF7]"
      animate={shake ? { x: [0, -8, 8, -6, 6, -3, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #d1d1cc 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.4,
        }}
        aria-hidden
      />

      {/* Nav */}
      <nav className="relative border-b border-[#E5E5E0] px-6 py-4 bg-[#FAFAF7]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#111]">
            <span>🐑</span> Shepherd
          </Link>
          <Link href="/wall" className="text-sm text-[#6B7280] hover:text-[#111] transition-colors">
            Wall of Fame
          </Link>
        </div>
      </nav>

      <div className="relative max-w-2xl mx-auto px-6 py-14">
        {/* Input */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#111] mb-2">Survival Scan</h1>
          <p className="text-[#6B7280] mb-8">
            Paste any public GitHub repo URL. We run 30+ checks and give it a Survival Score.
            No login. No limits. Don&apos;t say we never gave you anything.
          </p>
          <form onSubmit={handleScan} className="flex gap-3 flex-col sm:flex-row">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              disabled={state === "loading"}
              className="flex-1 border border-[#E5E5E0] rounded-md px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#111] transition-colors font-mono disabled:opacity-60"
            />
            <motion.button
              type="submit"
              disabled={state === "loading"}
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              className="bg-[#111] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {state === "loading" ? "Scanning..." : "Scan →"}
            </motion.button>
          </form>

          {/* Wall opt-in */}
          <label className="flex items-center gap-2 mt-3 text-sm text-[#6B7280] cursor-pointer">
            <input
              type="checkbox"
              checked={addToWall}
              onChange={(e) => setAddToWall(e.target.checked)}
              className="rounded"
            />
            Add my score to the anonymous Wall of Fame
          </label>
        </div>

        {/* Loading */}
        <AnimatePresence>
          {state === "loading" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-white border border-[#E5E5E0] rounded-xl p-8 mb-8"
            >
              {/* Progress bar */}
              <div className="h-1.5 bg-[#E5E5E0] rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-[#16A34A] rounded-full"
                  animate={{ width: ["5%", "85%"] }}
                  transition={{ duration: 12, ease: "easeInOut" }}
                />
              </div>

              {/* Status line */}
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={scanLineIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm text-[#6B7280]"
                  >
                    {SCAN_LINES[scanLineIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {state === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-5 mb-8 text-[#DC2626] text-sm"
            >
              <div className="font-medium mb-1">Something went wrong</div>
              <div className="text-[#B91C1C]">{errorMsg}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {state === "done" && result && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Score card */}
              <div className="bg-white border border-[#E5E5E0] rounded-xl p-8 mb-5 flex flex-col md:flex-row items-center gap-8">
                <ScoreRing score={result.score} tier={result.tier} animate={true} />
                <div className="flex-1 text-center md:text-left">
                  <motion.div
                    initial={prefersReduced ? {} : { scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, delay: 0.3 }}
                    className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3"
                    style={{
                      background: `${TIER_COLORS[result.tier]}15`,
                      color: TIER_COLORS[result.tier],
                      border: `1.5px solid ${TIER_COLORS[result.tier]}40`,
                    }}
                  >
                    {TIER_LABELS[result.tier]}
                  </motion.div>
                  <h2 className="text-xl font-bold text-[#111] mb-1">Survival Score</h2>
                  <p className="text-[#6B7280] text-sm mb-4 font-mono">{result.repo}</p>
                  <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-start mb-4">
                    <span className="text-[#DC2626] font-medium">{criticals.length} critical</span>
                    <span className="text-[#D97706] font-medium">{mediums.length} medium</span>
                    <span className="text-[#6B7280] font-medium">{lows.length} low</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <motion.button
                      onClick={copyReport}
                      whileHover={prefersReduced ? {} : { scale: 1.03 }}
                      whileTap={prefersReduced ? {} : { scale: 0.97 }}
                      className="text-xs border border-[#E5E5E0] px-3 py-1.5 rounded-md hover:bg-[#F5F5F0] transition-colors text-[#6B7280]"
                    >
                      {copied ? "✓ Copied!" : "📋 Copy full report (markdown)"}
                    </motion.button>
                    {shareUrl && (
                      <motion.button
                        onClick={() => navigator.clipboard.writeText(shareUrl)}
                        whileHover={prefersReduced ? {} : { scale: 1.03 }}
                        whileTap={prefersReduced ? {} : { scale: 0.97 }}
                        className="text-xs border border-[#E5E5E0] px-3 py-1.5 rounded-md hover:bg-[#F5F5F0] transition-colors text-[#6B7280]"
                      >
                        🔗 Share score
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Zero issues */}
              {result.issues.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-8 text-center mb-5"
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <div className="font-bold text-[#16A34A] text-lg mb-1">Suspiciously clean.</div>
                  <div className="text-sm text-[#6B7280]">Are you even a vibe coder? No issues found across {result.filesChecked} files. We&apos;re impressed and slightly suspicious.</div>
                </motion.div>
              )}

              {/* Critical issues */}
              {criticals.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#DC2626] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                    Critical — {criticals.length} issue{criticals.length !== 1 ? "s" : ""}
                  </div>
                  <ul className="space-y-2">
                    {criticals.map((issue, i) => (
                      <IssueItem key={i} issue={issue} index={i} />
                    ))}
                  </ul>
                </div>
              )}

              {/* Medium issues */}
              {mediums.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#D97706] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                    Medium — {mediums.length} issue{mediums.length !== 1 ? "s" : ""}
                  </div>
                  <ul className="space-y-2">
                    {mediums.map((issue, i) => (
                      <IssueItem key={i} issue={issue} index={i} />
                    ))}
                  </ul>
                </div>
              )}

              {/* Low issues */}
              {lows.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6B7280]" />
                    Low — {lows.length} issue{lows.length !== 1 ? "s" : ""}
                  </div>
                  <ul className="space-y-2">
                    {lows.map((issue, i) => (
                      <IssueItem key={i} issue={issue} index={i} />
                    ))}
                  </ul>
                </div>
              )}

              {/* Scan another */}
              <div className="border border-[#E5E5E0] rounded-xl p-5 bg-white text-center mt-6">
                <p className="text-sm text-[#6B7280] mb-3">Scan another repo or share your score.</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <motion.button
                    onClick={() => { setResult(null); setState("idle"); setUrl(""); }}
                    whileHover={prefersReduced ? {} : { scale: 1.03 }}
                    whileTap={prefersReduced ? {} : { scale: 0.97 }}
                    className="bg-[#111] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#333] transition-colors"
                  >
                    Scan another →
                  </motion.button>
                  <Link href="/wall" className="border border-[#E5E5E0] text-[#111] px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#FAFAF7] transition-colors">
                    View Wall of Fame
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan history — "Your Flock" */}
        {history.length > 0 && state !== "done" && (
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-[#111] mb-4 flex items-center gap-2">
              <span>🐑</span> Your Flock <span className="text-[#9CA3AF] font-normal">(recent scans)</span>
            </h3>
            <ul className="space-y-2">
              {history.map((h) => {
                const prev = history.find((p) => p.repo === h.repo && p.scannedAt < h.scannedAt);
                const delta = prev ? h.score - prev.score : null;
                return (
                  <li key={h.scannedAt} className="flex items-center justify-between bg-white border border-[#E5E5E0] rounded-lg px-4 py-3">
                    <button
                      onClick={() => { setUrl(`https://github.com/${h.repo}`); }}
                      className="font-mono text-sm text-[#111] hover:text-[#16A34A] transition-colors text-left truncate"
                    >
                      {h.repo}
                    </button>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {delta !== null && (
                        <span className={`text-xs font-medium ${delta > 0 ? "text-[#16A34A]" : delta < 0 ? "text-[#DC2626]" : "text-[#9CA3AF]"}`}>
                          {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : "—"}
                        </span>
                      )}
                      <span
                        className="font-bold text-sm"
                        style={{ color: TIER_COLORS[h.tier] }}
                      >
                        {h.score}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
