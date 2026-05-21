// Motion runtime — placeholder.
//
// In later phases this module owns:
//   - A Lenis singleton wired to the GSAP ticker
//   - ScrollTrigger registration
//   - A `registerSectionMotion({ id, scope, build })` helper so each
//     library section ships its motion as a pure function and the
//     runtime decides when to mount it.
//
// For now we export a tiny stub so the API exists.

export function registerSectionMotion(_config) {
  // no-op until the runtime lands
  return () => {};
}

export const MOTION_RUNTIME_VERSION = "0.1.0";
