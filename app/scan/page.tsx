"use client";

import { useState } from "react";
import Link from "next/link";
import { ScanResult } from "@/lib/scanner";

type ScanState = "idle" | "loading" | "done" | "error";

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 70 ? "#16A34A" : score >= 40 ? "#D97706" : "#DC2626";
  const label =
    score >= 70 ? "Healthy" : score >= 40 ? "At Risk" : "Critical";

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
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
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-[#111]">{score}</span>
          <span className="text-xs text-[#6B7280]">/100</span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

function SeverityDot({ severity }: { severity: "critical" | "medium" | "low" }) {
  const colors = { critical: "bg-[#DC2626]", medium: "bg-[#D97706]", low: "bg-[#6B7280]" };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${colors[severity]}`} />;
}

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setResult(null);
    setErrorMsg("");
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setResult(data);
      setState("done");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  const shareUrl =
    result && typeof window !== "undefined"
      ? `${window.location.origin}/scan?score=${result.score}&repo=${encodeURIComponent(url)}`
      : "";

  const criticalIssues = result?.issues.filter((i) => i.severity === "critical") ?? [];
  const mediumIssues = result?.issues.filter((i) => i.severity === "medium") ?? [];
  const lowIssues = result?.issues.filter((i) => i.severity === "low") ?? [];

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Nav */}
      <nav className="border-b border-[#E5E5E0] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#111] text-lg">
            <span>🐑</span>
            <span>Shepherd</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Input form */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#111] mb-2">Survival Scan</h1>
          <p className="text-[#6B7280] mb-8">
            Enter any public GitHub repository URL. We&apos;ll check it for common landmines and give
            it a Survival Score.
          </p>
          <form onSubmit={handleScan} className="flex gap-3">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="flex-1 border border-[#E5E5E0] rounded-md px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#111] transition-colors font-mono"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="bg-[#111] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {state === "loading" ? "Scanning..." : "Scan →"}
            </button>
          </form>
          {state === "loading" && (
            <div className="mt-4 text-sm text-[#6B7280] flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-[#6B7280] border-t-transparent rounded-full animate-spin" />
              Fetching repo and running checks...
            </div>
          )}
        </div>

        {/* Error */}
        {state === "error" && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 text-[#DC2626] text-sm">
            {errorMsg}
          </div>
        )}

        {/* Results */}
        {state === "done" && result && (
          <div>
            {/* Score */}
            <div className="bg-white border border-[#E5E5E0] rounded-xl p-8 mb-6 flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={result.score} />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-[#111] mb-1">Survival Score</h2>
                <p className="text-[#6B7280] text-sm mb-4">{result.repo}</p>
                <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-start">
                  <span className="text-[#DC2626] font-medium">{criticalIssues.length} critical</span>
                  <span className="text-[#D97706] font-medium">{mediumIssues.length} medium</span>
                  <span className="text-[#6B7280] font-medium">{lowIssues.length} low</span>
                </div>
                {shareUrl && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                    }}
                    className="mt-4 text-xs border border-[#E5E5E0] px-3 py-1.5 rounded-md hover:bg-[#F5F5F0] transition-colors text-[#6B7280]"
                  >
                    Copy shareable link
                  </button>
                )}
              </div>
            </div>

            {/* Issues */}
            {[
              { label: "Critical", items: criticalIssues, color: "text-[#DC2626]", bg: "bg-[#FEF2F2]", border: "border-[#FECACA]" },
              { label: "Medium", items: mediumIssues, color: "text-[#D97706]", bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]" },
              { label: "Low", items: lowIssues, color: "text-[#6B7280]", bg: "bg-[#F9FAFB]", border: "border-[#E5E7EB]" },
            ].map(
              ({ label, items, color, bg, border }) =>
                items.length > 0 && (
                  <div key={label} className={`rounded-xl border ${border} ${bg} p-6 mb-4`}>
                    <h3 className={`text-sm font-semibold uppercase tracking-wide ${color} mb-4`}>
                      {label} — {items.length} {items.length === 1 ? "issue" : "issues"}
                    </h3>
                    <ul className="space-y-3">
                      {items.map((issue, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <SeverityDot severity={issue.severity} />
                          <div>
                            <div className="text-sm font-medium text-[#111]">{issue.title}</div>
                            <div className="text-sm text-[#6B7280] mt-0.5">{issue.description}</div>
                            {issue.file && (
                              <div className="text-xs text-[#9CA3AF] mt-1 font-mono">{issue.file}</div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}

            {result.issues.length === 0 && (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-6 text-center">
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-semibold text-[#16A34A]">No issues found</div>
                <div className="text-sm text-[#6B7280] mt-1">This repo looks clean. Nice work.</div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 border border-[#E5E5E0] rounded-xl p-6 text-center bg-white">
              <p className="text-sm text-[#6B7280] mb-4">
                Want continuous monitoring, private repos, and auto-fix suggestions?
              </p>
              <Link href="/#waitlist" className="bg-[#111] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#333] transition-colors">
                Join the waitlist →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
