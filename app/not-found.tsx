import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl mb-6" role="img" aria-label="lost sheep">🐑</div>
      <h1 className="text-3xl font-bold text-[#111] mb-3">This page wandered off.</h1>
      <p className="text-[#6B7280] mb-8 max-w-sm">
        We&apos;ll send a dog. In the meantime, there&apos;s nothing dangerous about going back home.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-[#111] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-[#333] transition-colors"
        >
          Back home
        </Link>
        <Link
          href="/scan"
          className="border border-[#E5E5E0] text-[#111] px-6 py-3 rounded-md text-sm font-medium hover:bg-white transition-colors"
        >
          Scan a repo
        </Link>
      </div>
    </div>
  );
}
