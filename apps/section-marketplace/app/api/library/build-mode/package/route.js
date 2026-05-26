import {
  buildSectionPackageFolderFiles,
  buildSectionTemplatePackage,
} from "../../../../../lib/section-package.js";
import { createZip } from "../../../../../lib/zip.js";

export const runtime = "nodejs";

export async function GET() {
  const packageData = await buildSectionTemplatePackage();
  const body = createZip(buildSectionPackageFolderFiles(packageData));

  return new Response(body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="make-reign-section-builder.zip"',
      "Cache-Control": "no-store",
    },
  });
}
