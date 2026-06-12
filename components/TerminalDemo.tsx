"use client";

import { useEffect, useRef, useState } from "react";

/**
 * TerminalDemo — the hero's signature element.
 * A terminal window that runs a fake Shepherd scan on loop,
 * line by line, so visitors see the product before reading a word.
 */

type Line = {
  text: string;
  tone: "cmd" | "dim" | "crit" | "warn" | "pass" | "score";
  pause?: number; // ms after the line lands
};

const SCRIPT: Line[] = [
  { text: "$ shepherd scan github.com/maya/recipe-app", tone: "cmd", pause: 500 },
  { text: "fetching repo ......... 87 files", tone: "dim", pause: 250 },
  { text: "running 142 checks ....", tone: "dim", pause: 450 },
  { text: "✗ CRITICAL  .env committed to repo (yes, really)", tone: "crit", pause: 320 },
  { text: "✗ CRITICAL  Stripe live key — checkout.ts:12", tone: "crit", pause: 320 },
  { text: "✗ HIGH      CORS set to * — api/config.ts:4", tone: "warn", pause: 320 },
  { text: "✓ 31 checks passed", tone: "pass", pause: 420 },
  { text: "Survival Score: 38/100 — One Deploy From Disaster", tone: "score", pause: 2600 },
];

const TONE_CLASS: Record<Line["tone"], string> = {
  cmd: "text-[#E8F5EC]",
  dim: "text-[#5E7268]",
  crit: "text-[#FF7B72]",
  warn: "text-[#F2B35C]",
  pass: "text-[#4ADE80]",
  score: "text-[#FAF8F2] font-bold",
};

export default function TerminalDemo() {
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState("");
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setLines(SCRIPT);
      return;
    }

    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const run = async () => {
      while (alive) {
        setLines([]);
        for (const line of SCRIPT) {
          if (!alive) return;
          // type the command character by character; print output lines whole
          if (line.tone === "cmd") {
            for (let i = 1; i <= line.text.length; i++) {
              if (!alive) return;
              setTyping(line.text.slice(0, i));
              await new Promise((r) => (timer = setTimeout(r, 24)));
            }
            setTyping("");
          }
          setLines((prev) => [...prev, line]);
          await new Promise((r) => (timer = setTimeout(r, line.pause ?? 280)));
        }
      }
    };
    run();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-ink bg-night shadow-terminal">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-[#22302A] bg-night-soft px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        <span className="ml-3 font-mono text-xs text-[#5E7268]">
          shepherd — 80×24
        </span>
      </div>

      {/* output */}
      <div
        className="h-[280px] space-y-1.5 overflow-hidden p-4 font-mono text-[13px] leading-relaxed sm:h-[300px] sm:p-5"
        aria-label="Demo of a Shepherd scan finding 3 issues and scoring 38 out of 100"
      >
        {lines.map((line, i) => (
          <div key={i} className={TONE_CLASS[line.tone]}>
            {line.text}
          </div>
        ))}
        {typing && (
          <div className={TONE_CLASS.cmd}>
            {typing}
            <span className="terminal-caret" aria-hidden="true">▌</span>
          </div>
        )}
        {!typing && lines.length === SCRIPT.length && (
          <div className={TONE_CLASS.cmd}>
            $ <span className="terminal-caret" aria-hidden="true">▌</span>
          </div>
        )}
      </div>

      <style>{`
        .terminal-caret { color: #16A34A; animation: caretBlink 1s steps(1) infinite; }
        @keyframes caretBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .terminal-caret { animation: none; } }
      `}</style>
    </div>
  );
}
