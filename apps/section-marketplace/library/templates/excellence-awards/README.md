# Priority Pass · Excellence Awards 2026

A full-page Webflow campaign exported and ported to React/JSX.

## Structure

```
library/templates/excellence-awards/
├── template.json        Manifest
├── index.jsx            Root template component (renders all sections)
├── README.md            This file
├── sections/            Page sections (Navigation, Hero, VideoSection, etc.)
└── components/          Shared components (AnimationScripts)
```

## How it renders

The marketplace app exposes this template at `/templates/excellence-awards`. The
route's `layout.jsx` injects the Webflow CSS (`normalize.css`, `components.css`,
`excellence-awards.css`, `/styles.css`) so the template's CSS classes still
resolve. The `WebflowAttrs` client component sets the `data-wf-page` /
`data-wf-site` attributes only while this template is mounted.

## Migration roadmap

This is a transitional template that keeps the existing Webflow CSS and
runtime JS working until the underlying sections are extracted into
proper library sections under `library/sections/<category>/<slug>/` and
rebuilt against the design-system tokens.

The intended end state:
- `library/sections/navigation/priority-pass-nav/`
- `library/sections/hero/priority-pass-hero/`
- `library/sections/lounge/lounge-of-the-year/`
- etc.

Each section will then carry its own `section.json`, `motion.js`, and
`preview.png`, and be composable from the `mr-web-builder` UI.
