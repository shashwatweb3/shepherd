import { NextRequest, NextResponse } from "next/server";
import { scanRepo } from "@/lib/scanner";

// In-memory rate limiter (resets on cold start — good enough for edge/serverless)
// For persistent rate limiting, swap with @upstash/ratelimit
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetAt: entry.resetAt };
}

export async function POST(req: NextRequest) {
  // Get client IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    const minutesLeft = Math.ceil((rateCheck.resetAt - Date.now()) / 60000);
    return NextResponse.json(
      {
        error: `Whoa there, shepherd. Even sheep need a break. You've hit the limit of ${RATE_LIMIT} scans/hour. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}. 🐑`,
        rateLimited: true,
        resetAt: rateCheck.resetAt,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateCheck.resetAt),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { repoUrl } = body as { repoUrl?: string };

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });
    }

    const trimmed = repoUrl.trim();
    if (!trimmed.includes("github.com")) {
      return NextResponse.json(
        { error: "Only GitHub repositories are supported right now. Paste a github.com URL." },
        { status: 400 }
      );
    }

    const result = await scanRepo(trimmed);
    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Limit": String(RATE_LIMIT),
        "X-RateLimit-Remaining": String(rateCheck.remaining),
        "X-RateLimit-Reset": String(rateCheck.resetAt),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong. The sheep are confused.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
