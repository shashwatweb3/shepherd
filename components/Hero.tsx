"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import VibeSheep from "@/components/mascots/VibeSheep";
import DevShepherd from "@/components/mascots/DevShepherd";

export default function Hero() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-24">
      {/* Badge */}
      <div className="flex justify-center mb-8">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-[#F0FDF4] text-[#16A34A] text-sm font-medium px-3 py-1 rounded-full border border-[#BBF7D0]"
        >
          <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block" />
          Free. No account. No paywall. Scan as many repos as you want, you menace.
        </motion.div>
      </div>

      {/* Mascots + headline */}
      <div className="flex flex-col items-center gap-8">
        {/* Characters row */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-end justify-center gap-8"
        >
          <DevShepherd size={120} />
          <motion.div
            animate={prefersReduced ? {} : { y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <VibeSheep mood="happy" size={100} />
          </motion.div>
        </motion.div>

        {/* Caption */}
        <motion.p
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs text-[#9CA3AF] italic text-center"
        >
          This is Vibe. Vibe was built in a weekend. Shepherd keeps Vibe alive.
        </motion.p>

        {/* Headline */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-[#111] leading-tight mb-6">
            You vibe-coded it.
            <br />
            <span className="text-[#16A34A]">Shepherd keeps it alive.</span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-xl text-[#6B7280] max-w-2xl text-center leading-relaxed"
        >
          Every AI-built app has hidden landmines. Exposed secrets, broken auth, dependency rot.
          Shepherd scans your public GitHub repo and gives it a Survival Score — before your users find out the hard way.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            whileHover={prefersReduced ? {} : { scale: 1.03 }}
            whileTap={prefersReduced ? {} : { scale: 0.97 }}
          >
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-[#111] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#333] transition-colors"
            >
              Scan my app <span aria-hidden>→</span>
            </Link>
          </motion.div>
          <p className="text-sm text-[#9CA3AF]">Public GitHub repos only. No login. ~10 seconds.</p>
        </motion.div>
      </div>
    </section>
  );
}
