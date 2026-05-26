import { sql } from "./db.js";

export async function listSectionSubmissions({ limit = 20 } = {}) {
  if (!process.env.DATABASE_URL) return [];

  try {
    return await sql`
      SELECT id, section_id, name, status, created_at, updated_at
      FROM section_submissions
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  } catch (error) {
    console.warn("[section-submissions] list failed", error);
    return [];
  }
}

export async function createSectionSubmission({ sectionId, name, packageData }) {
  const [row] = await sql`
    INSERT INTO section_submissions (section_id, name, package)
    VALUES (${sectionId}, ${name}, ${JSON.stringify(packageData)}::jsonb)
    RETURNING id, section_id, name, status, created_at, updated_at
  `;
  return row;
}

export async function activateSectionSubmission(id) {
  const [row] = await sql`
    UPDATE section_submissions
    SET status = 'active',
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, section_id, name, status, created_at, updated_at
  `;
  return row ?? null;
}
