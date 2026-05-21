import seed from "../library/templates-seed.json";

const TEMPLATES = Object.freeze(seed.templates.slice());

export function getAllTemplates() {
  return TEMPLATES;
}

export function getTemplateBySlug(slug) {
  return TEMPLATES.find((t) => t.slug === slug) ?? null;
}
