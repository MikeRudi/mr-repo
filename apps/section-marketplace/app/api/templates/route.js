import { getAllTemplates } from "../../../lib/templates.js";

export const runtime = "edge";

export async function GET() {
  const templates = getAllTemplates();
  return Response.json({
    ok: true,
    generated: new Date().toISOString(),
    count: templates.length,
    templates,
  });
}
