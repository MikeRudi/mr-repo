import { buildSectionTemplatePackage } from "../../../../../lib/section-package.js";

export const runtime = "nodejs";

export async function GET() {
  const packageData = await buildSectionTemplatePackage();
  const body = JSON.stringify(packageData, null, 2);

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="make-reign-section-package.json"',
      "Cache-Control": "no-store",
    },
  });
}
