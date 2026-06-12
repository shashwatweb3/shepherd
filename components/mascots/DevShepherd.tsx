interface DevShepherdProps {
  size?: number;
  className?: string;
}

export default function DevShepherd({ size = 120, className }: DevShepherdProps) {
  const scale = size / 140;
  return (
    <svg
      width={size}
      height={Math.round(140 * scale)}
      viewBox="0 0 80 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Dev Shepherd"
    >
      <style>{`
        @keyframes shepherd-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.02); }
        }
        @keyframes shepherd-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>

      {/* Shepherd crook — behind body */}
      {/* Staff */}
      <line x1="68" y1="50" x2="72" y2="128" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
      {/* Crook curve */}
      <path d="M68 50 Q62 32 72 28 Q80 26 80 34 Q80 42 72 42" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Terminal cursor at crook tip */}
      <text
        x="63"
        y="47"
        fontSize="8"
        fill="#16A34A"
        fontFamily="monospace"
        fontWeight="bold"
        style={{ animation: "shepherd-cursor-blink 1s step-end infinite" }}
      >
        ▌
      </text>

      {/* Body — hoodie */}
      <g style={{ transformOrigin: "38px 95px", animation: "shepherd-breathe 3.5s ease-in-out infinite" }}>
        {/* Hoodie body */}
        <rect x="18" y="65" width="40" height="55" rx="8" fill="#1C1C1C" />

        {/* Kangaroo pocket */}
        <rect x="26" y="95" width="24" height="18" rx="5" fill="#2A2A2A" />

        {/* Hoodie drawstrings */}
        <line x1="34" y1="67" x2="30" y2="80" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="42" y1="67" x2="46" y2="80" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="30" cy="81" r="2" fill="#444" />
        <circle cx="46" cy="81" r="2" fill="#444" />

        {/* Hoodie hood outline */}
        <path d="M18 73 Q12 60 22 52 Q38 45 54 52 Q62 60 58 73" stroke="#2A2A2A" strokeWidth="3" fill="none" />

        {/* Sleeves */}
        <rect x="8" y="68" width="14" height="30" rx="6" fill="#1C1C1C" />
        <rect x="54" y="68" width="14" height="30" rx="6" fill="#1C1C1C" />

        {/* Hands */}
        <ellipse cx="15" cy="99" rx="6" ry="5" fill="#F0D9B8" />
        <ellipse cx="61" cy="99" rx="6" ry="5" fill="#F0D9B8" />
      </g>

      {/* Legs */}
      <rect x="24" y="116" width="13" height="20" rx="5" fill="#2D2D2D" />
      <rect x="39" y="116" width="13" height="20" rx="5" fill="#2D2D2D" />

      {/* Shoes */}
      <ellipse cx="30" cy="136" rx="9" ry="5" fill="#111" />
      <ellipse cx="45" cy="136" rx="9" ry="5" fill="#111" />

      {/* Head */}
      <ellipse cx="38" cy="46" rx="18" ry="19" fill="#F0D9B8" />

      {/* Hair */}
      <path d="M20 40 Q22 28 38 26 Q54 28 56 40" fill="#2D2D2D" />
      <path d="M20 40 Q18 35 22 32" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M56 40 Q58 35 54 32" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Glasses */}
      <rect x="21" y="41" width="13" height="10" rx="4" stroke="#4B5563" strokeWidth="1.8" fill="white" fillOpacity="0.3" />
      <rect x="42" y="41" width="13" height="10" rx="4" stroke="#4B5563" strokeWidth="1.8" fill="white" fillOpacity="0.3" />
      <line x1="34" y1="46" x2="42" y2="46" stroke="#4B5563" strokeWidth="1.8" />
      <line x1="19" y1="44" x2="14" y2="43" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="57" y1="44" x2="62" y2="43" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" />

      {/* Eyes behind glasses */}
      <ellipse cx="27" cy="46" rx="3" ry="3.5" fill="#2D2D2D" />
      <ellipse cx="48" cy="46" rx="3" ry="3.5" fill="#2D2D2D" />
      <circle cx="28.5" cy="44.5" r="1" fill="white" />
      <circle cx="49.5" cy="44.5" r="1" fill="white" />

      {/* Nose */}
      <ellipse cx="38" cy="53" rx="2.5" ry="1.8" fill="#DDB898" />

      {/* Mouth — slight smile */}
      <path d="M33 57 Q38 61 43 57" stroke="#A07850" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Ear */}
      <ellipse cx="20" cy="47" rx="4" ry="5" fill="#F0D9B8" />
      <ellipse cx="56" cy="47" rx="4" ry="5" fill="#F0D9B8" />
    </svg>
  );
}
