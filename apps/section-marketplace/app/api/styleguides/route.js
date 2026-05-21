import { sql } from "../../../lib/db.js";

export const runtime = "edge";

// GET /api/styleguides — list all style guides (id, name, updated_at)
export async function GET() {
  const rows = await sql`
    SELECT id, name, updated_at
    FROM style_guides
    ORDER BY updated_at DESC
    LIMIT 100
  `;
  return Response.json({ ok: true, count: rows.length, styleGuides: rows });
}

// POST /api/styleguides — create a new style guide
// Body: { name: string, tokens: object }
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const tokens = body?.tokens && typeof body.tokens === "object" ? body.tokens : null;

  if (!name) {
    return Response.json({ ok: false, error: "`name` is required" }, { status: 400 });
  }
  if (!tokens) {
    return Response.json({ ok: false, error: "`tokens` object is required" }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO style_guides (name, tokens)
    VALUES (${name}, ${JSON.stringify(tokens)}::jsonb)
    RETURNING id, name, tokens, created_at, updated_at
  `;
  return Response.json({ ok: true, styleGuide: row }, { status: 201 });
}
