import { NextRequest, NextResponse } from "next/server";
import { getTier, TIER_LABELS, type IssueCategory } from "@/lib/scanner";

// In-memory wall store — resets on cold start
interface WallEntry {
  id: string;
  score: number;
  tier: string;
  tierLabel: string;
  topCategory: IssueCategory | "none";
  issueCount: number;
  addedAt: string;
}

const wallStore: WallEntry[] = [];
const MAX_WALL_ENTRIES = 50;

// Simple rate limiter — 10 wall submissions per IP per hour
const wallRateLimit = new Map<string, { count: number; resetAt: number }>();
const WALL_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

function checkWallLimit(ip: string): boolean {
  const now = Date.now();
  const entry = wallRateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    wallRateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= WALL_LIMIT) return false;
  entry.count++;
  return true;
}

const ALLOWED_CATEGORIES: Set<string> = new Set([
  "secrets", "dependencies", "auth", "security",
  "supabase", "repo-health", "code-quality", "none",
]);

export async function GET() {
  const entries = [...wallStore].reverse().slice(0, 20);
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkWallLimit(ip)) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
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

  const { score, topCategory, issueCount } = (body ?? {}) as {
    score?: unknown;
    topCategory?: unknown;
    issueCount?: unknown;
  };

  // score: must be an integer 0–100
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100) {
    return NextResponse.json({ error: "score must be an integer between 0 and 100." }, { status: 400 });
  }

  // topCategory: must be one of the known values
  const cat = typeof topCategory === "string" ? topCategory : "none";
  if (!ALLOWED_CATEGORIES.has(cat)) {
    return NextResponse.json({ error: "Invalid topCategory." }, { status: 400 });
  }

  // issueCount: must be a non-negative integer, cap at 999 to avoid abuse
  const count = typeof issueCount === "number" && Number.isInteger(issueCount) ? issueCount : 0;
  const safeCount = Math.max(0, Math.min(count, 999));

  const tier = getTier(score);
  const entry: WallEntry = {
    id: crypto.randomUUID(),
    score,
    tier,
    tierLabel: TIER_LABELS[tier],
    topCategory: cat as IssueCategory | "none",
    issueCount: safeCount,
    addedAt: new Date().toISOString(),
  };

  wallStore.push(entry);
  if (wallStore.length > MAX_WALL_ENTRIES) wallStore.shift();

  // Return only a success flag — don't echo back the full entry
  return NextResponse.json({ success: true });
}
