# Database (Neon Postgres)

The MakeReign app uses Neon as its serverless Postgres. We run **strictly
in the cloud** — no local install required.

## Provisioning (one-time, in the Vercel dashboard)

1. Open the `react-mr-frontend` project on Vercel
2. **Storage** tab → **Create Database** → **Neon (Serverless Postgres)**
3. Region: **US East (iad1)** to match the project's deploy region
4. **Connect Project** — keep all environments selected (Production, Preview, Development)

That injects `DATABASE_URL` (and `DATABASE_URL_UNPOOLED`) into the project's env
vars in every environment automatically.

## Migrations

Forward-only `.sql` files live in `db/migrations/`. They run as part of the
Vercel build (`build` script in `apps/section-marketplace/package.json`):

```
"build": "node db/migrate.mjs && next build"
```

So **every push that contains a new `db/migrations/000N_*.sql` file applies
that migration on the next deploy.** Idempotent: applied filenames are tracked
in a `_migrations` table.

If `DATABASE_URL` is not yet set, the migrate step skips with a warning so the
build continues — useful before Neon has been provisioned.

## Adding a migration

1. Create `db/migrations/0002_<short-name>.sql`
2. Push to a feature branch
3. Vercel preview deploy applies it against the same Neon DB — verify on the
   preview URL
4. Merge to `main` for the production deploy

## Schema (Phase A)

```
style_guides
  id          uuid         pk default gen_random_uuid()
  name        text         not null
  tokens      jsonb        not null default '{}'::jsonb
  created_at  timestamptz  not null default now()
  updated_at  timestamptz  not null default now()
```

Phase B will add `projects`, `pages`, `section_instances`, plus a `users`
table once we wire auth.
