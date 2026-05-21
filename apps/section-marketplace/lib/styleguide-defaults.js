// Canonical shape for a MakeReign style guide.
// Stored as a single JSONB blob in style_guides.tokens.
//
// Conventions:
//   - Typography sizes are always in rem so they scale with the fluid html
//     font-size set by the "wizardry technique" (see styleguide-css.js).
//   - Spacing & radii hold a `desktop` value in em (scales with the fluid rem)
//     and a `mobile` value in rem (locked to the html font-size below the
//     tablet breakpoint).
//   - Colours: only the 3 primaries are stored. Opacity / lighten / darken
//     happen at the point of use via the builder UI.

export const DEFAULT_TOKENS = {
  name: "Default",

  wizardry: {
    container: { maxWidth: 1920 }, // px
    breakpoint: { tablet: 992 },   // px (the desktop -> tablet/mobile split)
    rem: {
      // vw font-size = (anchorRem / anchorViewport) * 100
      desktop: { anchorViewport: 1920, anchorRem: 16 },
      mobile:  { anchorViewport: 992,  anchorRem: 16 },
    },
  },

  colors: {
    light: "#ffffff",
    dark:  "#0a0b0d",
    brand: "#2c8a5a",
  },

  typography: {
    h1: {
      desktop: { family: "display", size: "6rem",   weight: 500, letterSpacing: "-0.02em",  lineHeight: 0.98 },
      mobile:  { family: "display", size: "3.25rem",weight: 500, letterSpacing: "-0.015em", lineHeight: 1.02 },
    },
    h2: {
      desktop: { family: "display", size: "4rem",   weight: 500, letterSpacing: "-0.015em", lineHeight: 1.02 },
      mobile:  { family: "display", size: "2.5rem", weight: 500, letterSpacing: "-0.01em",  lineHeight: 1.08 },
    },
    h3: {
      desktop: { family: "display", size: "2.75rem",weight: 500, letterSpacing: "-0.01em",  lineHeight: 1.08 },
      mobile:  { family: "display", size: "2rem",   weight: 500, letterSpacing: "-0.005em", lineHeight: 1.12 },
    },
    h4: {
      desktop: { family: "display", size: "2rem",   weight: 500, letterSpacing: "-0.005em", lineHeight: 1.15 },
      mobile:  { family: "display", size: "1.625rem",weight: 500, letterSpacing: "0em",     lineHeight: 1.2 },
    },
    h5: {
      desktop: { family: "display", size: "1.5rem", weight: 500, letterSpacing: "0em",      lineHeight: 1.2 },
      mobile:  { family: "display", size: "1.25rem",weight: 500, letterSpacing: "0em",      lineHeight: 1.25 },
    },
    h6: {
      desktop: { family: "display", size: "1.125rem",weight: 600, letterSpacing: "0em",     lineHeight: 1.3 },
      mobile:  { family: "display", size: "1rem",   weight: 600, letterSpacing: "0em",      lineHeight: 1.35 },
    },
    textLarge: {
      desktop: { family: "body", size: "1.25rem",  weight: 400, letterSpacing: "0em",      lineHeight: 1.5 },
      mobile:  { family: "body", size: "1.125rem", weight: 400, letterSpacing: "0em",      lineHeight: 1.5 },
    },
    textMain: {
      desktop: { family: "body", size: "1rem",     weight: 400, letterSpacing: "0em",      lineHeight: 1.55 },
      mobile:  { family: "body", size: "1rem",     weight: 400, letterSpacing: "0em",      lineHeight: 1.55 },
    },
    textSmall: {
      desktop: { family: "body", size: "0.875rem", weight: 400, letterSpacing: "0em",      lineHeight: 1.5 },
      mobile:  { family: "body", size: "0.875rem", weight: 400, letterSpacing: "0em",      lineHeight: 1.5 },
    },
  },

  // Reusable font stacks referenced by typography[*].desktop.family / .mobile.family
  fonts: {
    display: 'Lay Grotesk, "Inter Variable", Inter, system-ui, sans-serif',
    body:    '"Inter Variable", Inter, system-ui, sans-serif',
    mono:    '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },

  spacing: {
    sectionTopLarge: { desktop: "8em",   mobile: "4rem"   },
    sectionTopSmall: { desktop: "3em",   mobile: "2rem"   },
    sectionYLarge:   { desktop: "8em",   mobile: "4rem"   },
    sectionYSmall:   { desktop: "3em",   mobile: "2rem"   },
  },

  radii: {
    small:  { desktop: "0.375em", mobile: "0.375rem" },
    medium: { desktop: "0.75em",  mobile: "0.75rem"  },
    large:  { desktop: "1.5em",   mobile: "1.5rem"   },
  },

  card: {
    padding:    { desktop: "1.75em", mobile: "1.25rem" },
    radius:     "medium",          // → radii.medium
    background: "light",           // → colors.light
    foreground: "dark",            // → colors.dark
    border: {
      color:    "dark",
      width:    "1px",
      opacity:  0.08,
    },
    shadow:     "0 1px 2px rgba(0,0,0,0.04)",
  },

  button: {
    padding:     { desktop: "0.875em 1.5em", mobile: "0.875rem 1.5rem" },
    radius:      "small",
    background:  "dark",
    foreground:  "light",
    border: {
      color:     "dark",
      width:     "1px",
      opacity:   1,
    },
    hover: {
      background: "brand",
      foreground: "light",
    },
  },

  links: [
    // { name: "Privacy policy", url: "/privacy" }
  ],
};

// Lifted helpers used by both the form and the live preview.

export function resolveColor(tokens, key, { alpha = 1 } = {}) {
  const hex = tokens.colors?.[key] ?? key; // accept either a key or a raw value
  if (alpha >= 1) return hex;
  return colorWithAlpha(hex, alpha);
}

export function colorWithAlpha(hex, alpha) {
  // accept #rgb / #rrggbb
  let v = hex?.trim().replace("#", "");
  if (v?.length === 3) v = v.split("").map((c) => c + c).join("");
  if (!v || v.length !== 6) return hex;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Order used by all editors so headings, controls, and the preview stay in sync.
export const TYPOGRAPHY_SCALES = [
  ["h1", "Heading 1"],
  ["h2", "Heading 2"],
  ["h3", "Heading 3"],
  ["h4", "Heading 4"],
  ["h5", "Heading 5"],
  ["h6", "Heading 6"],
  ["textLarge", "Text large"],
  ["textMain",  "Text main"],
  ["textSmall", "Text small"],
];

export const SPACING_TOKENS = [
  ["sectionTopLarge", "Section top — large"],
  ["sectionTopSmall", "Section top — small"],
  ["sectionYLarge",   "Section y — large"],
  ["sectionYSmall",   "Section y — small"],
];

export const RADIUS_TOKENS = [
  ["small",  "Small"],
  ["medium", "Medium"],
  ["large",  "Large"],
];
