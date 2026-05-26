import { sql } from "./db.js";

export async function listSectionSubmissions({ limit = 20 } = {}) {
  if (!process.env.DATABASE_URL) return [];

  try {
    return await sql`
      SELECT id, section_id, name, status, created_at, updated_at
      FROM section_submissions
      WHERE status <> 'deleted'
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  } catch (error) {
    console.warn("[section-submissions] list failed", error);
    return [];
  }
}

export async function listActiveSubmittedSections({ limit = 50 } = {}) {
  if (!process.env.DATABASE_URL) return [];

  try {
    const rows = await sql`
      SELECT id, section_id, name, status, created_at, updated_at, package
      FROM section_submissions
      WHERE status = 'active'
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `;
    return rows.map(submissionToSection).filter(Boolean);
  } catch (error) {
    console.warn("[section-submissions] list active failed", error);
    return [];
  }
}

export async function getActiveSubmittedSectionById(sectionId) {
  if (!process.env.DATABASE_URL) return null;

  try {
    const [row] = await sql`
      SELECT id, section_id, name, status, created_at, updated_at, package
      FROM section_submissions
      WHERE status = 'active'
        AND section_id = ${sectionId}
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    return submissionToSection(row);
  } catch (error) {
    console.warn("[section-submissions] get active failed", error);
    return null;
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

export async function deactivateSectionSubmission(id) {
  const [row] = await sql`
    UPDATE section_submissions
    SET status = 'pending',
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, section_id, name, status, created_at, updated_at
  `;
  return row ?? null;
}

export async function deleteSectionSubmission(id) {
  const [row] = await sql`
    UPDATE section_submissions
    SET status = 'deleted',
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, section_id, name, status, created_at, updated_at
  `;
  return row ?? null;
}

function submissionToSection(row) {
  if (!row?.package?.files?.["section/section.json"]) return null;

  try {
    const manifest = JSON.parse(row.package.files["section/section.json"]);
    return {
      ...manifest,
      id: manifest.id ?? row.section_id,
      name: manifest.name ?? row.name,
      category: manifest.category ?? "submitted",
      version: manifest.version ?? "0.1.0",
      track: manifest.track ?? "experimental",
      lifecycle: manifest.lifecycle ?? "Submitted",
      description: manifest.description ?? manifest.summary ?? "Activated section submitted through Build Mode.",
      dependencies: manifest.dependencies ?? [],
      tags: [...new Set([...(manifest.tags ?? []), "submitted"])],
      kind: "section",
      source: "submission",
      submissionId: row.id,
      submittedBy: manifest.submittedBy ?? "library upload",
      created: manifest.created ?? row.created_at,
      updated: manifest.updated ?? row.updated_at,
    };
  } catch {
    return null;
  }
}
