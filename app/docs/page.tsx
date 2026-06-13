"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import VibeSheep from "@/components/mascots/VibeSheep";
import { DOC_RULES, DOC_CATEGORIES, RULE_COUNT, SUPPORTED_LANGS } from "@/lib/docs-data";

const SECTIONS = [
  { id: "how-it-works", label: "How it works" },
  { id: "languages", label: "Languages" },
  { id: "survival-score", label: "The score" },
  { id: "rule-catalog", label: "Every check" },
  { id: "limitations", label: "What it can't do" },
  { id: "privacy", label: "Privacy" },
  { id: "faq", label: "FAQ" },
];

const PIPELINE = [
  { step: "grab", text: "Reads your repo's file list from GitHub's public API. No login, no install." },
  { step: "read", text: "Opens up to 120 of your code files and reads them in memory." },
  { step: "check", text: `Runs ${RULE_COUNT} checks per file, picking the right ones for each language.` },
  { step: "look up", text: "Asks the OSV vulnerability database if any of your packages have known holes." },
  { step: "score", text: "Adds up what it found and turns it into one number out of 100." },
];

function Sidebar({ active }: { active: string }) {
  return (
    <nav className="hidden w-48 flex-shrink-0 lg:block">
      <div className="sticky top-24 space-y-1">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`block rounded-lg px-3 py-1.5 font-mono text-sm transition-colors ${
              active === s.id ? "bg-wool text-ink" : "text-ink-faint hover:text-ink"
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export default function DocsPage() {
  const [active, setActive] = useState("how-it-works");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const cats = ["All", ...DOC_CATEGORIES];
  const filtered = DOC_RULES.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = !q || r.title.toLowerCase().includes(q) || r.plain.toLowerCase().includes(q);
    const matchC = cat === "All" || r.category === cat;
    return matchQ && matchC;
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
      <div className="mb-12 flex items-end gap-4">
        <VibeSheep mood="happy" size={64} />
        <div>
          <p className="eyebrow mb-2">docs</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
            How Shepherd works
          </h1>
        </div>
      </div>

      <div className="flex gap-12">
        <Sidebar active={active} />

        <div className="min-w-0 flex-1 space-y-16">
          <section id="how-it-works" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-ink">How it works</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              You paste a public GitHub repo. Shepherd reads your code, looks for the
              usual ways apps get hacked or break, and hands you a score with a list of
              what to fix. It takes about ten seconds. Here is what happens in that time:
            </p>
            <ol className="mt-6 space-y-3">
              {PIPELINE.map((p, i) => (
                <li key={p.step} className="flex gap-4 rounded-xl border-2 border-ink bg-cream p-4 shadow-card">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-pasture font-mono text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-display font-bold text-ink">{p.step}</span>
                    <span className="text-ink-soft"> &middot; {p.text}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="languages" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-ink">Languages it reads</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              Some checks, like finding leaked keys, run on every file no matter the
              language. Others are picked for the language of each file. For example,
              Shepherd looks for reentrancy in Solidity, unsafe blocks in Rust, and open
              CORS in your API code.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SUPPORTED_LANGS.map((l) => (
                <span key={l} className="rounded-lg border-2 border-ink bg-wool px-3 py-1 font-mono text-sm text-ink">
                  {l}
                </span>
              ))}
            </div>
          </section>

          <section id="survival-score" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-ink">The Survival Score</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              The score is one number from 0 to 100. Everybody starts at 100. Each thing
              Shepherd finds takes points away, and worse problems take more:
            </p>
            <div className="mt-5 overflow-hidden rounded-xl border-2 border-ink bg-night font-mono text-sm text-[#A8BBB0] shadow-terminal">
              <div className="border-b border-[#22302A] px-4 py-2 text-xs text-[#5E7268]">how the math works</div>
              <pre className="overflow-x-auto p-4 text-cream">{`start:           100 points
each critical:   minus 16
each medium:     minus 6
each low:        minus 2

score = whatever is left (never below 0)`}</pre>
            </div>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Quick example: one leaked key (critical) and two small things (low) gives
              100 - 16 - 2 - 2 = 80. That lands in &ldquo;Mostly Alive&rdquo;.
            </p>
            <p className="mt-3 leading-relaxed text-ink-soft">
              We also show how many checks passed. A good repo lights up with passed
              checks, which is the honest way to show the score is earned.
            </p>
          </section>

          <section id="rule-catalog" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-ink">Every check, listed</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              All {RULE_COUNT} checks Shepherd runs. This list is built straight from the
              scanner, so it is always what actually runs. Search it or filter by group.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search checks..."
                className="flex-1 rounded-xl border-2 border-wool-line bg-white px-4 py-2.5 font-mono text-sm transition-colors focus:border-ink focus:outline-none"
              />
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="rounded-xl border-2 border-wool-line bg-white px-4 py-2.5 font-mono text-sm focus:border-ink focus:outline-none"
              >
                {cats.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {filtered.map((r) => (
                <div key={r.id} className="rounded-xl border-2 border-ink bg-cream p-4 shadow-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold text-white ${
                        r.severity === "critical" ? "bg-danger" : r.severity === "medium" ? "bg-amber" : "bg-ink-faint"
                      }`}
                    >
                      {r.severity}
                    </span>
                    <span className="font-display font-bold text-ink">{r.title}</span>
                    <span className="ml-auto font-mono text-xs text-ink-faint">{r.category}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.plain}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 font-mono text-xs text-ink-faint">
                    <span>runs on: {r.langs}</span>
                    <span>how sure: {r.confidence === "high" ? "pretty sure" : r.confidence === "medium" ? "fairly sure" : "worth a look"}</span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="rounded-xl border-2 border-dashed border-wool-line p-8 text-center font-mono text-sm text-ink-faint">
                  No checks match that. Try another word.
                </p>
              )}
            </div>
          </section>

          <section id="limitations" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-ink">What it can&apos;t do</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              Being straight with you matters more than looking clever, so here is where
              Shepherd stops:
            </p>
            <ul className="mt-4 space-y-3">
              {[
                ["It reads, it does not run.", "Shepherd looks at your code as text. It does not run your app, so it can miss bugs that only show up while running."],
                ["Public repos only, for now.", "Private repos need a GitHub login, which is on the roadmap."],
                ["It uses patterns, so it is not perfect.", "A clean score does not mean you cannot be hacked. It means the common traps are not obvious in your code."],
                ["For real money, get a human too.", "If your app holds real money or sensitive data, also pay for a human security review. Shepherd is a great first pass, not the last word."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-xl border-2 border-ink bg-wool/40 p-4">
                  <span className="font-display font-bold text-ink">{t}</span>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{d}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="privacy" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-ink">Privacy</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">
              <p>
                Shepherd reads your code through GitHub&apos;s public API and checks it in
                memory. When the scan is done, that code is gone. We do not save your files.
              </p>
              <p>
                If you tick the box to join the Wall of Fame, we keep only a random ID, your
                score, the tier, the top issue type, and how many issues there were. Your
                repo name is not shown.
              </p>
              <p>The scan history on the scan page lives in your browser, not on our servers.</p>
            </div>
          </section>

          <section id="faq" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-ink">FAQ</h2>
            <div className="mt-4 space-y-4">
              {[
                ["Is this safe to run on my repo?", "Yes. Shepherd only reads. It never writes to your repo, never opens a pull request, and never runs your code."],
                ["Why is it free?", "Because we are building in public and watching apps blow up in production makes us sad. No catch."],
                ["My score is 23. Am I doomed?", "No. Vibe has survived worse. Fix the critical items first, scan again, and watch the number climb."],
                ["Does a high score mean I am unhackable?", "No. It means the common mistakes are not sitting in plain sight. Keep good habits and, for serious apps, get a human review too."],
                ["Which languages does it support?", `Right now: ${SUPPORTED_LANGS.join(", ")}. Secret detection works on any file.`],
              ].map(([q, a]) => (
                <div key={q} className="rounded-xl border-2 border-ink bg-cream p-4 shadow-card">
                  <p className="font-display font-bold text-ink">{q}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border-2 border-ink bg-night p-8 text-center">
            <p className="font-display text-xl font-bold text-cream">Ready to see your score?</p>
            <p className="mt-2 font-mono text-sm text-[#5E7268]">free, no account, paste a repo URL</p>
            <Link
              href="/scan"
              className="mt-5 inline-block rounded-xl border-2 border-cream bg-pasture px-7 py-3 font-display font-bold text-white transition-all hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Scan my app →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
