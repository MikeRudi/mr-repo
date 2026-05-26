import { createSectionSubmission, listSectionSubmissions } from "../../../../../lib/section-submissions.js";
import { validateSectionPackage } from "../../../../../lib/section-package.js";

export const runtime = "edge";

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

  let text = "";
  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("package");
      if (!file || typeof file === "string") {
        return Response.json({ ok: false, error: "`package` file is required." }, { status: 400 });
      }
      text = await file.text();
    } else {
      text = await req.text();
    }
  } catch {
    return Response.json({ ok: false, error: "Could not read upload." }, { status: 400 });
  }

  if (!text || text.length > 2_000_000) {
    return Response.json(
      { ok: false, error: "Package must be a JSON file smaller than 2MB." },
      { status: 400 }
    );
  }

  let packageData;
  try {
    packageData = JSON.parse(text);
  } catch {
    return Response.json({ ok: false, error: "Uploaded package must be valid JSON." }, { status: 400 });
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
