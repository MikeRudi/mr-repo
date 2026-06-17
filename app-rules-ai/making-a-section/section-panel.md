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

Never show both `Auto play` and `Play animation` for the same section. It is one or the other.

The main MakeReign builder provides `Play animation` as a default action for sections with animation controls. New sections should listen for the `_playAnimationKey` prop and replay their manual animation whenever that number changes. Do not create a custom play button inside the section markup.

Animation controls belong in `panel: "animation"`. Preset-based animation controls must use this structure:

- One preset dropdown, preferably `animationPreset`, with `type: "select"`, `panel: "animation"`, `group: "preset"`, and a real default value that matches how the section first renders.
- Global controls that affect every preset, such as duration, easing, stagger, or overall strength, with `group: "global"` or `group: "shared"`.
- One collapsible control group per preset. The `group` value must match the preset value, such as `liftFade`, `scalePop`, or `scaleJiggle`.
- Per-preset sliders should only affect that preset. Global sliders should affect all presets.

Examples:

- animation preset dropdown
- global duration and ease sliders
- lift-and-fade distance slider inside `group: "liftFade"`
- scale-pop overshoot slider inside `group: "scalePop"`
- scroll trigger mode controls

Changing `animationPreset` or the older `animationStyle` key must restart the animation preview so the user can immediately see the selected style.

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

The downloadable local builder must improve as real sections are added to the main app. When adding section batches directly in this repo, treat every repeated issue, missing control, animation mismatch, asset problem, responsive fix, export gap, or QA lesson as feedback for the builder package. Update the rules and/or generator code that ships inside `make-reign-section-builder.zip` so future users get those improvements locally.

For large libraries, add sections in small batches first, validate them in the main app builder, then increase batch size only after the pattern is reliable. Early batches should prioritize learning the section structure and updating the local builder contract over raw import speed.

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
- Right panel: `Update CMS`, `Update Styles`, `Update Animation`, and either `Auto play` or `Play animation` when animation exists.

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
    "assets/<section-id>/image.png": { "encoding": "base64", "content": "...", "mimeType": "image/png" },
    "rules/section-panel.md": "..."
  }
}
```

If a section uses local images or media, put them under `public/<section-id>/...` before export. The export script packages those assets into JSON so the main app can render them after upload.

The exported package should also preserve the final builder panel state. The local app's **Export section JSON** button writes the current panel values into `initialProps` and updates matching `controls[].defaultValue` and `cms.defaultValue` in `section/section.json`. If exporting with a script or custom AI workflow, persist the final approved panel values the same way before creating the JSON, so the main app opens the uploaded section exactly as it looked at export time.

Do not rely on temporary React state, browser memory, or "the user can adjust it again later" as the exported source of truth. If a slider, select, toggle, inline text edit, or CMS edit is visible in the local preview at export time, that value must exist in the exported JSON.

Image and media sizing must survive the main app builder. For animated, absolute, hover, or overlay images, define explicit sizing in CSS and guard against app-level image resets:

- Use explicit `width`, `height`/`aspect-ratio`, and `object-fit` when the image has a visual box.
- Add `max-width: none` and `display: block` to image classes that must not be constrained by parent letter/card width.
- Do not depend on an invisible parent box to size the actual `<img>` element.
- Test the uploaded section in the main builder, not only the local builder.

Exported sections must not depend on hidden CDN scripts, global browser variables, or optional plugin files that are not declared and available in the MakeReign app. If an original reference uses helpers such as Lenis, paid/member GSAP plugins, or a page-level script tag, either replace that behavior with standard app dependencies or explicitly document the approved dependency before export. The uploaded section should import what it needs from package dependencies and run without extra `<script>` tags.

Spacing controls must visibly affect the named gap. For text-stack controls like `eyebrowHeadingGapPct`, prefer applying the value through a parent `gap`/`row-gap` or an explicit wrapper spacing rule. Do not rely on a margin that can collapse, be hidden by grid placement, or be visually cancelled by another text style.

For multi-line text groups, create explicit elements or wrappers for each named gap. Example: eyebrow uses `margin-bottom: var(--eyebrow-heading-gap)`, heading uses `margin-bottom: var(--heading-body-gap)`, and the whole text/media stack uses a separate `gap` for the media. Never map two different sliders to the same CSS gap, and never leave a slider key unused in `Section.jsx`.

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
