# MakeReign Monorepo

A pnpm/npm workspaces monorepo for the MakeReign web platform.

## Apps

### `apps/section-marketplace`
The MakeReign Section Library. A Next.js 15 app that:

- Stores reusable React/JSX sections in `library/sections/<category>/<slug>/`
- Stores full page templates in `library/templates/<slug>/`
- Generates a `library/index.json` manifest via `library/scripts/build-manifest.mjs`
- Renders a marketplace UI to browse and preview sections + templates
- Deploys to its own Vercel project

The existing **Excellence Awards** site is included as a template at `library/templates/excellence-awards/`.

### `apps/mr-web-builder`
The MakeReign Web Builder. A Next.js 15 app that provides the UI for:

- Browsing sections from the section library
- Composing pages by combining sections
- Editing design tokens, styling, and animations
- Deploys to its own Vercel project

## Shared Packages

### `packages/canonical-stack`
Motion runtime (GSAP, Lenis, ScrollTrigger) plus the `<Section>` primitive that every library section is built on.

### `packages/section-library-ui`
Shared UI chrome reused by the marketplace and the web builder (cards, nav, theme tokens).

## Tech Stack

- Next.js 15 (App Router) + React 19
- JavaScript / JSX (TypeScript may be adopted later, per-package)
- Tailwind CSS v4 with `@theme` design tokens (in new apps)
- GSAP for motion, Lenis for smooth scroll
- npm workspaces

## Workflows

```bash
npm install                  # install all workspace deps
npm run dev:marketplace      # run section-marketplace locally
npm run dev:builder          # run mr-web-builder locally
npm run build                # build all apps
npm run library:manifest     # regenerate library/index.json
```

## Section Library Growth

New section libraries are added in small reviewed batches. As we import real sections into `apps/section-marketplace/library/sections/`, we use the patterns, bugs, panel needs, animation needs, and export issues we discover to improve the downloadable `make-reign-section-builder.zip` rules and local builder experience.

The local builder is a living product, not a one-off export tool. When a batch of sections teaches us a better convention, validation rule, default panel shape, animation contract, asset rule, or QA step, update the source docs/code that generate the downloadable builder package before continuing with large-scale imports.

## Folder Layout

```
mr-monorepo/
├── apps/
│   ├── section-marketplace/
│   │   ├── app/                Next.js App Router
│   │   ├── library/            Source of truth for sections + templates
│   │   │   ├── sections/<category>/<slug>/
│   │   │   ├── templates/<slug>/
│   │   │   ├── schemas/
│   │   │   ├── scripts/
│   │   │   ├── previews/
│   │   │   └── index.json      generated
│   │   └── public/             static assets (incl. Webflow assets for templates)
│   └── mr-web-builder/
│       ├── app/
│       └── public/
├── packages/
│   ├── canonical-stack/
│   └── section-library-ui/
├── package.json                workspaces root
└── README.md
```

## Deployment

Each app deploys as a separate Vercel project. In each Vercel project, set the **Root Directory** to either `apps/section-marketplace` or `apps/mr-web-builder`.
