# MakeReign — Roadmap (AI Agent Version)

> Audience: AI coding agents working in this monorepo. This is the technical mirror of `to-do.human.md`. Keep both files in sync. Do **not** start work on any item until the user explicitly green‑lights it. Each item lists scope, expected touchpoints, constraints, and open questions so you can plan, but do not implement preemptively.

---

## Repo orientation (read before planning any task)

- Monorepo (npm workspaces). Primary app: `apps/section-marketplace` (Next.js 16 App Router, JSX, Tailwind v4).
- Shared packages: `packages/canonical-stack` (motion + `<Section>` primitive), `packages/section-library-ui` (shared chrome).
- Section source of truth: `apps/section-marketplace/library/sections/<category>/<slug>/`.
- Manifest generator: `apps/section-marketplace/library/scripts/build-manifest.mjs` → `library/index.json`.
- Section registry (runtime component map): `apps/section-marketplace/library/registry.js`.
- Builder UI: `apps/section-marketplace/app/builder/new/_components/` (`BuilderShell.jsx`, `SectionsPanel.jsx`, `PagesPanel.jsx`, `StylePanel.jsx`, `InspectorPanel.jsx`).
- Style guide: `lib/styleguide-css.js`, `lib/styleguide-defaults.js`, API at `app/api/styleguides/*`, persisted in Neon (`style_guides` table).
- Publishing: `app/api/sites/publish/route.js` + `app/site/[siteId]/page.jsx`. Persisted in Neon (`sites` table, migration `db/migrations/0002_sites.sql`).
- DB client: `apps/section-marketplace/lib/db.js` (lazy Neon serverless). Migrations run via `node db/migrate.mjs && next build`.
- Deployment: GitHub `main` → Vercel project `react-mr-frontend` (auto‑deploy). Do not invoke `vercel` CLI for deploys; push to `main` instead.

---

## Global constraints

- JSX only in app/library code unless the user explicitly opts into TypeScript. Do **not** reintroduce `tsconfig.json` or `.tsx` files in `apps/section-marketplace`.
- Keep changes minimal and focused. Prefer surgical edits over rewrites.
- Never delete sections from `library/sections/` or `library/registry.js` until item 1 kicks off and the user supplies the replacement asset.
- Never weaken or delete tests/migrations without explicit instruction.
- All new section folders must conform to `library/schemas/section.schema.json`. Update the schema only with explicit approval.
- Run `npm run library:manifest` after any change under `library/sections/` or `library/templates/`.
- Always rebuild locally (`npx next build apps/section-marketplace`) before pushing; the Vercel build runs `node db/migrate.mjs && next build`.

---

## 1. Reset library to a single starter section

**Status**: pending user kickoff (asset incoming).

**Scope**
- Remove all current section folders under `apps/section-marketplace/library/sections/<category>/<slug>/`.
- Remove their entries from `library/sections-seed.json` and `library/registry.js`.
- Add the user‑supplied section as the sole section.
- Regenerate `library/index.json` via the manifest script.
- Update `apps/section-marketplace/app/builder/new/_components/SectionsPanel.jsx` to reflect the new single‑section state and any new visual direction the user provides.
- Audit `apps/section-marketplace/library/templates/` — templates referencing removed sections must be removed or updated; do not leave dangling refs.
- Verify `/api/sections`, `/library`, `/library/[id]`, `/sections/[id]/preview`, and the builder still build and render.

**Inputs required from user**
- The section asset (files, expected slug/category, props/schema, any motion/animation behaviour).
- Direction for `SectionsPanel.jsx` UI changes.

**Acceptance**
- `library/index.json` regenerated and committed.
- Build passes; Vercel deploy green.
- Builder shows exactly one section in the picker; preview and add‑to‑canvas both work.
- No stale imports in `registry.js` or seed data.

**Open questions**
- Are templates kept (and updated to use the new section), or removed for now?
- Does the new section ship with example props/preview content?

---

## 2. "Build Mode" for the library (author → download → local edit → upload)

**Status**: pending user kickoff (resources incoming).

**Scope (high level)**
- New library UI affordance: "Create new section".
- Server endpoint to scaffold a section package and stream it as a downloadable archive (zip) with the canonical folder shape (`Section.jsx`, `meta.json`/`section.json`, optional preview, README).
- Server endpoint to accept an uploaded archive, validate against `section.schema.json`, write into `library/sections/<category>/<slug>/`, regenerate the manifest, and dynamically derive the builder inspector panel from the section's prop schema.
- Builder panel auto‑generation: define a contract so a section's exported `propsSchema` (or `meta.json` `controls` block) drives `InspectorPanel.jsx` controls without hand‑authoring per section.

**Likely touchpoints**
- New routes under `app/api/library/` (e.g. `scaffold`, `upload`).
- New page/flow under `app/library/` (or a modal in the existing library UI).
- New util in `library/scripts/` for archive pack/unpack and validation.
- Extension of `library/schemas/section.schema.json` to formalise control metadata.
- `InspectorPanel.jsx` generic renderer driven by control metadata.

**Constraints**
- Vercel filesystem is read‑only at runtime. Uploaded sections cannot be written to `library/` on Vercel; design must account for this. Options to discuss with user: (a) authoring is local‑only, with upload meaning "open a PR / write to git", (b) uploaded sections live in DB/blob storage and are loaded dynamically, (c) hybrid. Do **not** assume; surface the choice when item 2 starts.
- Security: any archive upload must be size‑limited, content‑type checked, and path‑traversal hardened. No arbitrary code execution server‑side.
- Local agent edit loop is out of scope for the server — assume the user runs their own local tooling between download and upload.

**Inputs required from user**
- The reference resources/spec for what an uploaded section must contain.
- Decision on the runtime storage model (filesystem vs. DB/blob vs. git PR).
- Decision on the panel‑generation contract (props schema shape).

**Acceptance**
- A user can: click "Create section" → download a working scaffold → re‑upload → see it in the library and builder with a generated inspector panel — without manual code edits to registry/manifest.

---

## 3. Library UI redesign

**Status**: pending user kickoff (design resources incoming).

**Scope**
- Redesign `app/library/page.jsx` and `app/library/[id]/page.jsx` per the supplied design.
- Reuse `packages/section-library-ui` where possible; promote new shared chrome into that package if it's used in more than one place.
- Keep filter/lifecycle/track semantics (defined in `library/lib/filtering`‑adjacent code) unless the user changes them explicitly.

**Inputs required from user**
- Design files / references.
- Any new metadata fields the redesign depends on (must round‑trip through manifest + schema).

**Acceptance**
- Visual parity with supplied design.
- No regressions in section detail/preview routes.
- No new TypeScript; Tailwind v4 tokens only.

---

## 4. Site builder UI + architecture refresh

**Status**: pending user kickoff.

**Scope (to be refined)**
- UI: revisit `BuilderShell.jsx`, `SectionsPanel.jsx`, `PagesPanel.jsx`, `StylePanel.jsx`, `InspectorPanel.jsx`.
- Architecture candidates to discuss before any work:
  - State model: current `useState` tree in `BuilderShell.jsx` → consider a single store (zustand or context+reducer) for pages/tokens/selection.
  - Persistence: today, save = full snapshot to `sites` table. Consider draft autosave, versioning, and per‑page persistence.
  - Section instance shape: standardise `inst.props` vs. style overrides vs. element‑level tokens.
  - Inspector contract: align with item 2's auto‑generated panels.
- Keep publish output (`/site/[siteId]`) backward compatible or migrate stored rows.

**Constraints**
- Do not break existing saved sites in the `sites` table without a migration path.
- Maintain SSR rendering of published sites (no client‑only data dependencies for `/site/[siteId]`).

**Inputs required from user**
- Pain‑point list.
- Direction on state model and autosave/versioning.

**Acceptance**
- Defined per sub‑task at kickoff.

---

## 5. Style guide rework

**Status**: pending user kickoff.

**Scope (to be refined)**
- Change how a style guide attaches to a site: today the builder loads guides from `/api/styleguides` and stores `styleGuideId` on the saved site. Likely changes: per‑site style guide selection at site creation, ability to fork/clone a guide for a site, snapshotting the guide into the site at publish time so published sites are immutable against later guide edits.
- UI: redesign `app/styleguide/page.jsx` and the `StylePanel.jsx` in the builder.
- Capabilities: extend `lib/styleguide-defaults.js` and `lib/styleguide-css.js` with whatever new token categories the user defines (e.g. motion tokens, component variants, dark mode pairs).

**Constraints**
- Migration plan required for the `style_guides` table if the schema changes.
- Published sites already in `sites` table must continue to render — handle missing/legacy fields defensively in `app/site/[siteId]/page.jsx`.

**Inputs required from user**
- New attach/fork flow.
- New token categories.
- Visual references.

**Acceptance**
- Defined at kickoff.

---

## 6. Homepage refresh + new "start a site" entries

**Status**: pending user kickoff.

**Scope**
- Redesign `app/page.jsx` (homepage).
- Existing entries: Blank, From template, Screenshot (coming soon), Figma (coming soon), URL (coming soon). Three of these are placeholders at `/start/[mode]`.
- Add new entry types as defined by the user. Each new entry should map to a route under `/start/[mode]` or a new top‑level flow.

**Constraints**
- Coming‑soon entries are fine, but mark them clearly and route them to a real placeholder page.
- Keep homepage SSR/static where possible.

**Inputs required from user**
- New entry types.
- Visual references.

**Acceptance**
- Defined at kickoff.

---

## Process rules for the agent

1. Do not start an item until the user explicitly says "let's start item N".
2. At kickoff for each item: produce a short plan, list inputs you still need, and wait for confirmation before editing files.
3. After each item: update both `to-do.human.md` and `to-do.ai.md` to reflect status and any scope changes.
4. Deploy = `git push origin main`. Do not run `vercel` CLI deploys.
5. Always rebuild locally before pushing: `npx next build apps/section-marketplace`.
