"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import VibeSheep from "@/components/mascots/VibeSheep";

const LINKS = [
  { href: "/scan",        label: "scan",   emoji: "🔍" },
  { href: "/wall",        label: "wall",   emoji: "🏆" },
  { href: "/report/demo", label: "report", emoji: "📋" },
  { href: "/docs",        label: "docs",   emoji: "📖" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-wool-line bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
              <VibeSheep mood="happy" size={38} />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-ink">
              Shepherd
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 sm:flex">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 font-mono text-sm transition-colors ${
                  pathname === href
                    ? "bg-wool text-ink font-semibold"
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

          {/* Mobile: Scan CTA + hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              href="/scan"
              className="rounded-xl border-2 border-ink bg-pasture px-3 py-2 font-display text-sm font-bold text-white shadow-lift active:translate-y-px active:shadow-none"
            >
              Scan →
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-wool-line bg-cream text-ink transition-colors hover:bg-wool active:scale-95"
            >
              <span className="sr-only">{open ? "Close" : "Menu"}</span>
              {open ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm sm:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            {/* Slide-in panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l-2 border-wool-line bg-cream shadow-2xl sm:hidden"
            >
              {/* Drawer header */}
              <div className="flex h-16 items-center justify-between border-b border-wool-line px-5">
                <span className="font-display text-lg font-bold text-ink">Menu</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-wool-line text-ink-faint hover:bg-wool"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-1 p-4">
                {LINKS.map(({ href, label, emoji }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.05 }}
                  >
                    <Link
                      href={href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 font-mono text-sm transition-colors ${
                        pathname === href
                          ? "bg-wool font-semibold text-ink"
                          : "text-ink-soft hover:bg-wool hover:text-ink"
                      }`}
                    >
                      <span className="text-base">{emoji}</span>
                      /{label}
                      {pathname === href && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-pasture" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Drawer footer sheep */}
              <div className="mt-auto flex items-end justify-between border-t border-wool-line px-5 py-5">
                <div className="flex items-end gap-1">
                  <VibeSheep mood="happy" size={40} />
                  <VibeSheep mood="sleeping" size={28} />
                </div>
                <p className="font-mono text-[10px] text-ink-faint leading-relaxed text-right">
                  free forever<br />no account needed
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
