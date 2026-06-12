import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getTier, TIERS } from "@/lib/tiers";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = Math.min(100, Math.max(0, parseInt(searchParams.get("score") ?? "50", 10)));
  const repo = (searchParams.get("repo") ?? "your-app").slice(0, 40);
  const tier = getTier(score);

  const color =
    score >= 70 ? "#16A34A" : score >= 40 ? "#D97706" : "#DC2626";
  const bgAccent =
    score >= 70 ? "#F0FDF4" : score >= 40 ? "#FFFBEB" : "#FEF2F2";
  const borderColor =
    score >= 70 ? "#BBF7D0" : score >= 40 ? "#FDE68A" : "#FECACA";

  const tierLabel = TIERS[tier].label;
  const roastLine = TIERS[tier].roast;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#FAFAF7",
          fontFamily: "sans-serif",
          padding: "64px",
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "40px" }}>🐑</span>
            <span style={{ fontSize: "26px", fontWeight: "700", color: "#111", letterSpacing: "-0.5px" }}>Shepherd</span>
          </div>
          <div style={{ display: "flex", fontSize: "16px", color: "#9CA3AF" }}>
            shepherd-ivory.vercel.app
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flex: 1, gap: "48px", alignItems: "center" }}>
          {/* Score circle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "260px",
              height: "260px",
              borderRadius: "130px",
              background: bgAccent,
              border: `6px solid ${borderColor}`,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", fontSize: "88px", fontWeight: "800", color: color, lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ display: "flex", fontSize: "28px", color: "#9CA3AF", marginTop: "2px" }}>/100</div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
            <div
              style={{
                display: "flex",
                background: bgAccent,
                border: `2px solid ${borderColor}`,
                borderRadius: "12px",
                padding: "10px 20px",
                width: "fit-content",
              }}
            >
              <span style={{ fontSize: "20px", fontWeight: "700", color: color }}>{tierLabel}</span>
            </div>
            <div style={{ display: "flex", fontSize: "36px", fontWeight: "800", color: "#111", lineHeight: 1.2, letterSpacing: "-1px" }}>
              Survival Score
            </div>
            <div style={{ display: "flex", fontSize: "20px", color: "#6B7280", fontFamily: "monospace" }}>
              {repo}
            </div>
            <div style={{ display: "flex", fontSize: "20px", color: "#4B5563", marginTop: "8px", fontStyle: "italic" }}>
              &ldquo;{roastLine}&rdquo;
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px" }}>
          <div style={{ display: "flex", fontSize: "16px", color: "#9CA3AF" }}>
            You vibe-coded it. Shepherd keeps it alive.
          </div>
          <div style={{ display: "flex", fontSize: "16px", color: "#9CA3AF" }}>
            Scan your repo free at shepherd-ivory.vercel.app/scan
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
