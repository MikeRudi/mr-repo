# Section Panel Rules

These rules govern every builder prop panel for sections in `apps/section-marketplace/library/sections/`. Any human or AI creating a new section must follow them.

## Required Panel Shape

The base selected-section panel stays light. It shows action buttons that open focused panels:

- `Update CMS` appears only when the section has repeatable content in a top-level `cms` block.
- `Update Styles` must always appear for every section.
- `Update Animation` appears only when the section has animation controls.

The focused panel ids are:

- `styles`
- `animation`

Controls move into these focused panels with `controls[].panel`.

## CMS Rules

If the section renders repeatable items, use a top-level `cms` block in `section.json`. Do not model repeatable content as normal style controls.

CMS owns add, remove, and row editing. It may include visible text fields because CMS rows are item content, but section-level visible text should still be edited inline on the canvas.

Use `Update CMS` only when `cms` exists.

## Styles Rules

Every section must have `Update Styles`. The Styles panel must always include a `layout` group, even if the first version has only one layout control.

Styles must cover all user-meaningful visual controls:

- all layout gaps
- section padding and inner spacing
- media sizing
- text block spacing
- typography tag/scale choices for every rendered text role
- color controls for every rendered text role and major visual part
- button/link style controls when buttons or links are present

Styles must link to the active style guide, not hard-coded one-off values:

- Use `typography-token` for text roles.
- Use `color-token` for colors.
- Use `button-variant` for buttons or links that can take style guide button styles.
- Use section-owned percent sliders for spacing and sizing.

Do not add per-section font-family, raw hex color, or raw button-style dropdowns unless the user explicitly asks for a new style guide capability first.

## Slider Rules

All section panel sliders use:

- `min: 0`
- `max: 100`
- `step: 1` or `step: 5`
- `defaultValue: 50` unless there is a documented reason not to

`50` is the designer baseline. Moving left means "less/smaller/faster depending on the label"; moving right means "more/larger/slower depending on the label".

Slider mappings live inside the section component, not in the builder. The section must document each mapping in code.

For the current section panel behavior, sliders should use the full `0..100` range with no dead zones. To make controls feel more responsive, the section should use a wider concrete range than the first baseline pass: `50` is still baseline, but `0` and `100` must keep changing beyond the old low/high effect instead of clamping at `25` and `75`.

## Animation Rules

Only sections with real animation controls get `Update Animation`.

If a section has automatic rotation or automatic animation playback, the base selected-section panel should show an `Auto play` toggle.

If a section has animation but it is not automatic, such as a scroll-triggered or one-shot reveal, the base selected-section panel should show a `Play animation` button instead of an auto toggle.

Animation controls belong in `panel: "animation"`. Examples:

- animation style dropdown
- timing sliders
- reveal strength sliders
- scroll trigger mode controls

Changing `animationStyle` must restart the animation preview so the user can immediately see the selected style.

## Text Editing Rules

Visible section-level text is edited inline on the canvas using `EditableText`. Do not add normal panel fields for visible headings, subheadings, body copy, eyebrow text, button labels, or link labels.

Hidden values that cannot be edited inline may live in CMS or controls, such as:

- link hrefs
- image URLs
- alt text
- hidden IDs

## Section.json Contract

Use this shape:

```json
{
  "id": "kebab-case-slug",
  "name": "Human Name",
  "category": "kebab-case-folder",
  "version": "0.1.0",
  "track": "stable",
  "lifecycle": "Approved",
  "description": "One-line plain English.",
  "dependencies": [],
  "tags": [],
  "controls": [],
  "cms": {}
}
```

Supported control types:

- `slider`
- `select`
- `image`
- `array-object`
- `button-variant`
- `color-token`
- `typography-token`
- `toggle`
- `number`
- `text`
- `textarea`

Use `text` and `textarea` sparingly outside CMS. They are forbidden for visible section-level copy.

## Build Mode Local App Rules

Library Build Mode downloads `make-reign-section-builder.zip`. It expands into a reusable local app named `make-reign-section-builder/`.

The local app is downloaded once and can create many sections. Do not tell the user to redownload the app for every new section unless the MakeReign app ships a newer builder package.

Each local section lives in:

```text
make-reign-section-builder/
  sections/
    <section-id>/
      Section.jsx
      Section.module.css
      section.json
      README.md
```

Local AI tools should run `npm install` and `npm run dev` inside `make-reign-section-builder/` when the user asks to view or edit the section on localhost. They should create new section projects with:

```bash
npm run new -- kebab-case-section-id
```

The app preview must render the section and the generated MakeReign-style prop panel. The panel must include the required base actions and focused panels described above.

The local builder UI template must use this structure:

- Left panel: section project selector, `Start a new section`, and export.
- Left panel: `Preview fullscreen` so the user can inspect the selected section without panels.
- Center: live section preview.
- Right panel: `Update CMS`, `Update Styles`, `Update Animation`, and `Play animation`.

When the user first gives this prompt:

```text
Start the app inside make-reign-section-builder.zip; run it on local and give me the link.
```

The AI should unzip the app, install dependencies, start the local dev server, give the user the localhost URL, and then ask what new section they want to make. It should not start building a section until the user gives a section URL or description.

## Build Mode Export Rules

When a local section is ready, export only that section. Do not zip the whole builder app.

Use the in-app `Export section JSON` button for the selected section, or run:

```bash
npm run export -- kebab-case-section-id
```

The exported upload JSON must be a single `make-reign-section-package` object with:

```text
{
  "kind": "make-reign-section-package",
  "packageVersion": "0.2.0",
  "files": {
    "section/Section.jsx": "...",
    "section/Section.module.css": "...",
    "section/section.json": "...",
    "section/README.md": "...",
    "rules/section-panel.md": "..."
  }
}
```

The upload JSON must not contain the reusable builder app, `node_modules`, `dist`, build output, temp files, private keys, or absolute filesystem paths.

Do not upload loose files. ZIP exports are still accepted for backward compatibility, but JSON is the preferred export from the local builder.

## Responsive Section Rules

Every generated section must be responsive on desktop, tablet, and mobile. Test at roughly 1440px, 768px, and 390px widths before export.

Use CSS Grid/Flex with wrapping, fluid widths, stable media dimensions, and media queries where needed. Do not rely on fixed desktop-only widths.

On tablet and mobile:

- Text must not overlap images, cards, or controls.
- Images and media must keep stable aspect ratios and never overflow the viewport.
- Cards and repeated CMS items should wrap or stack cleanly.
- Section padding and gaps should scale down while still honoring the section's slider-driven values.

## Implementation Rules

Every section component must render correctly with zero props. Defaults belong in the component signature or an exported defaults object.

The builder passes these optional props:

- `_editing`
- `_onPropChange`

Use `_onPropChange` only for inline editable text or builder-only interactions that persist section props.

After changing anything under `library/sections/` or `library/templates/`, run:

```bash
npm --workspace apps/section-marketplace run library:manifest
```

Then run a local build before deploy.
