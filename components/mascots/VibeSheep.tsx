import type { VibeMood } from "@/lib/tiers";

interface VibeSheepProps {
  mood?: VibeMood;
  size?: number;
  className?: string;
}

export default function VibeSheep({ mood = "happy", size = 80, className }: VibeSheepProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`Sheep — ${mood}`}
    >
      <style>{`
        @keyframes vibe-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.04); }
        }
        @keyframes vibe-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes vibe-tail {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(12deg); }
          75% { transform: rotate(-8deg); }
        }
        @keyframes vibe-sweat {
          0%, 100% { opacity: 0.7; transform: translateY(0px); }
          50% { opacity: 1; transform: translateY(2px); }
        }
        @keyframes vibe-scan-glass {
          0% { transform: translateX(-6px) translateY(0px); }
          33% { transform: translateX(6px) translateY(-3px); }
          66% { transform: translateX(0px) translateY(3px); }
          100% { transform: translateX(-6px) translateY(0px); }
        }
        @keyframes vibe-zzz {
          0%, 100% { opacity: 0; transform: translate(0,0) scale(0.6); }
          30% { opacity: 1; transform: translate(-3px,-4px) scale(0.8); }
          60% { opacity: 1; transform: translate(-6px,-8px) scale(1); }
          90% { opacity: 0; transform: translate(-9px,-12px) scale(1.1); }
        }
        @keyframes vibe-zzz2 {
          0%, 100% { opacity: 0; transform: translate(0,0) scale(0.5); }
          20% { opacity: 0; }
          50% { opacity: 1; transform: translate(-4px,-6px) scale(0.9); }
          80% { opacity: 0; transform: translate(-8px,-12px) scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>

      {/* Tail */}
      <g
        style={{
          transformOrigin: "82px 62px",
          animation: mood === "sleeping" ? "none" : "vibe-tail 2.4s ease-in-out infinite",
        }}
      >
        <ellipse cx="83" cy="62" rx="5" ry="4" fill="#E8E8E0" />
      </g>

      {/* Body wool — overlapping circles */}
      <g style={{ transformOrigin: "50px 65px", animation: "vibe-breathe 3s ease-in-out infinite" }}>
        <circle cx="38" cy="68" r="14" fill="#F0F0E8" />
        <circle cx="53" cy="65" r="15" fill="#EBEBDE" />
        <circle cx="67" cy="67" r="13" fill="#F0F0E8" />
        <circle cx="45" cy="59" r="13" fill="#E8E8DC" />
        <circle cx="60" cy="58" r="13" fill="#F0F0E8" />
        <circle cx="52" cy="70" r="11" fill="#EBEBDE" />
      </g>

      {/* Legs */}
      <rect x="38" y="79" width="6" height="13" rx="3" fill="#C8B8A8" />
      <rect x="50" y="80" width="6" height="12" rx="3" fill="#C8B8A8" />
      <rect x="62" y="79" width="6" height="13" rx="3" fill="#C8B8A8" />

      {/* Hooves */}
      <ellipse cx="41" cy="92" rx="4" ry="2.5" fill="#A89888" />
      <ellipse cx="53" cy="92" rx="4" ry="2.5" fill="#A89888" />
      <ellipse cx="65" cy="92" rx="4" ry="2.5" fill="#A89888" />

      {/* Head */}
      <ellipse cx="28" cy="52" rx="16" ry="15" fill="#F5F0E8" />

      {/* Ear */}
      <ellipse cx="16" cy="48" rx="5" ry="7" fill="#F5F0E8" transform="rotate(-15 16 48)" />
      <ellipse cx="16" cy="48" rx="3" ry="5" fill="#E8D0C8" transform="rotate(-15 16 48)" />

      {/* Head wool tuft */}
      <circle cx="28" cy="38" r="9" fill="#EBEBDE" />
      <circle cx="22" cy="40" r="7" fill="#F0F0E8" />
      <circle cx="34" cy="40" r="7" fill="#EBEBDE" />

      {/* Eyes — blink animation */}
      <g style={{ animation: mood === "sleeping" ? "none" : "vibe-blink 4s ease-in-out infinite" }}>
        {mood === "sleeping" ? (
          <>
            {/* Closed eyes / sleeping */}
            <path d="M21 50 Q23.5 48 26 50" stroke="#555" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M30 50 Q32.5 48 35 50" stroke="#555" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </>
        ) : mood === "critical" ? (
          <>
            {/* X eyes */}
            <line x1="20" y1="49" x2="24" y2="53" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="49" x2="20" y2="53" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="49" x2="34" y2="53" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
            <line x1="34" y1="49" x2="30" y2="53" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Normal eyes */}
            <ellipse cx="22" cy="51" rx="3" ry="3.5" fill="#2D2D2D" style={{ transformOrigin: "22px 51px" }} />
            <ellipse cx="34" cy="51" rx="3" ry="3.5" fill="#2D2D2D" style={{ transformOrigin: "34px 51px" }} />
            {/* Eye shine */}
            <circle cx="23.5" cy="49.5" r="1" fill="white" />
            <circle cx="35.5" cy="49.5" r="1" fill="white" />
          </>
        )}
      </g>

      {/* Mouth / expression */}
      {mood === "happy" || mood === "crowned" ? (
        <path d="M24 57 Q28 61 32 57" stroke="#555" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      ) : mood === "nervous" || mood === "scanning" ? (
        <path d="M24 58 Q28 56 32 58" stroke="#777" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      ) : mood === "critical" ? (
        <path d="M24 60 Q28 56 32 60" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      ) : (
        /* sleeping */
        <path d="M25 58 Q28 60 31 58" stroke="#888" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      )}

      {/* Nose */}
      <ellipse cx="28" cy="56" rx="3" ry="2" fill="#E8B8B0" />

      {/* Mood accessories */}

      {/* CROWNED: gold crown */}
      {mood === "crowned" && (
        <g>
          <rect x="18" y="33" width="20" height="6" rx="1" fill="#F59E0B" />
          <polygon points="18,33 21,27 24,33" fill="#F59E0B" />
          <polygon points="25,33 28,26 31,33" fill="#F59E0B" />
          <polygon points="32,33 35,27 38,33" fill="#F59E0B" />
          <circle cx="21" cy="34" r="1.2" fill="#FCD34D" />
          <circle cx="28" cy="34" r="1.2" fill="#FCD34D" />
          <circle cx="35" cy="34" r="1.2" fill="#FCD34D" />
        </g>
      )}

      {/* NERVOUS: sweat drop */}
      {(mood === "nervous") && (
        <g style={{ animation: "vibe-sweat 1.5s ease-in-out infinite" }}>
          <path d="M10 44 Q8 47 10 49 Q12 47 10 44Z" fill="#93C5FD" opacity="0.85" />
        </g>
      )}

      {/* SCANNING: magnifying glass overlay */}
      {mood === "scanning" && (
        <g style={{ animation: "vibe-scan-glass 2s ease-in-out infinite" }}>
          <circle cx="60" cy="30" r="12" stroke="#16A34A" strokeWidth="2.5" fill="none" opacity="0.8" />
          <line x1="69" y1="39" x2="76" y2="46" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
          {/* search pattern inside glass */}
          <line x1="55" y1="28" x2="65" y2="28" stroke="#16A34A" strokeWidth="1.5" opacity="0.5" />
          <line x1="55" y1="31" x2="63" y2="31" stroke="#16A34A" strokeWidth="1.5" opacity="0.5" />
        </g>
      )}

      {/* SLEEPING: ZZZ */}
      {mood === "sleeping" && (
        <>
          <text
            x="8"
            y="38"
            fontSize="7"
            fill="#9CA3AF"
            fontWeight="bold"
            style={{ animation: "vibe-zzz 2.4s ease-in-out infinite" }}
          >
            Z
          </text>
          <text
            x="4"
            y="31"
            fontSize="8"
            fill="#9CA3AF"
            fontWeight="bold"
            style={{ animation: "vibe-zzz 2.4s ease-in-out infinite 0.6s" }}
          >
            Z
          </text>
          <text
            x="0"
            y="23"
            fontSize="10"
            fill="#9CA3AF"
            fontWeight="bold"
            style={{ animation: "vibe-zzz2 2.4s ease-in-out infinite 1.2s" }}
          >
            Z
          </text>
        </>
      )}

      {/* CRITICAL: flames at feet */}
      {mood === "critical" && (
        <g>
          <path d="M38 88 Q41 82 44 88 Q41 84 38 88Z" fill="#EF4444" opacity="0.9" />
          <path d="M40 88 Q43 80 46 88 Q43 83 40 88Z" fill="#F97316" opacity="0.8" />
          <path d="M55 88 Q58 82 61 88 Q58 84 55 88Z" fill="#EF4444" opacity="0.9" />
          <path d="M57 88 Q60 79 63 88 Q60 83 57 88Z" fill="#F97316" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}
