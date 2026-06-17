// Registry of section components by id.
// Detail / preview routes use this map to resolve the React component to render.
// Sections not present here render as nothing (defensive — saved sites may
// reference section IDs that no longer exist in the library).

import AutoAccordion from "./sections/accordion/auto-accordion/Section.jsx";
import MadeWithGsap000 from "./sections/gallery/made-with-gsap-000/Section.jsx";
import MadeWithGsap001 from "./sections/gallery/made-with-gsap-001/Section.jsx";
import MadeWithGsap002 from "./sections/gallery/made-with-gsap-002/Section.jsx";
import MadeWithGsap003 from "./sections/gallery/made-with-gsap-003/Section.jsx";
import MadeWithGsap004 from "./sections/gallery/made-with-gsap-004/Section.jsx";
import KlarheitTestimonial05 from "./sections/testimonials/klarheit-testimonial-05/Section.jsx";

const REGISTRY = {
  "auto-accordion": AutoAccordion,
  "made-with-gsap-000": MadeWithGsap000,
  "made-with-gsap-001": MadeWithGsap001,
  "made-with-gsap-002": MadeWithGsap002,
  "made-with-gsap-003": MadeWithGsap003,
  "made-with-gsap-004": MadeWithGsap004,
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
