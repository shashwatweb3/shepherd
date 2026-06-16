import { NextRequest, NextResponse } from "next/server";
import { scanRepo } from "@/lib/scanner";

// In-memory rate limiter (resets on cold start — good enough for serverless)
// For persistent rate limiting swap with @upstash/ratelimit
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

/** Validate that the input is a real github.com repo URL — prevents SSRF via crafted hostnames */
function parseGitHubUrl(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  // Exact hostname match — prevents bypass via github.com.evil.com or evil.com/github.com
  if (parsed.hostname !== "github.com") {
    return { ok: false, error: "Only GitHub repositories are supported right now. Paste a github.com URL." };
  }

  // Must have at least /owner/repo path segments
  const parts = parsed.pathname.replace(/^\/|\/$/g, "").split("/");
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    return { ok: false, error: "Paste the full repo URL, e.g. https://github.com/owner/repo" };
  }

  return { ok: true, url: raw.trim() };
}

export async function POST(req: NextRequest) {
  // Reject oversized bodies early (a repo URL should never exceed 2 KB)
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > 2048) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  // Get client IP — use the first non-private entry from x-forwarded-for
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0].trim() ||
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { repoUrl } = (body ?? {}) as { repoUrl?: unknown };

  if (!repoUrl || typeof repoUrl !== "string") {
    return NextResponse.json({ error: "repoUrl is required and must be a string." }, { status: 400 });
  }

  const validation = parseGitHubUrl(repoUrl);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await scanRepo(validation.url);
    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Limit": String(RATE_LIMIT),
        "X-RateLimit-Remaining": String(rateCheck.remaining),
        "X-RateLimit-Reset": String(rateCheck.resetAt),
      },
    });
  } catch (err) {
    // Known user-facing errors (bad repo, private, rate-limited by GitHub) → 400
    // Unexpected internal errors → 500
    const message = err instanceof Error ? err.message : "Something went wrong. The sheep are confused.";
    const isUserError = /Could not find|private|GitHub returned|does not look like/i.test(message);
    return NextResponse.json({ error: message }, { status: isUserError ? 400 : 500 });
  }
}
