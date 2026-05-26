-- 0003_section_submissions.sql
-- Uploaded Build Mode section packages waiting for manual review.

CREATE TABLE IF NOT EXISTS section_submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  TEXT NOT NULL,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'submitted',
  package     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS section_submissions_status_created_at_idx
  ON section_submissions (status, created_at DESC);

CREATE INDEX IF NOT EXISTS section_submissions_section_id_idx
  ON section_submissions (section_id);
