import { sql } from "../../../../lib/db.js";

export const runtime = "edge";

// GET /api/styleguides/[id]
export async function GET(_req, { params }) {
  const { id } = await params;
  if (!id) return Response.json({ ok: false, error: "id is required" }, { status: 400 });

  const rows = await sql`
    SELECT id, name, tokens, created_at, updated_at
    FROM style_guides
    WHERE id = ${id}
    LIMIT 1
  `;
  if (rows.length === 0) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true, styleGuide: rows[0] });
}

// PUT /api/styleguides/[id]
// Body: { name?: string, tokens?: object }
export async function PUT(req, { params }) {
  const { id } = await params;
  if (!id) return Response.json({ ok: false, error: "id is required" }, { status: 400 });

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : null;
  const tokens = body?.tokens && typeof body.tokens === "object" ? body.tokens : null;

  if (!name && !tokens) {
    return Response.json({ ok: false, error: "Provide `name` and/or `tokens`" }, { status: 400 });
  }

  const rows = await sql`
    UPDATE style_guides
    SET
      name       = COALESCE(${name}, name),
      tokens     = COALESCE(${tokens ? JSON.stringify(tokens) : null}::jsonb, tokens),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, tokens, created_at, updated_at
  `;
  if (rows.length === 0) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true, styleGuide: rows[0] });
}

// DELETE /api/styleguides/[id]
export async function DELETE(_req, { params }) {
  const { id } = await params;
  if (!id) return Response.json({ ok: false, error: "id is required" }, { status: 400 });

  const rows = await sql`DELETE FROM style_guides WHERE id = ${id} RETURNING id`;
  if (rows.length === 0) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true, id: rows[0].id });
}
