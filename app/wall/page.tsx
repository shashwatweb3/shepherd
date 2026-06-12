"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TIER_COLORS, type ScoreTier } from "@/lib/tiers";
import DevShepherd from "@/components/mascots/DevShepherd";

interface WallEntry {
  id: string;
  score: number;
  tier: ScoreTier;
  tierLabel: string;
  topCategory: string;
  issueCount: number;
  addedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  secrets: "Secrets Exposed",
  dependencies: "Dependency Issues",
  auth: "Auth Problems",
  security: "Security Holes",
  supabase: "Supabase Risks",
  "repo-health": "Repo Health",
  "code-quality": "Code Quality",
  none: "All Clear",
};

function ScoreBadge({ score, tier }: { score: number; tier: ScoreTier }) {
  const color = TIER_COLORS[tier];
  return (
    <div
      className="text-2xl font-bold w-14 h-14 rounded-full flex items-center justify-center border-2 flex-shrink-0"
      style={{ color, borderColor: color, background: `${color}15` }}
    >
      {score}
    </div>
  );
}

export default function WallPage() {
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wall")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <nav className="border-b border-[#E5E5E0] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#111] text-lg">
            <span>🐑</span>
            <span>Shepherd</span>
          </Link>
          <Link href="/scan" className="bg-[#111] text-white px-4 py-2 rounded-md text-sm hover:bg-[#333] transition-colors">
            Scan my app
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="mb-6">
            <DevShepherd size={100} />
          </div>
          <p className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-3 font-medium">Community</p>
          <h1 className="text-3xl font-bold text-[#111] mb-3">Wall of Shame... I mean, Fame</h1>
          <p className="text-[#6B7280]">
            Anonymous scores from recent scans. Repos are hidden. Only vibes are shown.
            <br />
            <span className="text-sm">Opt in at scan time to add your score.</span>
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-[#6B7280] py-12 justify-center">
            <span className="w-5 h-5 border-2 border-[#6B7280] border-t-transparent rounded-full animate-spin" />
            Consulting the flock...
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="text-center py-20 border border-[#E5E5E0] rounded-xl bg-white">
            <div className="text-5xl mb-4">🐑</div>
            <div className="font-semibold text-[#111] mb-2">The wall is bare</div>
            <div className="text-sm text-[#6B7280] mb-6">
              No anonymous scans yet. Be the first to contribute to the collection of public shame.
            </div>
            <Link href="/scan" className="bg-[#111] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#333] transition-colors">
              Scan a repo →
            </Link>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-[#E5E5E0] rounded-xl p-5 flex items-center gap-4"
              >
                <ScoreBadge score={entry.score} tier={entry.tier} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#111] text-sm" style={{ color: TIER_COLORS[entry.tier] }}>
                    {entry.tierLabel}
                  </div>
                  <div className="text-sm text-[#6B7280] mt-0.5">
                    {entry.issueCount} issue{entry.issueCount !== 1 ? "s" : ""} ·{" "}
                    Top category: {CATEGORY_LABELS[entry.topCategory] ?? entry.topCategory}
                  </div>
                </div>
                <div className="text-xs text-[#9CA3AF] flex-shrink-0">
                  {new Date(entry.addedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/scan" className="text-sm text-[#6B7280] hover:text-[#111] transition-colors underline underline-offset-2">
            Add your score to the wall →
          </Link>
        </div>
      </div>
    </div>
  );
}
