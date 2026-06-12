import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body as { email?: string };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Log to console (in production, replace with KV store, Resend, or Supabase insert)
    console.log(`[Shepherd Waitlist] New signup: ${email} at ${new Date().toISOString()}`);

    // --- STUB: Replace with persistent storage. Examples:
    //
    // Vercel KV:
    // import { kv } from "@vercel/kv";
    // await kv.lpush("waitlist", email);
    //
    // Supabase:
    // import { createClient } from "@supabase/supabase-js";
    // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
    // await supabase.from("waitlist").insert({ email });
    // --- END STUB

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save email" }, { status: 500 });
  }
}
