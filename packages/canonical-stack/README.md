# @mr/canonical-stack

The motion runtime and `<Section>` primitive every MakeReign library section
is built on.

## Exports (Phase 1 stubs)

```js
import { Section, registerSectionMotion } from "@mr/canonical-stack";
```

- `Section` — forwarded-ref wrapper that stamps `data-mr-section="<id>"`
  and applies per-instance token overrides.
- `registerSectionMotion` — placeholder for the GSAP/Lenis runtime.

Real implementation lands when we start porting sections.
