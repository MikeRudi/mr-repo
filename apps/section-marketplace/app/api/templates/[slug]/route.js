import { getTemplateBySlug } from "../../../../lib/templates.js";

export const runtime = "edge";

export async function GET(_req, { params }) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true, template });
}
