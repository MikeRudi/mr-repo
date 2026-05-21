// @mr/canonical-stack
//
// The canonical motion runtime and Section primitive used by every
// MakeReign library section.
//
// Phase 1 (current): exports are placeholders. We re-export from here
// so consumers can already write `import { Section } from "@mr/canonical-stack"`
// and we can fill in the implementation behind the same API.

export { default as Section } from "./Section.jsx";
export * from "./motion/index.js";
