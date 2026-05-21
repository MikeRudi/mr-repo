// Registry of section components by id.
// Detail / preview routes use this map to resolve the React component to render.
// Sections not present here render as a "Coming soon" placeholder.

import HeroSplitBold from "./sections/hero-split-bold/Section.jsx";
import IntroEyebrowStatement from "./sections/intro-eyebrow-statement/Section.jsx";
import CarouselQuote from "./sections/carousel-quote/Section.jsx";
import TestimonialsGrid from "./sections/testimonials-grid/Section.jsx";
import GalleryParallaxColumns from "./sections/gallery-parallax-columns/Section.jsx";
import FeaturesMarquee from "./sections/features-marquee/Section.jsx";
import FormContactSplit from "./sections/form-contact-split/Section.jsx";
import CtaBand from "./sections/cta-band/Section.jsx";
import FooterMinimal from "./sections/footer-minimal/Section.jsx";
import NavigationFloatingBar from "./sections/navigation-floating-bar/Section.jsx";

const REGISTRY = {
  "hero-split-bold": HeroSplitBold,
  "intro-eyebrow-statement": IntroEyebrowStatement,
  "carousel-quote": CarouselQuote,
  "testimonials-grid": TestimonialsGrid,
  "gallery-parallax-columns": GalleryParallaxColumns,
  "features-marquee": FeaturesMarquee,
  "form-contact-split": FormContactSplit,
  "cta-band": CtaBand,
  "footer-minimal": FooterMinimal,
  "navigation-floating-bar": NavigationFloatingBar,
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
