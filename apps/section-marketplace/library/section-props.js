// Metadata describing editable fields for each section type.
// The builder inspector uses this map to render the correct form fields.
//
// Field types:
//   text        — single-line text input
//   textarea    — multi-line text area
//   number      — numeric input
//   cta         — { label, href } pair rendered as two side-by-side inputs
//   link        — single { label, href } pair
//   array-text  — list of strings (add/remove rows)
//   array-object — list of objects with key fields (add/remove rows)

export const SECTION_PROP_SCHEMAS = {
  "hero-split-bold": {
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "headline", type: "textarea", label: "Headline" },
      { key: "lede", type: "textarea", label: "Lede / body" },
      { key: "primaryCta", type: "cta", label: "Primary CTA" },
      { key: "secondaryCta", type: "cta", label: "Secondary CTA" },
    ],
  },
  "intro-eyebrow-statement": {
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "statement", type: "textarea", label: "Statement" },
    ],
  },
  "cta-band": {
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "headline", type: "textarea", label: "Headline" },
      { key: "body", type: "textarea", label: "Body" },
      { key: "primaryCta", type: "cta", label: "Primary CTA" },
      { key: "secondaryCta", type: "cta", label: "Secondary CTA" },
    ],
  },
  "form-contact-split": {
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "heading", type: "textarea", label: "Heading" },
      {
        key: "reasons",
        type: "array-text",
        label: "Reasons list",
        hint: "One reason per row. These appear as bullet points beside the form.",
      },
    ],
  },
  "testimonials-grid": {
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "heading", type: "textarea", label: "Heading" },
      {
        key: "items",
        type: "array-object",
        label: "Testimonials",
        objectFields: [
          { key: "quote", type: "textarea", label: "Quote" },
          { key: "author", type: "text", label: "Author" },
          { key: "role", type: "text", label: "Role / company" },
        ],
        hint: "Each row becomes a card in the grid.",
      },
    ],
  },
  "carousel-quote": {
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      {
        key: "items",
        type: "array-object",
        label: "Quotes",
        objectFields: [
          { key: "quote", type: "textarea", label: "Quote" },
          { key: "author", type: "text", label: "Author" },
          { key: "role", type: "text", label: "Role / company" },
        ],
      },
      { key: "intervalMs", type: "number", label: "Interval (ms)", min: 1000, step: 500 },
    ],
  },
  "features-marquee": {
    fields: [
      {
        key: "items",
        type: "array-text",
        label: "Marquee items",
        hint: "These scroll horizontally across the band.",
      },
      { key: "speed", type: "number", label: "Speed (seconds)", min: 5, step: 5 },
      { key: "separator", type: "text", label: "Separator" },
    ],
  },
  "gallery-parallax-columns": {
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "heading", type: "textarea", label: "Heading" },
    ],
  },
  "navigation-floating-bar": {
    fields: [
      { key: "brand", type: "text", label: "Brand name" },
      {
        key: "links",
        type: "array-object",
        label: "Nav links",
        objectFields: [
          { key: "label", type: "text", label: "Label" },
          { key: "href", type: "text", label: "Href" },
        ],
      },
      { key: "cta", type: "cta", label: "CTA button" },
    ],
  },
  "footer-minimal": {
    fields: [
      { key: "brand", type: "text", label: "Brand name" },
      { key: "statement", type: "textarea", label: "Statement" },
      {
        key: "groups",
        type: "array-object",
        label: "Link groups",
        objectFields: [
          { key: "label", type: "text", label: "Group label" },
          {
            key: "links",
            type: "array-object",
            label: "Links",
            objectFields: [
              { key: "label", type: "text", label: "Label" },
              { key: "href", type: "text", label: "Href" },
            ],
          },
        ],
      },
      { key: "legal", type: "text", label: "Legal line" },
    ],
  },
};

export function getSchema(sectionId) {
  return SECTION_PROP_SCHEMAS[sectionId] ?? null;
}
