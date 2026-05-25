---
trigger: always_on
description: GitHub + Vercel + Neon database deploy workflow for the MakeReign app. Read at the start of every session.
---

# Deploy Rules

This file governs **anything that leaves the local machine** — git, GitHub, Vercel, and the Neon Postgres database. It complements `roadmap.md`. If a change is roadmap-sanctioned and ready to ship, deployment goes through this file.

When the user says **deploy**, **publish**, **ship**, or **push it live**, that means: run the local checks, commit the changes, and push to GitHub so the existing GitHub → Vercel integration deploys. It does **not** mean running a Vercel deployment command.

## The single allowed path

Local edit → local build passes → commit on a feature branch → push → open PR to `main` → review → merge → Vercel auto-deploys `main`.

For solo work right now, the user may collapse this to: local → build → commit → push to `main`. Multi-user mode (PRs required) will be turned on later by switching directive 2 below from "allowed" to "required". Do not change that without explicit instruction.

## Infrastructure facts (do not guess; verify against these)

- **Git remote**: `origin` → `https://github.com/MikeRudi/mr-repo.git`
- **Production branch**: `main`
- **Vercel project**: `react-mr-frontend` in team `mikerudyharris-6891s-projects`
- **Vercel root directory**: `apps/section-marketplace`
- **Production URL**: `https://react-mr-frontend.vercel.app`
- **Database**: Neon Postgres, accessed via `DATABASE_URL` env var on Vercel and locally
- **Migration runner**: `apps/section-marketplace/db/migrate.mjs`, invoked by `npm run build` before `next build`
- **Tables currently in use**: `style_guides`, `sites`, `_migrations`
- **Deploy trigger**: GitHub push to `main` → Vercel auto-builds and deploys

## Prime directives

1. **Never run the Vercel CLI to deploy.** No `vercel`, `vercel deploy`, `vercel --prod`, `vercel build`, `npx vercel --prod --yes`, or `npx vercel --prod --yes --scope ...`. Deployment is exclusively GitHub-driven. The CLI may be used **read-only** for inspection (`vercel ls`, `vercel inspect --logs`) and only when the user explicitly asks.
2. **PRs to `main` are the multi-user mode.** For now, direct push to `main` is allowed for solo work. Do not introduce branch protection assumptions until the user flips this on.
3. **Local build must pass before any push.** Always run `npm --workspace apps/section-marketplace exec next build` for a fast Next.js verification, or `npm --workspace apps/section-marketplace run build` when you intentionally need the full app build including manifest and DB migration runner. If the build fails, do not push.
4. **Never push secrets.** No `DATABASE_URL`, API keys, `.env` contents, or anything from `.env*` files goes into git. If a secret is needed in production, the user sets it in the Vercel dashboard.
5. **Never bypass `to-do.*.md`.** No deploy may include changes outside the current kicked-off roadmap item. If it would, stop and surface it (see `roadmap.md`).
6. **Ignore `.vercel/` as a deploy signal.** A local `.vercel/project.json` may be stale, missing, or accidentally created by a failed CLI attempt. Do not use it to choose a deploy path, create/link a project, or infer that direct CLI deployment is allowed.

## Pre-flight checklist (run mentally before every push)

- [ ] All edits are in scope for the current roadmap item.
- [ ] `to-do.human.md` and `to-do.ai.md` reflect any status/scope changes.
- [ ] `npm --workspace apps/section-marketplace exec next build` passes locally.
- [ ] If `library/sections/` or `library/templates/` changed: `npm run library:manifest` was run and the manifest is committed.
- [ ] If a new migration was added: it is forward-only, idempotent, and lexicographically ordered after the last one in `apps/section-marketplace/db/migrations/`.
- [ ] No `.env*` files are staged.
- [ ] Commit message is concise and references the roadmap item (e.g. `item-1: replace library with starter section`).

## The exact deploy commands

```bash
# From the monorepo root: /Users/mike/Documents/Make Reign/react - mr

# 1. Local build (must pass)
npm --workspace apps/section-marketplace exec next build

# 2. (If you touched library/sections or library/templates)
npm run library:manifest

# 3. Stage, commit, push. This is the deploy trigger.
git add -A
git status               # eyeball what is staged
git commit -m "item-N: <concise description>"
git push origin main
```

After push, Vercel auto-deploys from GitHub. Verify by checking the production URL and, if needed, `npx vercel ls react-mr-frontend` or `npx vercel inspect --logs <deployment-url>` as read-only inspection only.

If no new deployment appears after a push, do **not** run `vercel --prod` as a fallback. Report that the GitHub-triggered deployment is not visible yet, confirm the pushed commit SHA, and ask the user whether they want Vercel dashboard/GitHub integration checked.

## Database (Neon Postgres) rules

- **Schema lives in `apps/section-marketplace/db/migrations/*.sql`.** Forward-only. Tracked in the `_migrations` table.
- **Naming**: `000N_<concise_name>.sql`, zero-padded, strictly increasing.
- **Every migration must be idempotent.** Use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, etc. The runner does not have rollbacks.
- **Never edit an applied migration.** Once a migration has been deployed (i.e. its filename is in `_migrations` on production), it is immutable. Fix mistakes with a new forward migration.
- **Backward compatibility is required.** Production data in `style_guides` and `sites` must keep loading. Defensive reads in `app/site/[siteId]/page.jsx` and `lib/db.js` must handle missing/legacy fields.
- **Never run destructive SQL via the build.** No `DROP TABLE`, `DROP COLUMN`, `TRUNCATE` in a migration without explicit user approval and a documented data-preservation plan.
- **No ad-hoc DB writes from the agent.** If you need to fix data, propose a migration and wait for approval.
- **Local DB**: if `DATABASE_URL` is unset, `db/migrate.mjs` skips with a warning. That is intentional and must not be "fixed" by hard-failing.

## Failure mode: if the deploy breaks

1. Get the Vercel build log: `npx vercel inspect --logs <latest-deployment-url>` (read-only).
2. Identify root cause. Do **not** start chasing symptoms.
3. Fix forward on `main` only if the fix is small, in scope, and safe. Otherwise:
   - Tell the user the cause.
   - Propose either (a) a minimal fix-forward commit, or (b) a revert (`git revert <sha>`).
   - Wait for the user's choice.
4. Never delete commits from history. Never force-push to `main`.

## Multi-user mode (future, gated behind explicit user instruction)

When the user says "turn on multi-user mode", switch directive 2 to require PRs:

- All work happens on feature branches: `feat/item-N-short-name`.
- No direct pushes to `main`. Use `git push origin feat/...` then open a PR.
- PR description must reference the roadmap item and confirm the pre-flight checklist.
- Vercel will create a preview deploy per PR. Use the preview URL for review.
- Merge to `main` only after the user explicitly approves.
- Until the user flips this on, do not nag about PRs. Just keep solo flow tidy.

## Things the agent must never do

- Run `vercel deploy` / `vercel --prod` / `vercel build`.
- Run `npx vercel --prod --yes` or retry a failed direct CLI deploy.
- Create new Vercel projects.
- Link a local folder to a Vercel project as part of deploying.
- Change the Vercel root directory or build command from the agent side. (Those are dashboard-only.)
- Edit, delete, or reorder applied migrations.
- Commit `.env*` files or any secret.
- Force-push, rewrite, or amend pushed commits on `main`.
- Add new git remotes or change `origin`.
- Run `npm install <new-package>` without user approval (see `roadmap.md`).

## Things the agent should proactively do

- Surface a one-line summary of what is about to be pushed, before pushing.
- Run the local build itself rather than asking the user to.
- After a push, confirm the commit SHA and remind the user that Vercel will auto-deploy in ~1–2 minutes.
- If the user says GitHub auto-deploy is configured, treat `git push origin main` as the deployment action.
- If a build fails on Vercel, immediately pull the logs (read-only CLI) and report the root cause.
