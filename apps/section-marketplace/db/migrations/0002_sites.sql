-- 0002_sites.sql
-- Published sites from the builder.

CREATE TABLE IF NOT EXISTS sites (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sites_created_at_idx
  ON sites (created_at DESC);
