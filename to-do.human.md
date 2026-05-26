# MakeReign — Roadmap (Human Version)

This is the plain‑English plan for the next phase of work. The order here is the order we want to do things in. Each item has a "More to come" note — we'll dive into specifics together as we get to each one.

---

## 1. Reset the section library to one starter section *(DONE)*

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

## 2. Build a "Build Mode" for the library *(IN PROGRESS)*

**What this means in plain English**
- Give users the ability to create a brand new section asset directly from the library.
- The flow I want:
  1. From the library UI, the user starts a new section.
  2. They download a zipped local section builder app to their machine.
  3. They use that local app with their own editor, coding agent, or local model to create one or many sections.
  4. They preview each section locally with the MakeReign-style prop panel.
  5. When a section is ready, they export that one section as a clean zip and upload it back to the library for review.

**Goal**
- Make the library a two‑way street: not just "browse and use", but "create and contribute".
- Keep section authoring close to real code (local), but make the round‑trip easy.

**More to come**
- First slice: library button downloads a reusable local section builder app with rules, starter section folders, a localhost preview, and export tools; upload stores the exported section zip for review.
- Temporary public Activate, Deactivate, and Delete controls are visible in the review queue for now, but turning a brand-new uploaded section into real live code is still manually promoted until we build the admin panel later.
- We'll keep refining the downloaded rules and guidance after the first working path is live.

---

## 3. Update UI across everything and do a full clean

**What this means in plain English**
- Clean up the UI across the full app.
- Make the homepage, style guide, builder, library, panels, navigation, buttons, typography, and spacing feel consistent.
- Revisit any rough interaction or architecture details that block a clean UI pass.

**Goal**
- A cleaner, more consistent product surface across the whole app.

**More to come**
- We'll list the specific UI pain points and cleanup passes once we get here.

---

## 4. Fix "Start a site from a library template" flow

**What this means in plain English**
- Today, clicking "From a library template" on the homepage just opens the blank builder. It does nothing useful.
- The Excellence Awards template renders fine on its own page, but you can't actually *start* a site from it.
- Decide how this should work (load the template's sections into the builder canvas? Snapshot the template into a new site row? Something else?) and implement it.

**Goal**
- Templates become real starting points, not decoration.

**More to come**
- Define what "start from template" actually means (copy of sections + tokens? a fork?).

---

## 5. Rework the style guide *(ONGOING)*

**What this means in plain English**
- Change the way a user picks/uses a style guide for each new site.
- Update the style guide UI.
- Expand what the style guide can actually control.

**Goal**
- Brand-once, apply-everywhere should feel real and obvious in the flow.

**Status**: ONGOING
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
- ✅ Auto Accordion prop panel opens focused Update CMS, Update Styles, and Update Animation panels
- ✅ Auto Accordion Styles panel includes image size sliders and style guide color pickers
- ✅ Auto Accordion typography controls live inside the Styles panel
- ✅ Auto Accordion default link/button remains the native section link: plain text, left aligned, underline on hover
- ✅ Auto Accordion prop panel now includes an Auto play toggle
- ✅ Auto Accordion Styles now groups Typography, Layout, Color, and Spacing in one panel
- ✅ Style guide spacing now includes site padding, and Auto Accordion respects it with a 2em fallback
- ✅ Auto Accordion spacing now uses one Y-padding slider plus controls for header and item gaps
- ✅ Auto Accordion layout now supports accordion width, image sizing, and reversing image/content order
- ✅ Auto Accordion Auto play toggle now updates when a user clicks an item and pauses auto-play
- ✅ Auto Accordion Layout now uses one Split slider instead of separate accordion/image width sliders
- ✅ Auto Accordion Progress color now sets both the fill and the faded track background
- ✅ Auto Accordion color controls now start from explicit style guide colors instead of blank defaults

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
