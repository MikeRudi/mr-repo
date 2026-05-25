// Canonical shape for a MakeReign style guide.
// Stored as a single JSONB blob in style_guides.tokens.
//
// All numeric inputs are in px. The generated CSS converts them:
//   - typography size: px → rem (px / BASE_REM_PX)
//   - spacing / radius / padding desktop: px → em
//   - spacing / radius / padding mobile:  px → rem
//   - border widths stay in px
//
// The "wizardry" technique runs on desktop only:
//   :root { font-size: (BASE_REM_PX / containerMaxWidth * 100)vw }
//   capped at BASE_REM_PX above containerMaxWidth.
// Below 991.98px the html font-size becomes a single static rem px value.

export const BASE_REM_PX = 16;
export const TABLET_BREAKPOINT = 992; // px — 991.98 and below = mobile

export const DEFAULT_TOKENS = {
  name: "Default",

  wizardry: {
    container: { maxWidth: 1920 }, // the only wizardry input shown to users
    mobileRemPx: 16,                // static html font-size below 992px
  },

  colors: {
    light: "#ffffff",
    dark:  "#0a0b0d",
    brand: "#2c8a5a",
  },

  // Three named font stacks — the only places typography references families.
  fonts: {
    primary:   '"Inter Variable", Inter, system-ui, sans-serif',
    secondary: '"Inter Variable", Inter, system-ui, sans-serif',
    tertiary:  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },

  // Each scale: per-breakpoint { family (primary|secondary|tertiary), size (px),
  // weight (number), letterSpacing (em as a number), lineHeight (unitless number) }.
  typography: {
    h1: {
      desktop: { family: "primary", size: 96,   weight: 600, letterSpacing: -0.02,  lineHeight: 0.98 },
      mobile:  { family: "primary", size: 52,   weight: 600, letterSpacing: -0.015, lineHeight: 1.02 },
    },
    h2: {
      desktop: { family: "primary", size: 64,   weight: 600, letterSpacing: -0.015, lineHeight: 1.02 },
      mobile:  { family: "primary", size: 40,   weight: 600, letterSpacing: -0.01,  lineHeight: 1.08 },
    },
    h3: {
      desktop: { family: "primary", size: 44,   weight: 600, letterSpacing: -0.01,  lineHeight: 1.08 },
      mobile:  { family: "primary", size: 32,   weight: 600, letterSpacing: -0.005, lineHeight: 1.12 },
    },
    h4: {
      desktop: { family: "primary", size: 32,   weight: 600, letterSpacing: -0.005, lineHeight: 1.15 },
      mobile:  { family: "primary", size: 26,   weight: 600, letterSpacing: 0,      lineHeight: 1.2 },
    },
    h5: {
      desktop: { family: "primary", size: 24,   weight: 600, letterSpacing: 0,      lineHeight: 1.2 },
      mobile:  { family: "primary", size: 20,   weight: 600, letterSpacing: 0,      lineHeight: 1.25 },
    },
    h6: {
      desktop: { family: "primary", size: 18,   weight: 600, letterSpacing: 0,      lineHeight: 1.3 },
      mobile:  { family: "primary", size: 16,   weight: 600, letterSpacing: 0,      lineHeight: 1.35 },
    },
    textLarge: {
      desktop: { family: "secondary", size: 20, weight: 400, letterSpacing: 0,      lineHeight: 1.5 },
      mobile:  { family: "secondary", size: 18, weight: 400, letterSpacing: 0,      lineHeight: 1.5 },
    },
    textMain: {
      desktop: { family: "secondary", size: 16, weight: 400, letterSpacing: 0,      lineHeight: 1.55 },
      mobile:  { family: "secondary", size: 16, weight: 400, letterSpacing: 0,      lineHeight: 1.55 },
    },
    textSmall: {
      desktop: { family: "secondary", size: 16, weight: 400, letterSpacing: 0,      lineHeight: 1.5 },
      mobile:  { family: "secondary", size: 16, weight: 400, letterSpacing: 0,      lineHeight: 1.5 },
    },
  },

  // All numeric (px). Desktop renders as em in the published CSS, mobile as rem.
  spacing: {
    sitePadding:     { desktop: 32,  mobile: 24 },
    sectionTopLarge: { desktop: 128, mobile: 64 },
    sectionTopSmall: { desktop: 48,  mobile: 32 },
    sectionYLarge:   { desktop: 128, mobile: 64 },
    sectionYSmall:   { desktop: 48,  mobile: 32 },
  },

  radii: {
    small:  { desktop: 6,  mobile: 6  },
    medium: { desktop: 12, mobile: 12 },
    large:  { desktop: 24, mobile: 24 },
  },

  // Two card variants out of the box, filterable in the editor.
  cards: [
    {
      id: "default",
      name: "Default",
      padding:    { desktop: 28, mobile: 20 },
      radius:     "medium",
      background: "light",
      foreground: "dark",
      border: { color: "dark", width: 1, opacity: 0.08 },
    },
    {
      id: "feature",
      name: "Feature",
      padding:    { desktop: 40, mobile: 28 },
      radius:     "large",
      background: "dark",
      foreground: "light",
      border: { color: "dark", width: 0, opacity: 0 },
    },
  ],

  // Three button variants out of the box, filterable in the editor.
  buttons: [
    {
      id: "primary",
      name: "Primary",
      padding:    { desktop: 16, mobile: 14 },
      paddingX:   { desktop: 28, mobile: 24 },
      radius:     "small",
      background: "dark",
      foreground: "light",
      border:     { color: "dark", width: 1, opacity: 1 },
      hover:      { background: "brand", foreground: "light" },
    },
    {
      id: "secondary",
      name: "Secondary",
      padding:    { desktop: 16, mobile: 14 },
      paddingX:   { desktop: 28, mobile: 24 },
      radius:     "small",
      background: "light",
      foreground: "dark",
      border:     { color: "dark", width: 1, opacity: 1 },
      hover:      { background: "dark", foreground: "light" },
    },
    {
      id: "ghost",
      name: "Ghost",
      padding:    { desktop: 14, mobile: 12 },
      paddingX:   { desktop: 20, mobile: 16 },
      radius:     "small",
      background: "transparent",
      foreground: "dark",
      border:     { color: "dark", width: 0, opacity: 0 },
      hover:      { background: "dark", foreground: "light" },
    },
  ],

  links: [],
};

// Detect rows saved before the px-numeric / cards[] / buttons[] shape and
// safely fall back to defaults. Old rows lose their saved values (a one-time
// reset) but keep working without breaking the editor.
export function normalizeTokens(loaded) {
  if (!loaded || typeof loaded !== "object") return DEFAULT_TOKENS;
  const isNewShape =
    Array.isArray(loaded.cards) &&
    Array.isArray(loaded.buttons) &&
    typeof loaded?.typography?.h1?.desktop?.size === "number" &&
    typeof loaded?.spacing?.sectionTopLarge?.desktop === "number";
  if (!isNewShape) return DEFAULT_TOKENS;
  return mergeDeep(DEFAULT_TOKENS, loaded);
}

function mergeDeep(base, override) {
  if (Array.isArray(override)) return override;
  if (override == null) return base;
  if (typeof override !== "object" || typeof base !== "object") return override;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    out[k] = mergeDeep(base?.[k], override[k]);
  }
  return out;
}

export function colorWithAlpha(hex, alpha) {
  let v = hex?.trim().replace("#", "");
  if (v?.length === 3) v = v.split("").map((c) => c + c).join("");
  if (!v || v.length !== 6) return hex;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  if (alpha >= 1) return `#${v}`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const TYPOGRAPHY_SCALES = [
  ["h1", "H1"],
  ["h2", "H2"],
  ["h3", "H3"],
  ["h4", "H4"],
  ["h5", "H5"],
  ["h6", "H6"],
  ["textLarge", "Text large"],
  ["textMain",  "Text main"],
  ["textSmall", "Text small"],
];

export const SPACING_TOKENS = [
  ["sitePadding",     "Site padding"],
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

// Helpers used by the CSS generator + previews to keep conversions consistent.
export const px = {
  toRem: (n) => `${round(n / BASE_REM_PX)}rem`,
  toEm:  (n) => `${round(n / BASE_REM_PX)}em`,
};

function round(n) {
  if (!Number.isFinite(n)) return 0;
  // Trim long decimals
  return Math.round(n * 1e4) / 1e4;
}

/**
 * Generate a styleguide button class name from a variant id.
 * Primary maps to `.sg-button`; everything else gets the suffix.
 */
export function buttonClass(variant = "primary") {
  return variant === "primary" ? "sg-button" : `sg-button-${variant}`;
}
