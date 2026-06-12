import Link from "next/link";

export default function DemoReport() {
  const fixes = [
    {
      title: "Fixed auth middleware — session tokens not expiring",
      detail: "Tokens were being issued with no expiry. Any stolen token worked forever. Fixed.",
    },
    {
      title: "Patched lodash (CVE-2024-1234) — prototype pollution",
      detail: "Updated to 4.17.21. The version you had let attackers modify Object.prototype.",
    },
    {
      title: "Reduced /api/users latency by 14% via response caching",
      detail: "Added stale-while-revalidate cache headers. Your users noticed.",
    },
  ];

  const recommendations = [
    {
      title: "Add rate limiting to /api/auth/login",
      effort: "15 min",
      severity: "medium" as const,
      roast: "No rate limit on login means someone can try 10,000 passwords. Quietly. All night.",
      fix: "npm install @upstash/ratelimit — full setup in the docs. Seriously, 15 minutes.",
    },
    {
      title: "Supabase anon key in client bundle — verify RLS",
      effort: "5 min check",
      severity: "low" as const,
      roast: "The anon key being public is fine. Your tables being public is not.",
      fix: "In Supabase: Database → Tables → enable RLS → add 'users can read their own rows' policy.",
    },
    {
      title: "3 TODO comments in /lib/payments.ts",
      effort: "Varies",
      severity: "low" as const,
      roast: "TODO: actually do the TODO. It's been 6 months.",
      fix: "grep -r 'TODO' lib/ to see them all. File GitHub issues for any that aren't trivial.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7]">

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-2 bg-[#F0FDF4] text-[#16A34A] text-xs font-medium px-3 py-1 rounded-full border border-[#BBF7D0] mb-6">
          Sample Report — myapp/backend
        </div>

        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink mb-1">Weekly Founder Report</h1>
        <p className="text-sm text-[#9CA3AF] mb-10">Week of June 9–16, 2025</p>

        {/* Score */}
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-8 mb-5 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-[#16A34A] flex-shrink-0">
            <div className="text-center">
              <div className="font-display text-4xl font-extrabold tracking-tight text-ink">92</div>
              <div className="text-xs text-[#6B7280]">/100</div>
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[#111] mb-1">Your app is healthy.</div>
            <div className="text-sm text-[#16A34A] font-medium mb-1">Mostly Alive — up 7 points from last week.</div>
            <div className="text-sm text-[#6B7280]">3 things fixed. 3 things to watch. One of them takes 15 minutes.</div>
          </div>
        </div>

        {/* Fixed this week */}
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-6 mb-4">
          <h2 className="text-xs font-semibold text-[#111] uppercase tracking-wide mb-4">
            Shepherd found and would have fixed
          </h2>
          <ul className="space-y-4">
            {fixes.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#16A34A] font-bold flex-shrink-0 mt-0.5">✓</span>
                <div>
                  <div className="text-sm font-medium text-[#111]">{item.title}</div>
                  <div className="text-sm text-[#6B7280] mt-0.5">{item.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-6 mb-5">
          <h2 className="text-xs font-semibold text-[#D97706] uppercase tracking-wide mb-4">
            Action needed
          </h2>
          <ul className="space-y-5">
            {recommendations.map((item, i) => (
              <li key={i}>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] flex-shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#111]">
                      {item.title}{" "}
                      <span className="text-xs text-[#9CA3AF] font-normal">({item.effort})</span>
                    </div>
                    <div className="text-xs text-[#9CA3AF] italic mt-0.5">{item.roast}</div>
                    <div className="text-sm text-[#4B5563] mt-1 font-medium">→ {item.fix}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-[#6B7280] border-t border-[#E5E5E0] pt-6 mb-10">
          <span className="font-medium text-[#111]">TL;DR:</span> Add rate limiting (15 min effort) and you&apos;ll
          hit a perfect score next week. The sheep are rooting for you.
        </div>

        <div className="border border-[#E5E5E0] rounded-xl p-6 text-center bg-white">
          <p className="text-sm font-medium text-[#111] mb-1">Get this for your actual app</p>
          <p className="text-sm text-[#6B7280] mb-4">
            Free scan. No account. Paste a repo URL and get your score in 10 seconds.
          </p>
          <Link href="/scan" className="bg-[#111] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#333] transition-colors">
            Scan my app →
          </Link>
        </div>
      </div>
    </div>
  );
}
