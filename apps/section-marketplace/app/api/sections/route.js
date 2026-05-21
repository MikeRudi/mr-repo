import {
  filterSections,
  getAllSections,
  listCategories,
  listLifecycles,
  listTracks,
} from "../../../lib/sections.js";

export const runtime = "edge";

// GET /api/sections
//   ?category=hero&track=stable&lifecycle=Approved&q=split
// Response shape mirrors @mr/section-marketplace's public API:
//   { ok, generated, count, sections, facets }
export async function GET(req) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") ?? undefined;
  const track = url.searchParams.get("track") ?? undefined;
  const lifecycle = url.searchParams.get("lifecycle") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;

  const sections = filterSections({ category, track, lifecycle, q });

  return Response.json({
    ok: true,
    generated: new Date().toISOString(),
    count: sections.length,
    sections,
    facets: {
      categories: listCategories(),
      tracks: listTracks(),
      lifecycles: listLifecycles(),
      total: getAllSections().length,
    },
  });
}
