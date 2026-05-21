# Library

Source of truth for everything the MakeReign Section Marketplace exposes.

```
library/
├── sections/<category>/<slug>/   Individual reusable sections
│   ├── section.json
│   ├── index.jsx
│   ├── motion.js                  optional
│   ├── styles.css                 optional
│   ├── preview.png                optional
│   └── README.md
├── templates/<slug>/             Full-page templates
│   ├── template.json
│   ├── index.jsx
│   └── README.md
├── schemas/                      JSON schemas
├── scripts/build-manifest.mjs    Walks the library and writes index.json
├── previews/                     Shared preview assets (rare)
└── index.json                    Generated. Do not edit by hand.
```

Run `npm run library:manifest` (from the marketplace app, or `npm run library:manifest` at the repo root) to regenerate `index.json`.

## V1 categories

`hero · intro · carousel · testimonials · gallery · features · forms · cta · footer · navigation`

These match the canonical section-identity scheme. Templates ("pages") live in `templates/` and may compose any number of sections.
