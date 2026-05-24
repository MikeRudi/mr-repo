# MakeReign — Roadmap (Human Version)

This is the plain‑English plan for the next phase of work. The order here is the order we want to do things in. Each item has a "More to come" note — we'll dive into specifics together as we get to each one.

---

## 1. Reset the section library to one starter section *(IN PROGRESS)*

**What this means in plain English**
- Wipe out all the existing sections in the library.
- Replace them with one section: the **Auto Accordion** from the Excellence Awards site, ported from CSS/JS to full React/JSX.
- Update the "Sections" panel inside the builder so it reflects this clean starting point.
- Fully rework how props work: no more hand-wired per-section schemas. Each section ships with its own `section.json` declaring its controls, and the inspector renders those generically.
- App-wide font: Inter only (remove everything else from the app chrome).
- All button text in the app is UPPERCASE.

**Goal**
- Stop pretending we have 15 sections when most are placeholders.
- Start with one really good, real section as the foundation.
- Make the builder's section list look intentional, not stubby.
- Establish the new section-authoring contract that item 2 (Build Mode) will rely on.

**Decisions locked in**
- Slug: `auto-accordion`. Category: `accordion` (UI display: `ACCORDION`).
- Animation options for v1: `slide`, `fade`, `scale`.
- Ship with the real Priority Pass Excellence content as default props.
- The Excellence Awards template stays viewable at `/templates/excellence-awards`, but the homepage "From a library template" tile is disabled and tracked as new item 4.5.

---

## 2. Build a "Build Mode" for the library

**What this means in plain English**
- Give users the ability to create a brand new section asset directly from the library.
- The flow I want:
  1. From the library UI, the user starts a new section.
  2. They download the section to their local machine.
  3. They edit it locally — either in their own editor with a coding agent, or with a local model.
  4. When done, they upload it back to the library, and a builder panel is auto‑generated for it.

**Goal**
- Make the library a two‑way street: not just "browse and use", but "create and contribute".
- Keep section authoring close to real code (local), but make the round‑trip easy.

**More to come**
- I'll provide the resources/spec for what an uploaded section needs to contain.
- We'll define the builder panel schema and how it gets generated from the uploaded section.

---

## 3. Update the library UI

**What this means in plain English**
- Redesign the library page (the catalogue).
- Use design resources I'll send you.

**Goal**
- A library that actually feels like a product surface, not a dev list.

**More to come**
- I'll send the visual references / design files.

---

## 4. Update the site builder UI and architecture

**What this means in plain English**
- Refresh the builder UI.
- Revisit the underlying architecture (how pages, sections, tokens, and saves are wired together).

**Goal**
- A builder that's faster to use, cleaner to look at, and easier to extend.

**More to come**
- We'll list the specific UI pain points and architecture changes once we get here.

---

## 4.5 Fix "Start a site from a library template" flow

**What this means in plain English**
- Today, clicking "From a library template" on the homepage just opens the blank builder. It does nothing useful.
- The Excellence Awards template renders fine on its own page, but you can't actually *start* a site from it.
- Decide how this should work (load the template's sections into the builder canvas? Snapshot the template into a new site row? Something else?) and implement it.

**Goal**
- Templates become real starting points, not decoration.

**More to come**
- Define what "start from template" actually means (copy of sections + tokens? a fork?).

---

## 5. Rework the style guide

**What this means in plain English**
- Change the way a user picks/uses a style guide for each new site.
- Update the style guide UI.
- Expand what the style guide can actually control.

**Goal**
- Brand-once, apply-everywhere should feel real and obvious in the flow.

**Status**: PARTIALLY COMPLETE
- ✅ Two-step onboarding wizard at `/builder/start` (site name → blank style guide)
- ✅ Per-site style guides stored in `sites.data` (round-trip on Save)
- ✅ Removed max-width control from style guide editor (fixed at 1920px)
- ✅ Extracted `StyleGuideEditor` as reusable component
- ✅ BuilderShell hydrates from wizard sessionStorage on mount
- ✅ StylePanel shows per-site guides, lets user switch active
- ✅ InspectorPanel receives `context` with button variants and renders the button picker
- ✅ Auto Accordion links can use the picked style guide button variant
- ✅ Panel rules / section contract updated for the button variant control
- ✅ Image uploads use Vercel Blob, with local preview fallback during development
- ✅ In-builder style guide editing from the Style tab

**More to come**
- We'll define the new "attach style guide to site" flow and the extra capabilities.

---

## 6. Homepage refresh and new ways to start a site

**What this means in plain English**
- Rebuild the homepage UI.
- Add new entry points for starting a site (beyond Blank / From template / Screenshot / Figma / URL).

**Goal**
- The homepage should feel like the front door of the product, with a clear menu of ways in.

**More to come**
- We'll brainstorm the new "start a site" options.

---

## Working agreement

- We tackle these in order.
- For each item, we'll have a short kick‑off chat before any code changes happen.
- The AI counterpart of this file (`to-do.ai.md`) is the technical mirror of this list — keep both in sync when scope changes.
