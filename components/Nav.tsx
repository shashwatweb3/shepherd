"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import VibeSheep from "@/components/mascots/VibeSheep";

const LINKS = [
  { href: "/wall", label: "wall" },
  { href: "/report/demo", label: "report" },
  { href: "/docs", label: "docs" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-wool-line bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
            <VibeSheep mood="happy" size={38} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Shepherd
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`hidden rounded-lg px-3 py-2 font-mono text-sm transition-colors sm:block ${
                pathname === href
                  ? "text-ink"
                  : "text-ink-faint hover:bg-wool hover:text-ink"
              }`}
            >
              /{label}
            </Link>
          ))}
          <Link
            href="/scan"
            className="ml-2 rounded-xl border-2 border-ink bg-pasture px-4 py-2 font-display text-sm font-bold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#141414] active:translate-y-0 active:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            Scan my app
          </Link>
        </div>
      </div>
    </nav>
  );
}
