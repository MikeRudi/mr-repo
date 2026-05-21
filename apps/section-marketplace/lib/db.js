import { neon } from "@neondatabase/serverless";

// Lazy SQL client.
//
// Why lazy: we want module imports to succeed even when DATABASE_URL is
// not yet set (e.g. on the very first deploy before Neon has been
// provisioned in the Vercel dashboard). Errors only surface when an
// API route actually tries to query the DB.
//
// Usage:

let _client = null;

function getClient() {
  if (_client) return _client;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Provision Neon in the Vercel project's " +
        "Storage tab and redeploy. See apps/section-marketplace/db/README.md."
    );
  }
  _client = neon(url);
  return _client;
}

export const sql = (...args) => getClient()(...args);
