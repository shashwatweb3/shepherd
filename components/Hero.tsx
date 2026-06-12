"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import VibeSheep from "@/components/mascots/VibeSheep";
import DevShepherd from "@/components/mascots/DevShepherd";
import TerminalDemo from "@/components/TerminalDemo";

export default function Hero() {
  const reduced = useReducedMotion();

  const fadeUp = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
        };

  return (
    <section className="relative overflow-hidden">
      {/* faint pasture horizon line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-wool-line"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-20">
        {/* ---- left: the words ---- */}
        <div>
          <motion.p {...fadeUp(0)} className="eyebrow">
            free forever · no account · no paywall
          </motion.p>

          <motion.h1
            {...fadeUp(0.08)}
            className="mt-5 font-display text-[2.9rem] font-extrabold leading-[0.98] tracking-tight text-ink sm:text-6xl lg:text-[4.2rem]"
          >
            You vibe-coded it.
            <span className="block text-pasture">Shepherd keeps it alive.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.16)}
            className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft"
          >
            Paste a public GitHub repo. In ~10 seconds Shepherd finds the exposed
            secrets, broken auth, and dependency rot — with file, line, and a fix
            you can paste straight back into your AI.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/scan"
              className="rounded-xl border-2 border-ink bg-pasture px-7 py-3.5 font-display text-lg font-bold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_#141414] active:translate-y-0 active:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Scan my app →
            </Link>
            <span className="font-mono text-xs text-ink-faint">
              public repos · ~10s · nothing stored
            </span>
          </motion.div>

          {/* the shepherd stands watch under the copy on large screens */}
          <motion.div
            {...fadeUp(0.34)}
            className="mt-10 hidden items-end gap-4 lg:flex"
          >
            <DevShepherd size={150} />
            <p className="mb-6 max-w-[220px] font-mono text-xs leading-relaxed text-ink-faint">
              the shepherd watches your repo
              <br />
              so you can go back to shipping
            </p>
          </motion.div>
        </div>

        {/* ---- right: the demo, with Vibe perched on the window ---- */}
        <motion.div {...fadeUp(0.18)} className="relative mt-6 lg:mt-0">
          {/* Vibe sits on top of the terminal chrome, facing the output */}
          <div className="absolute -top-[74px] right-8 z-10 -scale-x-100">
            <VibeSheep mood="nervous" size={110} />
          </div>
          <TerminalDemo />
          <p className="mt-3 text-center font-mono text-xs text-ink-faint">
            this is Vibe&apos;s app. Vibe is nervous. Vibe should be.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
