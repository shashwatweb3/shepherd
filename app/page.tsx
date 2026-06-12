"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Hero from "@/components/Hero";
import VibeSheep from "@/components/mascots/VibeSheep";
import { TIERS } from "@/lib/tiers";

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduced ? {} : { opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Doom Loop (night section) ---------------- */

const LOOP_STEPS = [
  "ask AI to fix the bug",
  "AI breaks two other things",
  "ask AI to fix those",
  "the original bug returns",
];

function DoomLoop() {
  return (
    <section className="bg-night text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-mono text-sm text-[#4ADE80]">
            <span className="opacity-60">$ </span>the-problem
          </p>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Night falls on every
            <br />
            vibe-coded app.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#A8BBB0]">
            You shipped fast. It worked. Then something broke — and every AI
            &ldquo;fix&rdquo; broke something else. Now you&apos;re afraid to touch your own
            product.
          </p>
          <p className="mt-4 max-w-md text-lg font-semibold text-cream">
            That&apos;s the doom loop. Shepherd is the way out.
          </p>
        </div>

        {/* the loop, drawn as an actual loop (circle on sm+, vertical cycle on mobile) */}
        <Reveal>
          {/* mobile: vertical cycle */}
          <div className="sm:hidden">
            <div className="mx-auto flex max-w-[300px] flex-col items-center gap-2">
              {LOOP_STEPS.map((step) => (
                <div key={step} className="w-full">
                  <div className="rounded-xl border border-[#2A3A32] bg-night-soft px-4 py-3 text-center font-mono text-xs text-[#C9D6CE]">
                    {step}
                  </div>
                  <div className="py-1 text-center font-mono text-sm text-danger" aria-hidden="true">
                    ↓
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2 text-center font-mono text-xs text-[#FF7B72]">
                ↺ back to step 1, forever
              </div>
              <div className="mt-4 text-center">
                <VibeSheep mood="critical" size={96} />
                <p className="mt-1 font-mono text-[11px] text-[#5E7268]">vibe, stuck in the loop</p>
              </div>
            </div>
          </div>

          {/* sm+: the circle */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-[400px] sm:block">
            {/* circle */}
            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle
                cx="200"
                cy="200"
                r="150"
                fill="none"
                stroke="#22302A"
                strokeWidth="2"
                strokeDasharray="6 8"
              />
              {/* arrowhead showing direction */}
              <path d="M200 44 L212 54 L200 64 Z" fill="#DC2626" transform="rotate(14 200 200)" />
            </svg>
            {/* steps placed around the circle */}
            {LOOP_STEPS.map((step, i) => {
              const angle = (i / LOOP_STEPS.length) * 2 * Math.PI - Math.PI / 2;
              const x = 50 + 43 * Math.cos(angle);
              const y = 50 + 43 * Math.sin(angle);
              return (
                <div
                  key={step}
                  className="absolute w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#2A3A32] bg-night-soft px-3 py-2.5 text-center font-mono text-xs leading-snug text-[#C9D6CE]"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {step}
                </div>
              );
            })}
            {/* center: poor Vibe */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <VibeSheep mood="critical" size={104} />
              <p className="mt-1 font-mono text-[11px] text-[#5E7268]">vibe, stuck in the loop</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- How it works (numbered trail) ---------------- */

const STEPS = [
  { n: "01", name: "paste", desc: "Drop in any public GitHub repo URL. No login, no install, no GitHub app." },
  { n: "02", name: "scan", desc: "142 static checks run against your real files — secrets, auth, CORS, CVEs, git history." },
  { n: "03", name: "score", desc: "One Survival Score, 0–100, with evidence: file, line, and a redacted excerpt for every finding." },
  { n: "04", name: "fix", desc: "Copy the full report as markdown and paste it into Cursor, Lovable, or Claude: \u201cfix all of this.\u201d" },
  { n: "05", name: "re-scan", desc: "Push, scan again, watch the score climb. Your flock history is saved on this device." },
];

function Trail() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <Reveal>
        <p className="eyebrow">how-it-works</p>
        <h2 className="mt-5 max-w-xl font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
          Five steps. No jargon. No 900-line explanation.
        </h2>
      </Reveal>

      <div className="relative mt-14">
        {/* the trail line */}
        <div
          aria-hidden="true"
          className="absolute bottom-6 left-[19px] top-6 w-px border-l-2 border-dashed border-wool-line lg:bottom-auto lg:left-6 lg:right-6 lg:top-[19px] lg:h-px lg:w-auto lg:border-l-0 lg:border-t-2"
        />
        <ol className="relative grid gap-10 lg:grid-cols-5 lg:gap-6">
          {STEPS.map(({ n, name, desc }, i) => (
            <Reveal key={n} delay={i * 0.07}>
              <li className="flex gap-5 lg:block">
                <span className="z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-pasture font-mono text-sm font-bold text-white shadow-lift">
                  {n}
                </span>
                <div className="lg:mt-5">
                  <h3 className="font-display text-xl font-bold text-ink">{name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{desc}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- Tier ruler ---------------- */

const TIER_RANGES = ["90–100", "70–89", "50–69", "30–49", "0–29"];
const TIER_LIST = Object.values(TIERS);

function TierRuler() {
  return (
    <section className="border-y border-wool-line bg-wool/50">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="eyebrow">score-tiers</p>
          <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Where does your app land?
          </h2>
        </Reveal>

        <div className="mt-12 overflow-hidden rounded-2xl border-2 border-ink bg-cream shadow-card">
          {TIER_LIST.map((tier, i) => (
            <Reveal key={tier.label} delay={i * 0.06}>
              <div
                className={`grid grid-cols-[64px_56px_1fr] items-center gap-4 px-4 py-4 sm:grid-cols-[90px_64px_240px_1fr] sm:px-6 ${
                  i > 0 ? "border-t border-wool-line" : ""
                }`}
              >
                <span className="font-mono text-xs text-ink-faint">{TIER_RANGES[i]}</span>
                <VibeSheep mood={tier.mood} size={56} />
                <span className="font-display text-base font-bold sm:text-lg" style={{ color: tier.color }}>
                  {tier.label}
                </span>
                <span className="col-span-3 text-sm text-ink-soft sm:col-span-1">{tier.roast}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Why free + signup ---------------- */

function WhyFree() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
      // succeed anyway
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2">
      <Reveal>
        <p className="eyebrow">why-free</p>
        <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
          Because watching apps explode in production makes us sad.
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
          We&apos;re building in public. No account, no credit card, no free tier
          that dies after 5 scans. Paste a URL, get your score, fix your app,
          you menace.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="rounded-2xl border-2 border-ink bg-cream p-6 shadow-card sm:p-8">
          <h3 className="font-display text-xl font-bold text-ink">
            Get a ping when Shepherd learns new tricks
          </h3>
          <p className="mt-2 text-sm text-ink-soft">
            Optional. New checks, new features, nothing else.
          </p>
          {submitted ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-pasture/30 bg-pasture/10 px-4 py-3">
              <VibeSheep mood="happy" size={40} />
              <span className="text-sm font-medium text-pasture-deep">
                You&apos;re in the flock. We&apos;ll only email when it&apos;s worth it.
              </span>
            </div>
          ) : (
            <form onSubmit={handleNotify} className="mt-6 flex gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="min-w-0 flex-1 rounded-xl border-2 border-wool-line bg-white px-4 py-3 font-mono text-sm transition-colors focus:border-ink focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl border-2 border-ink bg-ink px-5 py-3 font-display text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-pasture disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {loading ? "..." : "Notify me"}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */

function FinalCta() {
  return (
    <section className="bg-night">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-20 text-center sm:px-8">
        <VibeSheep mood="scanning" size={120} />
        <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
          Your repo already knows its score.
        </h2>
        <p className="mt-3 font-mono text-sm text-[#5E7268]">
          ~10 seconds. nothing stored. only your ego at risk.
        </p>
        <Link
          href="/scan"
          className="mt-8 rounded-xl border-2 border-cream bg-pasture px-8 py-4 font-display text-lg font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_#FAF8F2] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          Find out →
        </Link>
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */

export default function Home() {
  return (
    <main>
      <Hero />
      <DoomLoop />
      <Trail />
      <TierRuler />
      <WhyFree />
      <FinalCta />
    </main>
  );
}
