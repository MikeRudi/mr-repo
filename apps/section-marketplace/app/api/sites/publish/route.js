import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db.js";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { pages, tokens, styleGuideId } = body ?? {};

    if (!Array.isArray(pages)) {
      return NextResponse.json(
        { success: false, error: "Missing pages" },
        { status: 400 }
      );
    }

    const siteId = generateId();
    const data = { pages, tokens: tokens ?? {}, styleGuideId: styleGuideId ?? null };

    await sql`
      INSERT INTO sites (id, data)
      VALUES (${siteId}, ${JSON.stringify(data)}::jsonb)
    `;

    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("host") ?? "localhost:3000";
    const url = `${proto}://${host}/site/${siteId}`;

    return NextResponse.json({ success: true, siteId, url });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Failed to publish site" },
      { status: 500 }
    );
  }
}
