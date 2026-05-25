// Generate the CSS string that realises a style guide's tokens in the browser.
//
// Conventions:
//   - All numeric inputs in tokens.* are in px.
//   - Desktop spacing / radius / padding → em (px / BASE_REM_PX).
//   - Mobile spacing / radius / padding → rem (px / BASE_REM_PX).
//   - Typography size → rem (px / BASE_REM_PX) on both breakpoints.
//   - Wizardry: :root font-size = fluid vw on desktop, static px below tablet.

import {
  BASE_REM_PX,
  TABLET_BREAKPOINT,
  colorWithAlpha,
  px,
} from "./styleguide-defaults.js";

const MOBILE_QUERY = `@media (max-width: ${TABLET_BREAKPOINT - 0.02}px)`;

/**
 * @param tokens The style guide tokens.
 * @param scope  Selector (default :root). For the in-page preview pass a class
 *               selector AND set { scoped: true } so rem→em is rewritten.
 */
export function generateCss(tokens, scope = ":root", { scoped = false } = {}) {
  const out = build(tokens, scope);
  if (!scoped) return out;
  return out.replace(/(\d*\.?\d+)rem\b/g, "$1em");
}

function build(tokens, scope) {
  const maxWidth   = tokens.wizardry?.container?.maxWidth ?? 1920;
  const mobileRem  = tokens.wizardry?.mobileRemPx ?? BASE_REM_PX;
  const desktopVw  = vwFromPxAtMax(BASE_REM_PX, maxWidth);

  const colors  = tokens.colors  ?? {};
  const fonts   = tokens.fonts   ?? {};
  const radii   = tokens.radii   ?? {};
  const space   = tokens.spacing ?? {};
  const cards   = tokens.cards   ?? [];
  const buttons = tokens.buttons ?? [];

  const lines = [];

  // -- Root
  lines.push(`${scope} {`);
  lines.push(`  font-size: ${desktopVw};`);
  for (const [k, v] of Object.entries(colors)) {
    lines.push(`  --sg-color-${k}: ${v};`);
  }
  for (const [k, v] of Object.entries(fonts)) {
    lines.push(`  --sg-font-${k}: ${v};`);
  }
  for (const [k, v] of Object.entries(radii)) {
    lines.push(`  --sg-radius-${k}: ${px.toEm(v.desktop)};`);
  }
  for (const [k, v] of Object.entries(space)) {
    lines.push(`  --sg-space-${k}: ${px.toEm(v.desktop)};`);
  }
  lines.push(`}`);

  // Cap fluid rem at the desktop anchor so it stops growing past max
  lines.push(`@media (min-width: ${maxWidth}px) {`);
  lines.push(`  ${scope} { font-size: ${BASE_REM_PX}px; }`);
  lines.push(`}`);

  // Mobile static rem + token overrides
  lines.push(`${MOBILE_QUERY} {`);
  lines.push(`  ${scope} {`);
  lines.push(`    font-size: ${mobileRem}px;`);
  for (const [k, v] of Object.entries(radii)) {
    lines.push(`    --sg-radius-${k}: ${px.toRem(v.mobile)};`);
  }
  for (const [k, v] of Object.entries(space)) {
    lines.push(`    --sg-space-${k}: ${px.toRem(v.mobile)};`);
  }
  lines.push(`  }`);
  lines.push(`}`);

  // -- Typography
  const typ = tokens.typography ?? {};
  for (const [key, scale] of Object.entries(typ)) {
    const sel = typographySelector(scope, key);
    const d = scale.desktop ?? {};
    lines.push(`${sel} {`);
    lines.push(`  font-family: var(--sg-font-${d.family ?? "primary"});`);
    lines.push(`  font-size: ${px.toRem(d.size ?? BASE_REM_PX)};`);
    lines.push(`  font-weight: ${d.weight ?? 400};`);
    lines.push(`  letter-spacing: ${asEm(d.letterSpacing)};`);
    lines.push(`  line-height: ${d.lineHeight ?? 1.5};`);
    lines.push(`  margin: 0;`);
    lines.push(`}`);
  }
  lines.push(`${MOBILE_QUERY} {`);
  for (const [key, scale] of Object.entries(typ)) {
    const sel = typographySelector(scope, key);
    const m = scale.mobile ?? {};
    lines.push(`  ${sel} {`);
    if (m.family) lines.push(`    font-family: var(--sg-font-${m.family});`);
    if (m.size != null) lines.push(`    font-size: ${px.toRem(m.size)};`);
    if (m.weight != null) lines.push(`    font-weight: ${m.weight};`);
    if (m.letterSpacing != null) lines.push(`    letter-spacing: ${asEm(m.letterSpacing)};`);
    if (m.lineHeight != null) lines.push(`    line-height: ${m.lineHeight};`);
    lines.push(`  }`);
  }
  lines.push(`}`);

  // -- Container
  lines.push(`${scope} .sg-container {`);
  lines.push(`  max-width: ${maxWidth}px;`);
  lines.push(`  margin-inline: auto;`);
  lines.push(`}`);

  // -- Cards (one rule per variant)
  for (const card of cards) {
    const cls = `.sg-card${card.id === "default" ? "" : `-${card.id}`}`;
    const bg = colorRef(colors, card.background);
    const fg = colorRef(colors, card.foreground);
    const borderColor = card.border?.color
      ? colorWithAlpha(colors[card.border.color] ?? "#000000", card.border?.opacity ?? 1)
      : "transparent";
    lines.push(`${scope} ${cls} {`);
    lines.push(`  background: ${bg};`);
    lines.push(`  color: ${fg};`);
    lines.push(`  border-radius: var(--sg-radius-${card.radius ?? "medium"});`);
    lines.push(`  border: ${card.border?.width ?? 0}px solid ${borderColor};`);
    lines.push(`  padding: ${px.toEm(card.padding?.desktop ?? 0)};`);
    lines.push(`}`);
    lines.push(`${MOBILE_QUERY} {`);
    lines.push(`  ${scope} ${cls} {`);
    lines.push(`    padding: ${px.toRem(card.padding?.mobile ?? 0)};`);
    lines.push(`  }`);
    lines.push(`}`);
  }

  // -- Buttons (one rule per variant + hover)
  for (const btn of buttons) {
    const cls = `.sg-button${btn.id === "primary" ? "" : `-${btn.id}`}`;
    const bg = colorRef(colors, btn.background);
    const fg = colorRef(colors, btn.foreground);
    const borderColor = btn.border?.color
      ? colorWithAlpha(colors[btn.border.color] ?? "#000000", btn.border?.opacity ?? 1)
      : "transparent";
    const hoverBg = colorRef(colors, btn.hover?.background);
    const hoverFg = colorRef(colors, btn.hover?.foreground);
    lines.push(`${scope} ${cls} {`);
    lines.push(`  display: inline-flex;`);
    lines.push(`  align-items: center;`);
    lines.push(`  justify-content: center;`);
    lines.push(`  background: ${bg};`);
    lines.push(`  color: ${fg};`);
    lines.push(`  border-radius: var(--sg-radius-${btn.radius ?? "small"});`);
    lines.push(`  border: ${btn.border?.width ?? 0}px solid ${borderColor};`);
    lines.push(`  padding: ${px.toEm(btn.padding?.desktop ?? 0)} ${px.toEm(btn.paddingX?.desktop ?? 0)};`);
    lines.push(`  font-family: var(--sg-font-secondary);`);
    lines.push(`  font-size: ${px.toRem(16)};`);
    lines.push(`  cursor: pointer;`);
    lines.push(`  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;`);
    lines.push(`}`);
    lines.push(`${scope} ${cls}:hover {`);
    lines.push(`  background: ${hoverBg};`);
    lines.push(`  color: ${hoverFg};`);
    lines.push(`}`);
    lines.push(`${MOBILE_QUERY} {`);
    lines.push(`  ${scope} ${cls} {`);
    lines.push(`    padding: ${px.toRem(btn.padding?.mobile ?? 0)} ${px.toRem(btn.paddingX?.mobile ?? 0)};`);
    lines.push(`  }`);
    lines.push(`}`);
  }

  return lines.join("\n");
}

function vwFromPxAtMax(targetPx, maxViewport) {
  if (!targetPx || !maxViewport) return `${targetPx ?? BASE_REM_PX}px`;
  const vw = (Number(targetPx) / Number(maxViewport)) * 100;
  return `${Number(vw.toFixed(6))}vw`;
}

function colorRef(colors, key) {
  if (!key) return "transparent";
  if (key === "transparent") return "transparent";
  if (colors[key]) return `var(--sg-color-${key})`;
  return key; // raw value fallback
}

function asEm(n) {
  if (n == null) return "0em";
  if (typeof n === "string") return n;
  return `${Number(n)}em`;
}

function typographySelector(scope, key) {
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
  return target
    .split(",")
    .map((s) => `${scope} ${s.trim()}`)
    .join(", ");
}
