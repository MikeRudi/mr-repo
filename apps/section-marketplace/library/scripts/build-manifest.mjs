#!/usr/bin/env node
// Walks library/sections and library/templates and writes a flat
// library/index.json so the marketplace UI and external consumers
// can list everything in the library without filesystem access.
//
// Usage:
//   node library/scripts/build-manifest.mjs
//   npm run library:manifest

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LIBRARY_ROOT = path.resolve(__dirname, "..");

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

async function walkSections() {
  const sectionsRoot = path.join(LIBRARY_ROOT, "sections");
  const out = [];
  let categories;
  try {
    categories = await fs.readdir(sectionsRoot, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const catEntry of categories) {
    if (!catEntry.isDirectory()) continue;
    const catPath = path.join(sectionsRoot, catEntry.name);
    const sectionEntries = await fs.readdir(catPath, { withFileTypes: true });
    for (const sec of sectionEntries) {
      if (!sec.isDirectory()) continue;
      const manifestPath = path.join(catPath, sec.name, "section.json");
      const manifest = await readJson(manifestPath);
      if (!manifest) continue;
      out.push({
        ...manifest,
        kind: "section",
        category: manifest.category ?? catEntry.name,
        path: path.relative(LIBRARY_ROOT, path.join(catPath, sec.name)),
      });
    }
  }
  return out;
}

async function walkTemplates() {
  const templatesRoot = path.join(LIBRARY_ROOT, "templates");
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(templatesRoot, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(templatesRoot, entry.name, "template.json");
    const manifest = await readJson(manifestPath);
    if (!manifest) continue;
    out.push({
      ...manifest,
      kind: "template",
      path: path.relative(LIBRARY_ROOT, path.join(templatesRoot, entry.name)),
    });
  }
  return out;
}

async function main() {
  const [sections, templates] = await Promise.all([walkSections(), walkTemplates()]);
  const manifest = {
    generatedAt: new Date().toISOString(),
    counts: {
      sections: sections.length,
      templates: templates.length,
    },
    sections,
    templates,
  };
  const outPath = path.join(LIBRARY_ROOT, "index.json");
  await fs.writeFile(outPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(
    `Wrote ${outPath} (${sections.length} sections, ${templates.length} templates)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
