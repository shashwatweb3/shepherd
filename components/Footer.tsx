import Link from "next/link";
import VibeSheep from "@/components/mascots/VibeSheep";

export default function Footer() {
  return (
    <footer className="border-t border-wool-line bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          {/* the flock */}
          <div className="flex items-end gap-1 opacity-90">
            <VibeSheep mood="happy" size={44} />
            <VibeSheep mood="sleeping" size={32} />
            <VibeSheep mood="happy" size={26} />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm text-ink-faint">
            <Link href="/scan" className="transition-colors hover:text-ink">/scan</Link>
            <Link href="/wall" className="transition-colors hover:text-ink">/wall</Link>
            <Link href="/report/demo" className="transition-colors hover:text-ink">/report</Link>
            <Link href="/docs" className="transition-colors hover:text-ink">/docs</Link>
          </div>
        </div>

        <p className="mt-8 font-mono text-xs text-ink-faint">
          shepherd · static analysis for vibe-coded apps · we never run your code, we never store it
        </p>
      </div>
    </footer>
  );
}
