"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // silently succeed — we always show success
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Nav */}
      <nav className="border-b border-[#E5E5E0] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#111] text-lg">
            <span>🐑</span>
            <span>Shepherd</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[#6B7280]">
            <Link href="/report/demo" className="hover:text-[#111] transition-colors">Sample Report</Link>
            <Link
              href="/scan"
              className="bg-[#111] text-white px-4 py-2 rounded-md hover:bg-[#333] transition-colors"
            >
              Scan my app
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#F0FDF4] text-[#16A34A] text-sm font-medium px-3 py-1 rounded-full border border-[#BBF7D0] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block" />
          Free survival scan — no account needed
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#111] leading-tight mb-6">
          You vibe-coded it.
          <br />
          <span className="text-[#16A34A]">Shepherd keeps it alive.</span>
        </h1>
        <p className="text-xl text-[#6B7280] max-w-2xl mx-auto mb-10 leading-relaxed">
          Every AI-built app has hidden landmines. Exposed secrets, broken auth, dependency rot.
          Shepherd finds them before your users do.
        </p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-[#111] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#333] transition-colors"
        >
          Scan my app <span>→</span>
        </Link>
        <p className="text-sm text-[#9CA3AF] mt-4">Works on any public GitHub repo. Takes ~10 seconds.</p>
      </section>

      {/* The Doom Loop */}
      <section className="bg-white border-y border-[#E5E5E0] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-4 font-medium">The Problem</p>
            <h2 className="text-3xl font-bold text-[#111] mb-6">The Doom Loop</h2>
            <p className="text-lg text-[#4B5563] mb-6 leading-relaxed">
              You ship fast with AI. It works. Then something breaks. You ask AI to fix it — and it fixes it,
              but now three other things are broken. You fix those. Something else breaks.
            </p>
            <p className="text-lg text-[#4B5563] mb-6 leading-relaxed">
              Eventually, you&apos;re afraid to touch the codebase. Every change is a gamble.
              You have a live product, real users, and no idea what&apos;s holding it together.
            </p>
            <p className="text-lg font-medium text-[#111]">
              That&apos;s the doom loop. Shepherd is the way out.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-4 font-medium text-center">How it works</p>
          <h2 className="text-3xl font-bold text-[#111] mb-16 text-center">Five steps to a healthy app</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { icon: "🔗", step: "Connect", desc: "Link your GitHub repo in one click" },
              { icon: "🗺️", step: "Map", desc: "We build a complete picture of your app" },
              { icon: "🔍", step: "Audit", desc: "Static analysis finds every landmine" },
              { icon: "🔧", step: "Fix", desc: "Clear instructions, no jargon, prioritized" },
              { icon: "📡", step: "Monitor", desc: "Continuous watch — new issues alert you" },
            ].map(({ icon, step, desc }) => (
              <div key={step} className="text-center">
                <div className="text-3xl mb-3">{icon}</div>
                <div className="font-semibold text-[#111] mb-1">{step}</div>
                <div className="text-sm text-[#6B7280] leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border-y border-[#E5E5E0] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-4 font-medium text-center">Pricing</p>
          <h2 className="text-3xl font-bold text-[#111] mb-16 text-center">Simple, honest pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="border border-[#E5E5E0] rounded-xl p-8 bg-[#FAFAF7]">
              <div className="text-sm font-medium text-[#6B7280] mb-2">Free</div>
              <div className="text-4xl font-bold text-[#111] mb-1">$0</div>
              <div className="text-sm text-[#9CA3AF] mb-8">forever</div>
              <ul className="space-y-3 text-sm text-[#4B5563] mb-8">
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> One-time survival scan</li>
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Public repos only</li>
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Shareable score card</li>
              </ul>
              <Link
                href="/scan"
                className="block w-full text-center border border-[#111] text-[#111] px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#111] hover:text-white transition-colors"
              >
                Scan now →
              </Link>
            </div>
            <div className="border-2 border-[#111] rounded-xl p-8 bg-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111] text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                Most popular
              </div>
              <div className="text-sm font-medium text-[#6B7280] mb-2">Pro</div>
              <div className="text-4xl font-bold text-[#111] mb-1">$49</div>
              <div className="text-sm text-[#9CA3AF] mb-8">per month</div>
              <ul className="space-y-3 text-sm text-[#4B5563] mb-8">
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Weekly automated audits</li>
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Private repos</li>
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Email + Slack alerts</li>
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Fix suggestions with context</li>
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Up to 5 repos</li>
              </ul>
              <button className="block w-full text-center bg-[#111] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#333] transition-colors">
                Join waitlist
              </button>
            </div>
            <div className="border border-[#E5E5E0] rounded-xl p-8 bg-[#FAFAF7]">
              <div className="text-sm font-medium text-[#6B7280] mb-2">Studio</div>
              <div className="text-4xl font-bold text-[#111] mb-1">$199</div>
              <div className="text-sm text-[#9CA3AF] mb-8">per month</div>
              <ul className="space-y-3 text-sm text-[#4B5563] mb-8">
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Everything in Pro</li>
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Unlimited repos</li>
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Auto PR fixes</li>
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Priority support</li>
                <li className="flex items-center gap-2"><span className="text-[#16A34A]">✓</span> Team seats (up to 10)</li>
              </ul>
              <button className="block w-full text-center border border-[#111] text-[#111] px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#111] hover:text-white transition-colors">
                Join waitlist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist capture */}
      <section className="py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#111] mb-4">Get early access</h2>
          <p className="text-[#6B7280] mb-8">
            Join the waitlist for Pro and Studio. No spam, just a ping when we&apos;re ready.
          </p>
          {submitted ? (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] rounded-lg px-6 py-4 font-medium">
              You&apos;re on the list. We&apos;ll be in touch. 🐑
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 border border-[#E5E5E0] rounded-md px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#111] transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#111] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50"
              >
                {loading ? "..." : "Join waitlist"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E0] py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-[#9CA3AF]">
          <div className="flex items-center gap-2">
            <span>🐑</span>
            <span>Shepherd</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/scan" className="hover:text-[#111] transition-colors">Scan</Link>
            <Link href="/report/demo" className="hover:text-[#111] transition-colors">Sample Report</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
