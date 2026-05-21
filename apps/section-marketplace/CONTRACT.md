# Design-System Adaptation Contract

Sections in this library are **layout-first**, not styling-first. A section
declares the *shape* of its content and the *roles* it asks the host project
to fill, but never hard-codes brand colors, type, spacing, or motion timing.

## Tokens a section may consume

Sections render against CSS custom properties exposed by the consuming
project. Tailwind v4's `@theme` directive is the canonical way to declare
these:

```css
@theme {
  --color-mr-surface: #fff;
  --color-mr-fg: #111;
  --color-mr-fg-muted: rgba(0,0,0,0.6);
  --color-mr-accent: #c8a96a;
  --color-mr-border: rgba(0,0,0,0.12);

  --font-display: "Inter", system-ui, sans-serif;
}
```

A section may **read** these tokens via Tailwind utilities or raw CSS
variables. A section may **never** override them.

## What a section ships

- `section.json`  Manifest (see `library/schemas/section.schema.json`).
- `index.jsx`     React/JSX entry. No global side effects.
- `motion.js`     Optional. Exports a `register({ scope, ScrollTrigger })` fn.
- `styles.css`    Optional. Scoped via `data-mr-section="<id>"`.
- `preview.png`   Static screenshot for the marketplace UI.
- `README.md`     Human + AI readable docs.

## What a section never does

- Import a design system or theme provider.
- Set body-level styles, fonts, or smooth-scroll.
- Hard-code copy strings (use `props.content`).
- Reach outside its folder for assets unless via the host project's
  `public/` conventions.

## Templates

Templates (`library/templates/<slug>/`) are the exception: they compose
many sections into a full page and *may* bring their own CSS/JS. The
current Excellence Awards template is a transitional one that carries
the Webflow runtime; future templates should be pure compositions of
library sections.
