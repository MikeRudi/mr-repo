// Generate the CSS string that realises a style guide's tokens in the browser.
// Used by:
//   - the live preview panel on /styleguide
//   - (later) the builder canvas + published sites

import { colorWithAlpha } from "./styleguide-defaults.js";

/**
 * Produces a self-contained CSS block scoped to a given selector.
 * Default scope is :root, which is what published sites will use.
 *
 * For the in-page styleguide preview, pass a class selector AND set
 * { scoped: true }. That makes the scope element act as a mini-root by
 * rewriting `rem` → `em` and pinning the scope's font-size to the desktop
 * anchor rem. Media queries still respond to the real viewport, so resizing
 * the browser shows true mobile behaviour.
 */
export function generateCss(tokens, scope = ":root", { scoped = false } = {}) {
  const out = build(tokens, scope);
  if (!scoped) return out;
  // Rewrite all "Nrem" to "Nem" so values scale with the scope's font-size
  // rather than the host page's :root font-size.
  return out.replace(/(\d*\.?\d+)rem\b/g, "$1em");
}

function build(tokens, scope) {
  const w = tokens.wizardry ?? {};
  const rem = w.rem ?? { desktop: {}, mobile: {} };
  const tabletBp = w.breakpoint?.tablet ?? 992;
  const maxWidth = w.container?.maxWidth ?? 1920;

  const desktopVw = remVwFormula(rem.desktop?.anchorRem, rem.desktop?.anchorViewport);
  const mobileVw  = remVwFormula(rem.mobile?.anchorRem,  rem.mobile?.anchorViewport);

  const desktopMaxPx = (rem.desktop?.anchorRem ?? 16);

  const colors = tokens.colors ?? {};
  const radii  = tokens.radii  ?? {};
  const space  = tokens.spacing ?? {};
  const fonts  = tokens.fonts  ?? {};
  const card   = tokens.card   ?? {};
  const button = tokens.button ?? {};

  const lines = [];

  // -- Root tokens (desktop)
  lines.push(`${scope} {`);
  // Wizardry rem (fluid by default)
  lines.push(`  font-size: ${desktopVw};`);
  // Colours
  for (const [k, v] of Object.entries(colors)) {
    lines.push(`  --sg-color-${k}: ${v};`);
  }
  // Font stacks
  for (const [k, v] of Object.entries(fonts)) {
    lines.push(`  --sg-font-${k}: ${v};`);
  }
  // Radii (desktop em values)
  for (const [k, v] of Object.entries(radii)) {
    lines.push(`  --sg-radius-${k}: ${v.desktop};`);
  }
  // Spacing (desktop em values)
  for (const [k, v] of Object.entries(space)) {
    lines.push(`  --sg-space-${k}: ${v.desktop};`);
  }
  // Card composite
  if (card.padding) {
    lines.push(`  --sg-card-padding: ${card.padding.desktop};`);
    lines.push(`  --sg-card-radius: var(--sg-radius-${card.radius ?? "medium"});`);
    lines.push(`  --sg-card-background: var(--sg-color-${card.background ?? "light"});`);
    lines.push(`  --sg-card-foreground: var(--sg-color-${card.foreground ?? "dark"});`);
    lines.push(`  --sg-card-border-color: ${
      colorWithAlpha(colors[card.border?.color] ?? "#000", card.border?.opacity ?? 0.08)
    };`);
    lines.push(`  --sg-card-border-width: ${card.border?.width ?? "1px"};`);
    lines.push(`  --sg-card-shadow: ${card.shadow ?? "none"};`);
  }
  // Button composite
  if (button.padding) {
    lines.push(`  --sg-button-padding: ${button.padding.desktop};`);
    lines.push(`  --sg-button-radius: var(--sg-radius-${button.radius ?? "small"});`);
    lines.push(`  --sg-button-background: var(--sg-color-${button.background ?? "dark"});`);
    lines.push(`  --sg-button-foreground: var(--sg-color-${button.foreground ?? "light"});`);
    lines.push(`  --sg-button-border-color: ${
      colorWithAlpha(colors[button.border?.color] ?? "#000", button.border?.opacity ?? 1)
    };`);
    lines.push(`  --sg-button-border-width: ${button.border?.width ?? "1px"};`);
    lines.push(`  --sg-button-hover-background: var(--sg-color-${button.hover?.background ?? "brand"});`);
    lines.push(`  --sg-button-hover-foreground: var(--sg-color-${button.hover?.foreground ?? "light"});`);
  }
  lines.push(`}`);

  // -- Cap the wizardry rem at the desktop anchor so it stops growing past max
  if (rem.desktop?.anchorViewport) {
    lines.push(`@media (min-width: ${rem.desktop.anchorViewport}px) {`);
    lines.push(`  ${scope} { font-size: ${desktopMaxPx}px; }`);
    lines.push(`}`);
  }

  // -- Mobile / tablet-down overrides
  lines.push(`@media (max-width: ${tabletBp - 0.02}px) {`);
  lines.push(`  ${scope} {`);
  lines.push(`    font-size: ${mobileVw};`);
  for (const [k, v] of Object.entries(radii)) {
    lines.push(`    --sg-radius-${k}: ${v.mobile};`);
  }
  for (const [k, v] of Object.entries(space)) {
    lines.push(`    --sg-space-${k}: ${v.mobile};`);
  }
  if (card.padding) lines.push(`    --sg-card-padding: ${card.padding.mobile};`);
  if (button.padding) lines.push(`    --sg-button-padding: ${button.padding.mobile};`);
  lines.push(`  }`);
  lines.push(`}`);

  // -- Typography (desktop scales)
  const typ = tokens.typography ?? {};
  for (const [key, scale] of Object.entries(typ)) {
    const cls = typographySelector(scope, key);
    const d = scale.desktop ?? {};
    lines.push(`${cls} {`);
    lines.push(`  font-family: ${fontFamilyRef(fonts, d.family)};`);
    lines.push(`  font-size: ${d.size ?? "1rem"};`);
    lines.push(`  font-weight: ${d.weight ?? 400};`);
    lines.push(`  letter-spacing: ${d.letterSpacing ?? "0em"};`);
    lines.push(`  line-height: ${d.lineHeight ?? 1.5};`);
    lines.push(`}`);
  }

  // -- Typography (mobile overrides)
  lines.push(`@media (max-width: ${tabletBp - 0.02}px) {`);
  for (const [key, scale] of Object.entries(typ)) {
    const cls = typographySelector(scope, key);
    const m = scale.mobile ?? {};
    lines.push(`  ${cls} {`);
    if (m.family) lines.push(`    font-family: ${fontFamilyRef(fonts, m.family)};`);
    if (m.size) lines.push(`    font-size: ${m.size};`);
    if (m.weight != null) lines.push(`    font-weight: ${m.weight};`);
    if (m.letterSpacing) lines.push(`    letter-spacing: ${m.letterSpacing};`);
    if (m.lineHeight != null) lines.push(`    line-height: ${m.lineHeight};`);
    lines.push(`  }`);
  }
  lines.push(`}`);

  // -- Container width
  lines.push(`${scope} .sg-container {`);
  lines.push(`  max-width: ${maxWidth}px;`);
  lines.push(`  margin-inline: auto;`);
  lines.push(`}`);

  // -- Card + Button base classes (consumable by the rest of the app)
  lines.push(`${scope} .sg-card {`);
  lines.push(`  background: var(--sg-card-background);`);
  lines.push(`  color: var(--sg-card-foreground);`);
  lines.push(`  border-radius: var(--sg-card-radius);`);
  lines.push(`  border: var(--sg-card-border-width) solid var(--sg-card-border-color);`);
  lines.push(`  padding: var(--sg-card-padding);`);
  lines.push(`  box-shadow: var(--sg-card-shadow);`);
  lines.push(`}`);

  lines.push(`${scope} .sg-button {`);
  lines.push(`  display: inline-flex;`);
  lines.push(`  align-items: center;`);
  lines.push(`  justify-content: center;`);
  lines.push(`  background: var(--sg-button-background);`);
  lines.push(`  color: var(--sg-button-foreground);`);
  lines.push(`  border-radius: var(--sg-button-radius);`);
  lines.push(`  border: var(--sg-button-border-width) solid var(--sg-button-border-color);`);
  lines.push(`  padding: var(--sg-button-padding);`);
  lines.push(`  font-family: var(--sg-font-body);`);
  lines.push(`  font-size: 0.875rem;`);
  lines.push(`  cursor: pointer;`);
  lines.push(`  transition: background 160ms ease, color 160ms ease;`);
  lines.push(`}`);
  lines.push(`${scope} .sg-button:hover {`);
  lines.push(`  background: var(--sg-button-hover-background);`);
  lines.push(`  color: var(--sg-button-hover-foreground);`);
  lines.push(`}`);

  return lines.join("\n");
}

function remVwFormula(anchorRem, anchorViewport) {
  if (!anchorRem || !anchorViewport) return "16px";
  const vw = (Number(anchorRem) / Number(anchorViewport)) * 100;
  // 6 decimals is overkill in practice but it's free
  return `${Number(vw.toFixed(6))}vw`;
}

function fontFamilyRef(fonts, ref) {
  if (!ref) return "var(--sg-font-body)";
  if (fonts[ref]) return `var(--sg-font-${ref})`;
  return ref; // raw font stack string
}

function typographySelector(scope, key) {
  // Honour both real elements (h1) and utility classes (.sg-text-main)
  const map = {
    h1: "h1, .sg-h1",
    h2: "h2, .sg-h2",
    h3: "h3, .sg-h3",
    h4: "h4, .sg-h4",
    h5: "h5, .sg-h5",
    h6: "h6, .sg-h6",
    textLarge: ".sg-text-large",
    textMain:  ".sg-text-main, p",
    textSmall: ".sg-text-small",
  };
  const target = map[key] ?? `.sg-${key}`;
  // Add scope prefix to every selector in the comma list
  return target
    .split(",")
    .map((s) => `${scope} ${s.trim()}`)
    .join(", ");
}
