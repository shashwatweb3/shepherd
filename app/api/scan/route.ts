import { NextRequest, NextResponse } from "next/server";
import { scanRepo } from "@/lib/scanner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoUrl } = body as { repoUrl?: string };

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });
    }

    const trimmed = repoUrl.trim();
    if (!trimmed.includes("github.com")) {
      return NextResponse.json(
        { error: "Only GitHub repositories are supported at this time." },
        { status: 400 }
      );
    }

    const result = await scanRepo(trimmed);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
