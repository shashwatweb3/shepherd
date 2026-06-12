import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = parseInt(searchParams.get("score") ?? "0", 10);
  const repo = searchParams.get("repo") ?? "your-app";

  const color =
    score >= 70 ? "#16A34A" : score >= 40 ? "#D97706" : "#DC2626";
  const label =
    score >= 70 ? "Healthy" : score >= 40 ? "At Risk" : "Critical";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#FAFAF7",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <span style={{ fontSize: "36px" }}>🐑</span>
          <span style={{ fontSize: "28px", fontWeight: "700", color: "#111" }}>Shepherd</span>
        </div>

        {/* Score */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            border: "2px solid #E5E5E0",
            borderRadius: "24px",
            padding: "48px 80px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              fontSize: "100px",
              fontWeight: "800",
              color: color,
              lineHeight: 1,
            }}
          >
            {score}
          </div>
          <div style={{ fontSize: "32px", color: "#9CA3AF", marginTop: "4px" }}>/100</div>
          <div
            style={{
              marginTop: "16px",
              fontSize: "24px",
              fontWeight: "600",
              color: color,
            }}
          >
            {label}
          </div>
        </div>

        {/* Repo */}
        <div style={{ fontSize: "20px", color: "#6B7280", fontFamily: "monospace" }}>
          {repo}
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: "32px",
            fontSize: "18px",
            color: "#9CA3AF",
            textAlign: "center",
          }}
        >
          My app&apos;s Survival Score: {score}/100 🐑
        </div>
        <div style={{ fontSize: "14px", color: "#C4C4C0", marginTop: "8px" }}>
          shepherd.dev — You vibe-coded it. Shepherd keeps it alive.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
