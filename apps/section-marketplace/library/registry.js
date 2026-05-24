// Registry of section components by id.
// Detail / preview routes use this map to resolve the React component to render.
// Sections not present here render as nothing (defensive — saved sites may
// reference section IDs that no longer exist in the library).

import AutoAccordion from "./sections/accordion/auto-accordion/Section.jsx";

const REGISTRY = {
  "auto-accordion": AutoAccordion,
};

export function getSectionComponent(id) {
  return REGISTRY[id] ?? null;
}

export function hasImplementation(id) {
  return Boolean(REGISTRY[id]);
}

export function listImplemented() {
  return Object.keys(REGISTRY);
}
