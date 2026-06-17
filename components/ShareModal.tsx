"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import VibeSheep from "@/components/mascots/VibeSheep";
import { getTier, TIERS, type ScoreTier } from "@/lib/tiers";

/**
 * ShareModal: pops up when the user taps "Share score".
 * Shows an animated banner that builds itself, then lets them download the
 * polished PNG (same image that unfurls on X) or post straight to X.
 */

export default function ShareModal({
  open,
  onClose,
  score,
  repo,
}: {
  open: boolean;
  onClose: () => void;
  score: number;
  repo: string;
}) {
  const reduced = useReducedMotion();
  const tier: ScoreTier = getTier(score);
  const t = TIERS[tier];
  const [count, setCount] = useState(reduced ? score : 0);
  const [downloading, setDownloading] = useState(false);
  const raf = useRef(0);

  // animated count-up each time the modal opens
  useEffect(() => {
    if (!open) return;
    if (reduced) {
      setCount(score);
      return;
    }
    setCount(0);
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1100);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * score));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [open, score, reduced]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const ogUrl = `/api/og?score=${score}&repo=${encodeURIComponent(repo)}`;
  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/scan?score=${score}&repo=${encodeURIComponent(repo)}`
      : "";

  const tweetText = `My app scored ${score}/100 on its Survival Score 🐑\n\n"${t.label}"\n\nScan yours free (no login):`;
  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}&url=${encodeURIComponent(pageUrl)}`;

  async function downloadBanner() {
    try {
      setDownloading(true);
      const res = await fetch(ogUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shepherd-score-${score}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // if download fails, open the image so they can save it manually
      window.open(ogUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  const mood = t.mood;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ background: "rgba(14,21,18,0.7)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-2xl border-2 border-ink bg-cream shadow-terminal"
            initial={reduced ? {} : { scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={reduced ? {} : { scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* animated banner preview */}
            <div className="relative overflow-hidden bg-night p-6">
              {/* terminal chrome */}
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-2 font-mono text-xs text-[#5E7268]">shepherd scan</span>
              </div>

              <div className="flex items-center gap-5">
                {/* ring */}
                <div
                  className="flex h-28 w-28 flex-shrink-0 flex-col items-center justify-center rounded-full bg-night-soft"
                  style={{ border: `6px solid ${t.color}` }}
                >
                  <span className="font-display text-4xl font-extrabold text-cream tabular-nums">
                    {count}
                  </span>
                  <span className="font-mono text-xs text-[#5E7268]">/ 100</span>
                </div>

                <div className="min-w-0 flex-1">
                  <motion.div
                    initial={reduced ? {} : { scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 300, damping: 15 }}
                    className="inline-block rounded-lg px-3 py-1 font-display text-sm font-bold"
                    style={{ background: t.color, color: "#0E1512" }}
                  >
                    {t.label}
                  </motion.div>
                  <p className="mt-2 font-display text-xl font-extrabold text-cream">
                    Survival Score
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-[#5E7268]">{repo}</p>
                </div>

                {/* mascot peeking */}
                <motion.div
                  initial={reduced ? {} : { y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1, type: "spring", stiffness: 200, damping: 16 }}
                  className="flex-shrink-0 self-end"
                >
                  <VibeSheep mood={mood} size={72} />
                </motion.div>
              </div>

              <motion.p
                initial={reduced ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-4 text-sm italic text-[#A8BBB0]"
              >
                &ldquo;{t.roast}&rdquo;
              </motion.p>
            </div>

            {/* actions */}
            <div className="p-5">
              <p className="mb-3 text-center font-mono text-xs text-ink-faint">
                Download the card, then post it. Or let us write the tweet for you.
              </p>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  onClick={downloadBanner}
                  disabled={downloading}
                  className="flex-1 rounded-xl border-2 border-ink bg-cream px-4 py-3 font-display font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-wool disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  {downloading ? "Saving..." : "↓ Download card"}
                </button>
                <a
                  href={xIntent}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl border-2 border-ink bg-ink px-4 py-3 text-center font-display font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-pasture motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  Share on 𝕏
                </a>
              </div>
              <button
                onClick={onClose}
                className="mt-3 w-full text-center font-mono text-xs text-ink-faint hover:text-ink"
              >
                close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
