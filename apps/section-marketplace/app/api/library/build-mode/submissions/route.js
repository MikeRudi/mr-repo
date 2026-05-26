import { createSectionSubmission, listSectionSubmissions } from "../../../../../lib/section-submissions.js";
import {
  buildPackageFromFolderFiles,
  validateSectionPackage,
} from "../../../../../lib/section-package.js";
import { extractStoredZip, isZipBuffer } from "../../../../../lib/zip.js";

export const runtime = "nodejs";

const MAX_PACKAGE_BYTES = 5_000_000;

export async function GET() {
  const submissions = await listSectionSubmissions();
  return Response.json({ ok: true, submissions });
}

export async function POST(req) {
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { ok: false, error: "Section submissions need DATABASE_URL to be configured." },
      { status: 503 }
    );
  }

  let bytes;
  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("package");
      if (!file || typeof file === "string") {
        return Response.json({ ok: false, error: "`package` file is required." }, { status: 400 });
      }
      bytes = Buffer.from(await file.arrayBuffer());
    } else {
      bytes = Buffer.from(await req.arrayBuffer());
    }
  } catch {
    return Response.json({ ok: false, error: "Could not read upload." }, { status: 400 });
  }

  if (!bytes?.length || bytes.length > MAX_PACKAGE_BYTES) {
    return Response.json(
      { ok: false, error: "Package must be a JSON or ZIP file smaller than 5MB." },
      { status: 400 }
    );
  }

  let packageData;
  try {
    if (isZipBuffer(bytes)) {
      packageData = buildPackageFromFolderFiles(extractStoredZip(bytes));
    } else {
      packageData = JSON.parse(bytes.toString("utf8"));
    }
  } catch {
    return Response.json(
      { ok: false, error: "Uploaded package must be a valid MakeReign JSON or ZIP package." },
      { status: 400 }
    );
  }

  const validation = validateSectionPackage(packageData);
  if (!validation.ok) {
    return Response.json({ ok: false, error: validation.error }, { status: 400 });
  }

  try {
    const submission = await createSectionSubmission({
      sectionId: validation.sectionId,
      name: validation.name,
      packageData,
    });
    return Response.json({ ok: true, submission }, { status: 201 });
  } catch (error) {
    console.error("[section-submissions] create failed", error);
    return Response.json({ ok: false, error: "Could not save submission." }, { status: 500 });
  }
}
