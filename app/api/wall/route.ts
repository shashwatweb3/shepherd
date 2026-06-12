import { NextRequest, NextResponse } from "next/server";
import { getTier, TIER_LABELS, type IssueCategory } from "@/lib/scanner";

// In-memory wall store — degrades gracefully (resets on cold start)
// To persist: replace with Vercel KV or edge config
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

export async function GET() {
  // Return most recent 20, newest first
  const entries = [...wallStore].reverse().slice(0, 20);
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      score?: number;
      topCategory?: IssueCategory | "none";
      issueCount?: number;
    };

    const { score, topCategory, issueCount } = body;

    if (typeof score !== "number" || score < 0 || score > 100) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    const tier = getTier(score);
    const entry: WallEntry = {
      id: Math.random().toString(36).slice(2, 10),
      score,
      tier,
      tierLabel: TIER_LABELS[tier],
      topCategory: topCategory ?? "none",
      issueCount: issueCount ?? 0,
      addedAt: new Date().toISOString(),
    };

    wallStore.push(entry);
    // Keep store bounded
    if (wallStore.length > MAX_WALL_ENTRIES) {
      wallStore.shift();
    }

    return NextResponse.json({ success: true, entry });
  } catch {
    return NextResponse.json({ error: "Failed to add entry" }, { status: 500 });
  }
}
