# @mr/web-builder

The MakeReign Web Builder. Visual environment for composing pages from the
MakeReign Section Library.

## Run locally

```bash
npm run dev:builder     # from the monorepo root
# or
npm --workspace apps/mr-web-builder run dev
```

Runs on `http://localhost:3001` so it doesn't collide with the marketplace
on `3000`.

## Status

Scaffold only. Imports `@mr/canonical-stack` and `@mr/section-library-ui`
so we can flesh out the library browser, canvas, and inspector incrementally.
