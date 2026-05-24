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

**Status**: IN PROGRESS.

**Locked-in decisions**
- Source: AwardsShowcase auto-accordion in `library/templates/excellence-awards/sections/AwardsShowcase.jsx` (markup ~L763–1184) + jQuery/GSAP logic in `public/script.js` `aaItemsAuto()` (L82–299). Port to React/JSX with GSAP only (no jQuery).
- Slug: `auto-accordion`. Category folder (filesystem): `accordion`. Display label (UI): `ACCORDION`. All category labels render UPPERCASE.
- Display name: `Auto Accordion`. Inter font, restrained size.
- Section files live at `library/sections/accordion/auto-accordion/Section.jsx` and `section.json`.
- Default props ship with the real PP Excellence content (4 regions, real images from `/webflow/images/`).
- All app-chrome buttons render uppercase.
- App font is Inter app-wide via `next/font/google`. Remove all references to other fonts in app chrome (`Lay Grotesk`, `Geist Mono`, etc.). Template-internal references stay (the template is preserved).
- Excellence Awards template stays at `/templates/excellence-awards`. Homepage "From a library template" tile is disabled and logged as item 4.5.

**Props rework (replaces all prior prop wiring)**
- Delete `library/section-props.js` and `library/sections-seed.json`.
- Each section owns its metadata + controls in a colocated `section.json`.
- `lib/sections.js` reads from `library/index.json` (manifest), regenerated automatically on every build.
- `package.json` `build` runs `library:manifest` before `db:migrate && next build`.
- Inspector renders controls generically from `controls` array in `section.json`. Supported control types for v1: `text`, `textarea`, `number`, `slider` (min/max/step), `select` (options), `array-object` (rows of fields), `image` (URL string for now).
- Drop per-element style overrides and styleguide presets from the inspector for now — styling-via-inspector is reintroduced in item 4 if needed.

**Controls for `auto-accordion`**
- `autoAdvanceMs` — slider, ms each item stays active. Range 2000–12000, step 250, default 5000.
- `revealMs` — slider, animation duration when an item activates. Range 200–1500, step 50, default 600.
- `animationStyle` — select. Options: `slide`, `fade`, `scale`. Default `slide`.
- `eyebrow` — text. Default: `Highly Commended Lounges 2026`.
- `heading` — textarea. Default: `Recognising exceptional service and experiences for Priority Pass Members.`
- `items` — array-object with fields: `region` (text), `title` (text), `location` (textarea), `description` (textarea), `image` (image URL), `linkLabel` (text), `linkHref` (text). Defaults: the 4 real regions from AwardsShowcase.

**Scope of code changes**
- Delete all current folders under `library/sections/<category>/<slug>/`.
- Delete `library/sections-seed.json` and `library/section-props.js`.
- Create `library/sections/accordion/auto-accordion/Section.jsx` and `section.json`.
- Rewrite `library/registry.js` to register only the new section.
- Rewrite `lib/sections.js` to read from `library/index.json` (manifest) instead of seed.
- Update `package.json` build script to regenerate the manifest pre-build.
- Wire Inter via `next/font/google` in `app/layout.jsx`. Update `app/globals.css` so `--font-display` and `--font-body` resolve to Inter, drop `Lay Grotesk` / `Geist Mono` references in app chrome.
- Rewrite `app/builder/new/_components/InspectorPanel.jsx` as a generic controls renderer driven by `section.json`. Remove `data-sg-prop` selection-on-element flow and per-element style overrides (will revisit in item 4).
- Rewrite `app/builder/new/_components/SectionsPanel.jsx`: section list grouped by category folders; folder labels rendered UPPERCASE; uppercase buttons throughout.
- Disable the "From a library template" tile on `app/page.jsx`. Mark it as coming soon. Add item 4.5 to both to-do files.
- Audit `BuilderShell.jsx` for any references to deleted section IDs (e.g. `isNav = sectionId === 'navigation-floating-bar'`) and remove/adapt.

**Out of scope**
- Library page redesign (item 3).
- Builder architecture refresh (item 4).
- Style guide rework (item 5).
- Build Mode upload/download flow (item 2).
- Connecting to the external `MattMakeReign/section-marketplace` library (later items; only the UI reference matters now and only for item 3).

**Acceptance**
- `library/sections/` contains exactly one section folder: `accordion/auto-accordion/`.
- `library/index.json` is regenerated and reflects exactly one section.
- `app/api/sections` returns the one section.
- `/library` shows one card.
- `/library/auto-accordion` shows the detail page with no errors.
- `/sections/auto-accordion/preview` renders the section live with default props.
- `/builder/new` shows the new SectionsPanel with the single section under an uppercase `ACCORDION` group; clicking adds it to the canvas; inspector renders the four controls (`autoAdvanceMs`, `revealMs`, `animationStyle`, `items`) and edits update the canvas live.
- All in-app button text renders UPPERCASE.
- App fonts: Inter only in chrome.
- `/templates/excellence-awards` still renders correctly.
- Homepage "From a library template" tile is visibly disabled / coming soon.
- Local build passes; Vercel build passes; saved sites in the `sites` table that referenced old sections render gracefully (missing components fall through to nothing rather than crashing).

**Migration safety**
- The `sites` DB table contains saved pages referencing old section IDs (e.g. `hero-split-bold`). Defensive read in `app/site/[siteId]/page.jsx` already handles unknown section IDs by returning `null` from `getSectionComponent`. Verify this still holds; do not modify schema.

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

## 4.5. Fix "Start a site from a library template" flow

**Status**: pending user kickoff. Raised during item 1.

**Problem**
- `app/page.jsx` "From a library template" links to `/builder/new?from=template`.
- `app/builder/new/page.jsx` reads `?from=template` but only sets `initialTemplate` for display; it does **not** load template sections into the builder canvas.
- Net effect: user clicks "From a template" and gets a blank builder.

**Scope (to refine at kickoff)**
- Decide semantics: does selecting a template (a) copy its sections+tokens into a new empty builder state, (b) deep-clone the template's saved site row, or (c) something else.
- If (a) is chosen: templates need their own canonical pages/sections shape in `library/templates/<slug>/template.json`, parseable into the builder's `pages[].sections[]` shape.
- Template selection UI: which template? Today the homepage tile is a generic link. Likely needs a chooser (`/builder/new?template=<slug>` or `/start/template`).
- Loading state and error handling for unknown/missing template slug.

**Out of scope**
- Adding new templates beyond `excellence-awards`.
- The `blank` pseudo-template (it's just an empty builder, no action needed).

**Acceptance**
- User can pick the Excellence Awards template from the homepage and land in a builder pre-loaded with that template's sections and tokens, ready to edit.
- Saving creates a new site row independent of the template.

---

## 5. Style guide rework

**Status**: PARTIALLY COMPLETE (user kicked off, work done, follow-ups deferred).

**Completed in this session**
- Two-step onboarding wizard at `/builder/start` (site name → blank style guide).
- Per-site style guides stored in `sites.data` (round-trip on Save).
- Removed max-width control from style guide editor (fixed at 1920px).
- Extracted `StyleGuideEditor` as reusable component.
- BuilderShell hydrates from wizard sessionStorage on mount.
- StylePanel shows per-site guides, lets user switch active.
- InspectorPanel receives `context` with button variants and renders `button-variant` controls.
- Auto Accordion renders its link CTA using the picked style guide button variant.
- `PANEL_RULES.md`, `section.schema.json`, and Auto Accordion `section.json` document the `button-variant` control type.

**Deferred to follow-up items**
- Image upload with Vercel Blob (requires Vercel Blob setup).
- In-builder style guide editing (deferred to keep scope manageable).

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
