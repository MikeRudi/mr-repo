// Registry of section components by id.
// Detail / preview routes use this map to resolve the React component to render.
// Sections not present here render as nothing (defensive — saved sites may
// reference section IDs that no longer exist in the library).

import AutoAccordion from "./sections/accordion/auto-accordion/Section.jsx";
import KlarheitTestimonial05 from "./sections/testimonials/klarheit-testimonial-05/Section.jsx";

const REGISTRY = {
  "auto-accordion": AutoAccordion,
  "klarheit-testimonial-05": KlarheitTestimonial05,
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
