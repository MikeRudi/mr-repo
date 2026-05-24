# Section panel rules

These rules govern what goes in a section's inspector panel ("the panel") and
how its `section.json` is authored. They apply to **every** section in
`library/sections/`. Future authors — human or AI — must follow them.

If a rule conflicts with what a designer or PM asks for, raise it before
shipping. The point of this file is consistency: one panel UX across the
whole library.

---

## 1. The panel never edits visible text

If a value is rendered as text in the section, the user edits it **on the
canvas**, not in the panel. Double-click the text → it becomes editable in
place → blur or `Esc` to save.

This means **do not** add `text` or `textarea` controls in `section.json` for
things like:

- headings
- subheadings / eyebrows
- body copy
- button labels
- link labels
- item titles, captions, region names, etc.

The panel is for everything that can't be edited inline.

---

## 2. What does belong in the panel

- **Structure**: how many items, ordering options, layout variants.
- **Style controls**: percent sliders for spacing / sizing and token pickers
  for colors pulled from the active style guide.
- **Animation**: pick which animation style applies (e.g. `slide`, `fade`,
  `scale`) and how strong it is.
- **Typography**: token pickers for text tags / scales from the active style
  guide (`h1`-`h6`, `textLarge`, `textMain`, `textSmall`).
- **Timing**: percent-based sliders (see rule 4).
- **Media URLs**: image and video URLs, since they can't be inline-edited.
- **Hidden hrefs**: link `href` values where the label is the visible text
  (the label is inline-editable; the URL is a panel field).
- **Button variants**: use `button-variant` when a section needs to render
  a link or button with one of the active style guide's button styles.

---

## 3. No "move section up / down / remove" inside the inspector

Those affordances live on the canvas (hover toolbar on the section). The
inspector is for **content + style**, not section ordering.

---

## 4. Sliders are percent-based, centered at 50

- All sliders use `min: 0`, `max: 100`, `step: 1` (or 5).
- The default value is `50`. 50 means "the designer-chosen baseline".
- The section is responsible for mapping percent → concrete value
  (ms, px, opacity, etc.). Authors decide what 0% and 100% mean for each
  slider and document it in code with a `// 0% = ..., 100% = ...` comment.
- Sliders show the current percent in the label so the user can see what
  they're picking.

Why: a centered, symmetric slider lets the user feel "more / less" without
needing to know the underlying unit. The section author owns the mapping.

---

## 5. Focused section panels

The base inspector should stay light. When a section has grouped controls, the
base prop panel shows action buttons such as:

- `Update CMS`
- `Update Styles`
- `Update Animation`

Grouped controls opt into a focused panel with `controls[].panel`. Supported
panel ids are:

- `styles`
- `animation`

Typography controls belong inside the `styles` panel with
`"group": "typography"`. Styles controls can also use `"group": "layout"`,
`"group": "color"`, or `"group": "spacing"` so the Styles panel can show
focused dropdown groups. Unpanelled controls remain in the base inspector. CMS
rows live in the top-level `cms` block, not in `controls`.

---

## 6. Animation changes restart the animation

If a section has an `animationStyle` control, changing it must **reset the
section's animation state** — back to the first item, restart any auto
timers, replay the reveal. Otherwise the user can't see what the new style
actually looks like.

---

## 7. Arrays ("Add an item")

Sections that render repeatable content should use the section CMS contract
instead of a normal inspector `array-object` control. The selected section's
prop panel shows an **Update CMS** button, and that dedicated panel owns adding,
removing, and editing CMS rows.

Use `array-object` in `controls` only as an escape hatch for non-CMS structural
arrays. The main inspector remains for section-level style, timing, and layout.

---

## 8. Section.json shape

```json
{
  "id": "kebab-case-slug",
  "name": "Human Name",
  "category": "kebab-case-folder",
  "version": "0.1.0",
  "track": "stable",
  "lifecycle": "Approved",
  "description": "One-line plain English.",
  "dependencies": ["gsap"],
  "tags": ["..."],
  "controls": [
    /* ... */
  ]
}
```

Supported `controls[].type` values:

- `slider` — `{ key, type: 'slider', label, min, max, step }`
- `select` — `{ key, type: 'select', label, options: [{ value, label }] }`
- `image` — `{ key, type: 'image', label }` (URL string for now)
- `array-object` — `{ key, type: 'array-object', label, objectFields: [...] }`
- `button-variant` — `{ key, type: 'button-variant', label }`; options are
  supplied by the active style guide's `buttons` array.
- `color-token` — `{ key, type: 'color-token', label }`; options are supplied
  by the active style guide's `colors` object.
- `typography-token` — `{ key, type: 'typography-token', label }`; options are
  supplied by the active style guide's typography scale.
- `toggle` — `{ key, type: 'toggle', label, defaultValue }` for boolean on/off
  settings.
- `number` — escape hatch for unitless integers that aren't a slider
- `text` / `textarea` — **forbidden** unless the value is genuinely a hidden
  identifier (href, alt text, etc.) that the user can't see in the rendered
  section.

For repeatable content, add a top-level `cms` block:

```json
{
  "cms": {
    "key": "items",
    "label": "Items",
    "defaultValue": [],
    "fields": [
      { "key": "eyebrow", "type": "text", "label": "Eyebrow text" },
      { "key": "heading", "type": "text", "label": "Heading text" },
      { "key": "subheading", "type": "textarea", "label": "Sub-heading text" },
      { "key": "description", "type": "textarea", "label": "Description text" },
      { "key": "image", "type": "image", "label": "Image" }
    ]
  }
}
```

---

Controls can include `"panel": "styles"` or `"panel": "animation"` to move
them into a focused update panel. Styles controls can include `"group":
"typography"`, `"layout"`, `"color"`, or `"spacing"`.

---

## 9. Default props in the React component

Every section component defaults every controllable prop. Never rely on the
builder to pass a value. The section must render correctly with **zero
props**.

Use a single exported `DEFAULTS` (or per-prop default in the function
signature). When the builder mounts the section for the first time, it
passes an empty `props` object — the defaults are what the user sees.

---

## 10. Editable text contract

The section component receives two optional props from the builder:

- `_editing: boolean` — when `true`, the section is being rendered inside
  the builder canvas and inline edits should be allowed.
- `_onPropChange: (key, value) => void` — call this when the user edits a
  text node. `key` is the prop key (e.g. `"eyebrow"`), `value` is the new
  string. For array items, write back the whole array:
  `_onPropChange("items", nextItems)`.

Both props are absent on the preview route and on published sites — the
section must render as inert text in that case.

Use the shared `EditableText` helper exported from
`library/sections/_shared/EditableText.jsx` to standardise the behaviour.
