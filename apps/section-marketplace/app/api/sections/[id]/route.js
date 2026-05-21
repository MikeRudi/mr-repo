import { getSectionById } from "../../../../lib/sections.js";

export const runtime = "edge";

export async function GET(_req, { params }) {
  const { id } = await params;
  const section = getSectionById(id);
  if (!section) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true, section });
}
