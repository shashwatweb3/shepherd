import Link from "next/link";

export default function DemoReport() {
  const checks = [
    { text: "Fixed auth middleware — session tokens were not expiring correctly", done: true },
    { text: "Patched dependency vulnerability in lodash (CVE-2024-1234)", done: true },
    { text: "Reduced API latency by 14% by adding response caching on /api/users", done: true },
  ];

  const upcomingItems = [
    {
      title: "Add rate limiting to /api/auth/login",
      effort: "15 min effort",
      severity: "medium" as const,
      desc: "This endpoint has no rate limit. A brute-force attack could enumerate passwords.",
    },
    {
      title: "Rotate NEXT_PUBLIC_SUPABASE_ANON_KEY",
      effort: "5 min effort",
      severity: "low" as const,
      desc: "Your Supabase anon key is exposed in the client bundle. Ensure Row Level Security is enabled.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Nav */}
      <nav className="border-b border-[#E5E5E0] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#111] text-lg">
            <span>🐑</span>
            <span>Shepherd</span>
          </Link>
          <Link
            href="/scan"
            className="bg-[#111] text-white px-4 py-2 rounded-md text-sm hover:bg-[#333] transition-colors"
          >
            Scan my app
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-2">
          <div className="inline-flex items-center gap-2 bg-[#F0FDF4] text-[#16A34A] text-xs font-medium px-3 py-1 rounded-full border border-[#BBF7D0] mb-4">
            Sample Weekly Report
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#111] mb-1">Weekly Founder Report</h1>
        <p className="text-sm text-[#9CA3AF] mb-10">Week of June 9 – June 16, 2025 · myapp/backend</p>

        {/* Health card */}
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-8 mb-6 flex items-center gap-8">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-[#16A34A]">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#111]">92</div>
                <div className="text-xs text-[#6B7280]">/100</div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[#111] mb-1">Your app is healthy. 🟢</div>
            <div className="text-sm text-[#6B7280]">
              Health Score: <span className="font-medium text-[#111]">92/100</span>
            </div>
            <div className="text-sm text-[#6B7280] mt-1">
              Up 7 points from last week.
            </div>
          </div>
        </div>

        {/* This week */}
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-[#111] uppercase tracking-wide mb-4">
            This week Shepherd fixed
          </h2>
          <ul className="space-y-3">
            {checks.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-[#16A34A] font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-[#4B5563]">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendation */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-[#D97706] uppercase tracking-wide mb-4">
            Recommendations
          </h2>
          <ul className="space-y-4">
            {upcomingItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#D97706] flex-shrink-0 mt-1.5" />
                <div>
                  <div className="text-sm font-medium text-[#111]">
                    {item.title}{" "}
                    <span className="text-xs text-[#9CA3AF] font-normal">({item.effort})</span>
                  </div>
                  <div className="text-sm text-[#6B7280] mt-0.5">{item.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary line */}
        <div className="text-sm text-[#6B7280] border-t border-[#E5E5E0] pt-6 mt-6">
          <span className="font-medium text-[#111]">Summary:</span> Add rate limiting (15 min effort) and you&apos;ll
          hit a perfect score next week.
        </div>

        {/* CTA */}
        <div className="mt-10 border border-[#E5E5E0] rounded-xl p-6 text-center bg-white">
          <p className="text-sm font-medium text-[#111] mb-1">Want this for your app?</p>
          <p className="text-sm text-[#6B7280] mb-4">
            Scan your repo for free, then join the waitlist for weekly reports.
          </p>
          <Link
            href="/scan"
            className="bg-[#111] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#333] transition-colors"
          >
            Scan my app →
          </Link>
        </div>
      </div>
    </div>
  );
}
