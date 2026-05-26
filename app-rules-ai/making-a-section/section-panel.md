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
