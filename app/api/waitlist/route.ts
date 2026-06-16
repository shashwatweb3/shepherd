import { NextRequest, NextResponse } from "next/server";

// Rate limit: 3 signups per IP per hour (bots love waitlist forms)
const waitlistRateLimit = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

function checkLimit(ip: string): boolean {
  const now = Date.now();
  const entry = waitlistRateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    waitlistRateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

// RFC 5322-ish: must have local@domain.tld with no whitespace
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  // Reject oversized bodies
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > 512) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { email } = (body ?? {}) as { email?: unknown };

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  // Log a signup event without echoing the raw email to stdout
  // In production replace this with your storage of choice (KV, Resend, Supabase, etc.)
  console.log(`[Shepherd Waitlist] New signup at ${new Date().toISOString()}`);

  return NextResponse.json({ success: true });
}
