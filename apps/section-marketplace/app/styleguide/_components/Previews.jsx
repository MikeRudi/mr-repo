"use client";

import {
  TYPOGRAPHY_SCALES,
  SPACING_TOKENS,
  RADIUS_TOKENS,
  BASE_REM_PX,
  TABLET_BREAKPOINT,
  colorWithAlpha,
} from "../../../lib/styleguide-defaults.js";

const PANGRAM = "Bright vixens jump; dozy fowl quack.";

export function WizardryPreview({ tokens }) {
  const max = tokens.wizardry?.container?.maxWidth ?? 1920;
  const mobileRem = tokens.wizardry?.mobileRemPx ?? BASE_REM_PX;
  const vw = ((BASE_REM_PX / max) * 100).toFixed(4);
  return (
    <div className="flex flex-col gap-4">
      <Caption>Generated declarations</Caption>
      <Code>
        {[
          `:root { font-size: ${vw}vw; }`,
          `@media (min-width: ${max}px) {`,
          `  :root { font-size: ${BASE_REM_PX}px; }`,
          `}`,
          `@media (max-width: ${TABLET_BREAKPOINT - 0.02}px) {`,
          `  :root { font-size: ${mobileRem}px; }`,
          `}`,
          ``,
          `.sg-container { max-width: ${max}px; }`,
        ].join("\n")}
      </Code>
      <Caption>Container demo</Caption>
      <div className="relative h-16 rounded-md bg-[var(--chrome-ground)] border border-[var(--chrome-border)] overflow-hidden">
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-[var(--chrome-fg)]/10 border-x border-[var(--chrome-border-strong)] flex items-center justify-center text-[10px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-muted)]"
          style={{ width: `min(100%, ${Math.min(max / 4, 480)}px)` }}
        >
          {max}px max
        </div>
      </div>
    </div>
  );
}

export function ColorsPreview({ tokens }) {
  const c = tokens.colors ?? {};
  const entries = Object.entries(c);
  const ALPHAS = [1, 0.7, 0.4, 0.15, 0.06];

  return (
    <div className="flex flex-col gap-5">
      <Caption>Palette ({entries.length})</Caption>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entries.map(([key, hex]) => (
          <div
            key={key}
            className="rounded-[10px] overflow-hidden border border-[var(--chrome-border)] bg-[var(--chrome-ground)]"
          >
            <div className="h-16" style={{ background: hex || "#000" }} />
            <div className="px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.06em] font-bold text-[var(--chrome-fg)]">
                {key}
              </p>
              <p className="text-[11px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-muted)] mt-0.5">
                {hex || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <Caption>Opacity ladder (computed at use site)</Caption>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entries.slice(0, 3).map(([key, hex]) => (
          <div key={key} className="flex flex-col gap-1">
            {ALPHAS.map((a) => (
              <div
                key={a}
                className="h-6 rounded-[6px] flex items-center justify-between px-2 text-[10px] font-[family-name:var(--chrome-font-mono)]"
                style={{
                  background: hex ? colorWithAlpha(hex, a) : "transparent",
                  color: key === "light" ? "#0a0b0d" : "#fff",
                  border: "1px solid var(--chrome-border)",
                }}
              >
                <span>{Math.round(a * 100)}%</span>
                <span className="opacity-70">{key}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TypographyPreview({ tokens }) {
  return (
    <div className="flex flex-col gap-4">
      <Caption>Type scale (desktop)</Caption>
      <div className="flex flex-col gap-3">
        {TYPOGRAPHY_SCALES.map(([key, label]) => {
          const cls = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(key)
            ? `sg-${key}`
            : `sg-${kebab(key)}`;
          const scale = tokens.typography?.[key]?.desktop ?? {};
          return (
            <div
              key={key}
              className="grid grid-cols-[80px_1fr] gap-3 items-baseline"
            >
              <span className="text-[10px] uppercase tracking-[0.04em] font-bold text-[var(--chrome-fg)] font-[family-name:var(--chrome-font-mono)] pt-1">
                {label}
                <br />
                <span className="opacity-60 font-normal">{scale.size ?? "—"}px</span>
              </span>
              <span className={`${cls} text-[var(--chrome-fg)] break-words`}>
                {PANGRAM}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SpacingPreview({ tokens }) {
  return (
    <div className="flex flex-col gap-3">
      <Caption>Vertical rhythm (desktop px → em on site)</Caption>
      <div className="rounded-[10px] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] overflow-hidden">
        {SPACING_TOKENS.map(([key, label]) => {
          const v = tokens.spacing?.[key]?.desktop ?? 16;
          return (
            <div
              key={key}
              className="grid grid-cols-[140px_1fr_72px] items-center text-[11px] border-b border-[var(--chrome-border)] last:border-b-0"
            >
              <span className="px-3 py-2 text-[var(--chrome-fg)] font-bold uppercase tracking-[0.04em]">
                {label}
              </span>
              <span
                className="bg-[var(--chrome-fg)]/8 border-y border-[var(--chrome-border-strong)]"
                style={{ height: `${v}px` }}
              />
              <span className="px-3 py-2 text-right font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-muted)]">
                {v}px
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RadiiPreview({ tokens }) {
  return (
    <div className="flex flex-col gap-3">
      <Caption>Corner radii</Caption>
      <div className="grid grid-cols-3 gap-3">
        {RADIUS_TOKENS.map(([key, label]) => {
          const v = tokens.radii?.[key]?.desktop ?? 6;
          return (
            <div
              key={key}
              className="aspect-[4/3] bg-[var(--chrome-fg)]/8 border border-[var(--chrome-border-strong)] flex items-end justify-between p-3"
              style={{ borderRadius: `${v}px` }}
            >
              <span className="text-[11px] uppercase tracking-[0.04em] font-bold text-[var(--chrome-fg)]">
                {label}
              </span>
              <span className="text-[10px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-subtle)]">
                {v}px
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CardPreview({ activeId }) {
  const cls = `sg-card${activeId === "default" ? "" : `-${activeId}`}`;
  return (
    <div className="flex flex-col gap-3">
      <Caption>{activeId} card with live tokens</Caption>
      <div className={cls}>
        <p className="sg-text-small" style={{ opacity: 0.7 }}>
          Sample card
        </p>
        <h3 className="sg-h4" style={{ marginTop: "0.5em" }}>
          Considered, calm, in service of the work.
        </h3>
        <p className="sg-text-main" style={{ marginTop: "0.75em" }}>
          This card is rendered with the live tokens for the {activeId} variant.
          Switch the filter to compare.
        </p>
      </div>
    </div>
  );
}

export function ButtonPreview({ activeId }) {
  const cls = `sg-button${activeId === "primary" ? "" : `-${activeId}`}`;
  return (
    <div className="flex flex-col gap-4">
      <Caption>{activeId} button — hover to see the hover state</Caption>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className={cls}>
          Start a project
        </button>
        <span className="text-[11px] text-[var(--chrome-fg-subtle)]">
          ← hover the button
        </span>
      </div>
    </div>
  );
}

export function LinksPreview({ tokens }) {
  const items = tokens.links ?? [];
  return (
    <div className="flex flex-col gap-3">
      <Caption>Named links</Caption>
      {items.length === 0 ? (
        <p className="text-[12px] text-[var(--chrome-fg-muted)]">
          Empty. Add a name and URL on the left, then hit Add link.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((l, i) => (
            <li
              key={i}
              className="grid grid-cols-[140px_1fr] gap-3 px-3 py-2 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)]"
            >
              <span className="text-[12px] text-[var(--chrome-fg)] truncate">
                {l.name || <em className="opacity-50">unnamed</em>}
              </span>
              <span className="text-[11px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-muted)] truncate">
                {l.url || "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Caption({ children }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.04em] font-bold text-[var(--chrome-fg)]">
      {children}
    </p>
  );
}

function Code({ children }) {
  return (
    <pre className="text-[11px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg)] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] rounded-[8px] p-3 overflow-x-auto leading-relaxed whitespace-pre">
      {children}
    </pre>
  );
}

function kebab(s) {
  return s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}
