"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? {} : { opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sheepHop, setSheepHop] = useState(false);
  const prefersReduced = useReducedMotion();

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // always succeed
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Subtle dot-grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #d1d1cc 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.4,
        }}
        aria-hidden
      />

      {/* Nav */}
      <nav className="relative border-b border-[#E5E5E0] px-6 py-4 bg-[#FAFAF7]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#111] text-lg">
            <motion.span
              animate={sheepHop && !prefersReduced ? { y: [-4, 0] } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onMouseEnter={() => { setSheepHop(true); setTimeout(() => setSheepHop(false), 400); }}
              style={{ display: "inline-block", cursor: "default" }}
            >
              🐑
            </motion.span>
            <span>Shepherd</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-[#6B7280]">
            <Link href="/wall" className="hover:text-[#111] transition-colors hidden sm:block">Wall of Fame</Link>
            <Link href="/report/demo" className="hover:text-[#111] transition-colors hidden sm:block">Sample Report</Link>
            <motion.div whileHover={prefersReduced ? {} : { scale: 1.03 }} whileTap={prefersReduced ? {} : { scale: 0.97 }}>
              <Link
                href="/scan"
                className="bg-[#111] text-white px-4 py-2 rounded-md hover:bg-[#333] transition-colors"
              >
                Scan my app
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-24 text-center">
        <FadeUp delay={0}>
          <div className="inline-flex items-center gap-2 bg-[#F0FDF4] text-[#16A34A] text-sm font-medium px-3 py-1 rounded-full border border-[#BBF7D0] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block" />
            Free. No account. No paywall. Scan as many repos as you want, you menace.
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="flex items-center justify-center mb-6">
            <motion.span
              animate={prefersReduced ? {} : { y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              style={{ display: "inline-block", fontSize: "64px" }}
              role="img"
              aria-label="sheep"
            >
              🐑
            </motion.span>
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          <h1 className="text-5xl md:text-6xl font-bold text-[#111] leading-tight mb-6">
            You vibe-coded it.
            <br />
            <span className="text-[#16A34A]">Shepherd keeps it alive.</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.25}>
          <p className="text-xl text-[#6B7280] max-w-2xl mx-auto mb-10 leading-relaxed">
            Every AI-built app has hidden landmines. Exposed secrets, broken auth, dependency rot.
            Shepherd scans your public GitHub repo and gives it a Survival Score — before your users find out the hard way.
          </p>
        </FadeUp>

        <FadeUp delay={0.35}>
          <motion.div
            whileHover={prefersReduced ? {} : { scale: 1.03 }}
            whileTap={prefersReduced ? {} : { scale: 0.97 }}
            className="inline-block"
          >
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-[#111] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#333] transition-colors"
            >
              Scan my app <span aria-hidden>→</span>
            </Link>
          </motion.div>
          <p className="text-sm text-[#9CA3AF] mt-4">Public GitHub repos only. No login. ~10 seconds.</p>
        </FadeUp>
      </section>

      {/* Doom Loop */}
      <section className="bg-white border-y border-[#E5E5E0] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <RevealSection>
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-4 font-medium">The Problem</p>
              <h2 className="text-3xl font-bold text-[#111] mb-6">The Doom Loop</h2>
              <p className="text-lg text-[#4B5563] mb-5 leading-relaxed">
                You ship fast with AI. It works. Then something breaks. You ask AI to fix it — and it fixes it,
                but now three other things are broken. You fix those. Something else breaks.
              </p>
              <p className="text-lg text-[#4B5563] mb-5 leading-relaxed">
                Eventually, you&apos;re afraid to touch the codebase. Every change is a gamble.
                You have live users and no idea what&apos;s holding the whole thing together.
              </p>
              <p className="text-lg font-semibold text-[#111]">
                That&apos;s the doom loop. Shepherd is the way out.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <RevealSection>
            <p className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-4 font-medium text-center">How it works</p>
            <h2 className="text-3xl font-bold text-[#111] mb-16 text-center">Five steps to a healthy app</h2>
          </RevealSection>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { icon: "🔗", step: "Connect", desc: "Paste your GitHub repo URL" },
              { icon: "🗺️", step: "Map", desc: "We crawl the file tree" },
              { icon: "🔍", step: "Audit", desc: "30+ checks run instantly" },
              { icon: "🔧", step: "Fix", desc: "Copy-paste fix instructions" },
              { icon: "📡", step: "Monitor", desc: "Re-scan after every push" },
            ].map(({ icon, step, desc }) => (
              <RevealSection key={step}>
                <motion.div
                  className="text-center"
                  whileHover={prefersReduced ? {} : { y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-3xl mb-3">{icon}</div>
                  <div className="font-semibold text-[#111] mb-1">{step}</div>
                  <div className="text-sm text-[#6B7280] leading-relaxed">{desc}</div>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why free */}
      <section className="bg-white border-y border-[#E5E5E0] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <RevealSection>
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-4 font-medium">Why is this free?</p>
              <h2 className="text-3xl font-bold text-[#111] mb-6">Because watching vibe-coded apps explode in production makes us sad.</h2>
              <p className="text-lg text-[#4B5563] leading-relaxed">
                Also we&apos;re building in public. Scan as many repos as you want, you menace. No account,
                no credit card, no &ldquo;free tier&rdquo; that runs out after 5 scans.
                Just paste a URL and get your score.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Score tiers */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <RevealSection>
            <p className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-4 font-medium text-center">Score tiers</p>
            <h2 className="text-3xl font-bold text-[#111] mb-12 text-center">Where does your app land?</h2>
          </RevealSection>
          <div className="max-w-2xl mx-auto space-y-3">
            {[
              { range: "90–100", label: "Immortal Sheep 🛡️", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", desc: "We have no notes. Annoyingly impressive." },
              { range: "70–89", label: "Mostly Alive", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", desc: "Good shape. A few loose threads, but nothing's on fire." },
              { range: "50–69", label: "Limping Along", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", desc: "It runs. Barely. Like a three-legged sheep." },
              { range: "30–49", label: "One Deploy From Disaster", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", desc: "One bad push from becoming someone else's problem." },
              { range: "0–29", label: "Call the Vet 💀", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", desc: "The sheep has seen better days. Many better days." },
            ].map(({ range, label, color, bg, border, desc }) => (
              <RevealSection key={range}>
                <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: bg, borderColor: border }}>
                  <div className="w-16 text-center font-mono text-xs text-[#9CA3AF] flex-shrink-0">{range}</div>
                  <div className="font-semibold text-sm flex-shrink-0 w-48" style={{ color }}>{label}</div>
                  <div className="text-sm text-[#6B7280]">{desc}</div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Notification signup */}
      <section className="bg-white border-y border-[#E5E5E0] py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <RevealSection>
            <h2 className="text-2xl font-bold text-[#111] mb-3">Get notified when Shepherd learns new tricks</h2>
            <p className="text-[#6B7280] mb-8 text-sm">
              Optional. No spam. Just a note when we add new checks, improvements, or actually important stuff.
            </p>
            {submitted ? (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] rounded-lg px-6 py-4 font-medium">
                You&apos;re in the flock. 🐑 We&apos;ll only email when it&apos;s worth it.
              </div>
            ) : (
              <form onSubmit={handleNotify} className="flex gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 border border-[#E5E5E0] rounded-md px-4 py-3 text-sm bg-[#FAFAF7] focus:outline-none focus:border-[#111] transition-colors"
                />
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={prefersReduced ? {} : { scale: 1.03 }}
                  whileTap={prefersReduced ? {} : { scale: 0.97 }}
                  className="bg-[#111] text-white px-5 py-3 rounded-md text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? "..." : "Notify me"}
                </motion.button>
              </form>
            )}
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E0] py-8 relative">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-[#9CA3AF]">
          <div className="flex items-center gap-2">
            <span>🐑</span>
            <span>Shepherd</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/scan" className="hover:text-[#111] transition-colors">Scan</Link>
            <Link href="/wall" className="hover:text-[#111] transition-colors">Wall of Fame</Link>
            <Link href="/report/demo" className="hover:text-[#111] transition-colors">Sample Report</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
