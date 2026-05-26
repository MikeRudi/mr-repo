import { deleteSectionSubmission } from "../../../../../../../lib/section-submissions.js";

export const runtime = "nodejs";

export async function POST(_req, { params }) {
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { ok: false, error: "Section submissions need DATABASE_URL to be configured." },
      { status: 503 }
    );
  }

  const { id } = await params;
  if (!id) {
    return Response.json({ ok: false, error: "Submission id is required." }, { status: 400 });
  }

  try {
    const submission = await deleteSectionSubmission(id);
    if (!submission) {
      return Response.json({ ok: false, error: "Submission not found." }, { status: 404 });
    }
    return Response.json({ ok: true, submission });
  } catch (error) {
    console.error("[section-submissions] delete failed", error);
    return Response.json({ ok: false, error: "Could not delete submission." }, { status: 500 });
  }
}
