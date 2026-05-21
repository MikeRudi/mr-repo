#!/usr/bin/env node
// Minimal forward-only migration runner against Neon.
//
// - Reads .sql files from db/migrations in lexicographic order.
// - Tracks applied filenames in a `_migrations` table.
// - Each .sql file may contain multiple statements separated by `;`.
//
// Usage:
//   DATABASE_URL=postgres://... node db/migrate.mjs

import { Pool } from "@neondatabase/serverless";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

if (!process.env.DATABASE_URL) {
  console.warn(
    "[migrate] DATABASE_URL is not set — skipping migrations. " +
      "Provision Neon in the Vercel project's Storage tab to enable."
  );
  process.exit(0);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      run_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getApplied(client) {
  const { rows } = await client.query("SELECT filename FROM _migrations");
  return new Set(rows.map((r) => r.filename));
}

async function main() {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const applied = await getApplied(client);

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const fullPath = path.join(MIGRATIONS_DIR, file);
      const sql = await readFile(fullPath, "utf8");
      console.log(`→ ${file}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO _migrations (filename) VALUES ($1)", [file]);
        await client.query("COMMIT");
        ran += 1;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
    console.log(`Done. ${ran} migration(s) applied, ${applied.size + ran} total tracked.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
