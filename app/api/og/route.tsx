import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getTier, TIERS } from "@/lib/tiers";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = Math.min(100, Math.max(0, parseInt(searchParams.get("score") ?? "50", 10)));
  const repo = (searchParams.get("repo") ?? "your-app").slice(0, 44);
  const tier = getTier(score);
  const color = TIERS[tier].color;
  const tierLabel = TIERS[tier].label;
  const roastLine = TIERS[tier].roast;

  // sheep face that matches the tier mood
  const sheepEyes = score < 30 ? "x x" : score >= 90 ? "^ ^" : "o o";
  const crown = score >= 90;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0E1512",
          fontFamily: "monospace",
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {/* dotted ground line */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "120px", height: "2px", background: "#22302A", display: "flex" }} />

        {/* top bar: terminal prompt */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ width: "14px", height: "14px", borderRadius: "7px", background: "#FF5F57", display: "flex" }} />
              <div style={{ width: "14px", height: "14px", borderRadius: "7px", background: "#FEBC2E", display: "flex" }} />
              <div style={{ width: "14px", height: "14px", borderRadius: "7px", background: "#28C840", display: "flex" }} />
            </div>
            <span style={{ fontSize: "22px", color: "#5E7268" }}>shepherd scan</span>
          </div>
          <span style={{ fontSize: "20px", color: "#5E7268" }}>shepherd-ivory.vercel.app</span>
        </div>

        <div style={{ display: "flex", fontSize: "24px", color: "#4ADE80", marginBottom: "36px" }}>
          $ shepherd scan {repo}
        </div>

        {/* main row */}
        <div style={{ display: "flex", flex: 1, gap: "56px", alignItems: "center" }}>
          {/* score ring */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "280px",
              height: "280px",
              borderRadius: "140px",
              background: "#16201B",
              border: `10px solid ${color}`,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", fontSize: "104px", fontWeight: 800, color: "#FAF8F2", lineHeight: 1 }}>{score}</div>
            <div style={{ display: "flex", fontSize: "26px", color: "#5E7268" }}>/ 100</div>
          </div>

          {/* right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* tiny sheep */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {crown && <div style={{ display: "flex", fontSize: "22px", color: "#EAB308" }}>♕</div>}
                <div style={{ display: "flex", fontSize: "30px", color: "#FAF8F2" }}>({sheepEyes})</div>
              </div>
              <div
                style={{
                  display: "flex",
                  background: color,
                  borderRadius: "12px",
                  padding: "8px 20px",
                }}
              >
                <span style={{ fontSize: "26px", fontWeight: 800, color: "#0E1512" }}>{tierLabel}</span>
              </div>
            </div>

            <div style={{ display: "flex", fontSize: "52px", fontWeight: 800, color: "#FAF8F2", lineHeight: 1.05, letterSpacing: "-1px", fontFamily: "sans-serif" }}>
              Survival Score
            </div>

            <div style={{ display: "flex", fontSize: "26px", color: "#A8BBB0", marginTop: "6px", fontStyle: "italic", fontFamily: "sans-serif" }}>
              &ldquo;{roastLine}&rdquo;
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "20px", color: "#A8BBB0", fontFamily: "sans-serif" }}>
            You vibe-coded it. Shepherd keeps it alive.
          </span>
          <span style={{ fontSize: "20px", color: "#16A34A" }}>
            scan yours free, no login
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
