"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { getTier, TIER_COLORS, TIER_LABELS } from "@/lib/tiers";
import type { ScoreTier } from "@/lib/tiers";
import VibeSheep from "@/components/mascots/VibeSheep";

interface ScoreRingProps {
  score: number;
  /** If true, count-up animation plays on mount */
  animate?: boolean;
}

export default function ScoreRing({ score, animate: doAnimate = true }: ScoreRingProps) {
  const tier: ScoreTier = getTier(score);
  const color = TIER_COLORS[tier];
  const label = TIER_LABELS[tier];
  const prefersReduced = useReducedMotion();
  const [displayed, setDisplayed] = useState(doAnimate && !prefersReduced ? 0 : score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    if (!doAnimate || prefersReduced) {
      setDisplayed(score);
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.floor(score / 40));
    const interval = setInterval(() => {
      current = Math.min(score, current + step);
      setDisplayed(current);
      if (current >= score) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [score, doAnimate, prefersReduced]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score ring */}
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128" aria-hidden>
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#E5E5E0" strokeWidth="10" />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: prefersReduced ? "none" : "stroke-dashoffset 0.05s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-[#111]" aria-live="polite">{displayed}</span>
          <span className="text-xs text-[#6B7280]">/100</span>
        </div>
      </div>

      {/* Sheep mascot */}
      <VibeSheep mood={getTier(displayed) === "immortal" ? "crowned" : getTier(displayed) === "call-the-vet" ? "critical" : getTier(displayed) === "limping" || getTier(displayed) === "one-deploy" ? "nervous" : "happy"} size={64} />

      {/* Tier badge */}
      <motion.div
        initial={prefersReduced ? {} : { scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, delay: 0.3 }}
        className="px-3 py-1 rounded-full text-sm font-semibold"
        style={{
          background: `${color}15`,
          color,
          border: `1.5px solid ${color}40`,
        }}
      >
        {label}
      </motion.div>
    </div>
  );
}
