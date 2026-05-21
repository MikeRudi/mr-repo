"use client";

import {
  TYPOGRAPHY_SCALES,
  SPACING_TOKENS,
  RADIUS_TOKENS,
  colorWithAlpha,
} from "../../../lib/styleguide-defaults.js";

// Sample copy used by typography + card + button demos.
const PANGRAM = "Bright vixens jump; dozy fowl quack.";

export function WizardryPreview({ tokens }) {
  const w = tokens.wizardry ?? {};
  const d = w.rem?.desktop ?? {};
  const m = w.rem?.mobile ?? {};
  const desktopVw = formula(d.anchorRem, d.anchorViewport);
  const mobileVw = formula(m.anchorRem, m.anchorViewport);
  const max = w.container?.maxWidth ?? 1920;
  const bp = w.breakpoint?.tablet ?? 992;

  return (
    <div className="flex flex-col gap-4">
      <Caption>Generated declarations</Caption>
      <Code>
        {[
          `:root { font-size: ${desktopVw}; }`,
          `@media (min-width: ${d.anchorViewport ?? 1920}px) {`,
          `  :root { font-size: ${d.anchorRem ?? 16}px; }`,
          `}`,
          `@media (max-width: ${bp - 0.02}px) {`,
          `  :root { font-size: ${mobileVw}; }`,
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
  const TOKENS = [
    ["light", "Light", c.light],
    ["dark", "Dark", c.dark],
    ["brand", "Brand", c.brand],
  ];
  const ALPHAS = [1, 0.7, 0.4, 0.15, 0.06];

  return (
    <div className="flex flex-col gap-5">
      <Caption>Primaries</Caption>
      <div className="grid grid-cols-3 gap-3">
        {TOKENS.map(([key, label, hex]) => (
          <div
            key={key}
            className="rounded-[10px] overflow-hidden border border-[var(--chrome-border)] bg-[var(--chrome-ground)]"
          >
            <div className="h-20" style={{ background: hex || "#000" }} />
            <div className="px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--chrome-fg-subtle)]">
                {label}
              </p>
              <p className="text-[11px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg)] mt-0.5">
                {hex || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <Caption>Opacity ladder (computed at use site)</Caption>
      <div className="grid grid-cols-3 gap-3">
        {TOKENS.map(([key, , hex]) => (
          <div key={key} className="flex flex-col gap-1">
            {ALPHAS.map((a) => (
              <div
                key={a}
                className="h-7 rounded-[6px] flex items-center justify-between px-2 text-[10px] font-[family-name:var(--chrome-font-mono)]"
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
              <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--chrome-fg-subtle)] font-[family-name:var(--chrome-font-mono)] pt-1">
                {label}
                <br />
                <span className="opacity-60">{scale.size}</span>
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
      <Caption>Vertical rhythm (desktop em values)</Caption>
      <div className="rounded-[10px] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] overflow-hidden">
        {SPACING_TOKENS.map(([key, label]) => {
          const v = tokens.spacing?.[key]?.desktop ?? "1em";
          return (
            <div
              key={key}
              className="grid grid-cols-[120px_1fr_72px] items-center text-[11px] border-b border-[var(--chrome-border)] last:border-b-0"
            >
              <span className="px-3 py-2 text-[var(--chrome-fg-subtle)] uppercase tracking-[0.08em]">
                {label}
              </span>
              <span
                className="bg-[var(--chrome-fg)]/8 border-y border-[var(--chrome-border-strong)]"
                style={{ height: v }}
              />
              <span className="px-3 py-2 text-right font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-muted)]">
                {v}
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
          const v = tokens.radii?.[key]?.desktop ?? "0.5em";
          return (
            <div
              key={key}
              className="aspect-[4/3] bg-[var(--chrome-fg)]/8 border border-[var(--chrome-border-strong)] flex items-end justify-between p-3"
              style={{ borderRadius: v }}
            >
              <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--chrome-fg-muted)]">
                {label}
              </span>
              <span className="text-[10px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-subtle)]">
                {v}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CardPreview() {
  return (
    <div className="flex flex-col gap-3">
      <Caption>Card with live tokens</Caption>
      <div className="sg-card">
        <p className="sg-text-small" style={{ opacity: 0.7 }}>
          Sample card
        </p>
        <h3 className="sg-h4" style={{ marginTop: "0.5em" }}>
          Considered, calm, in service of the work.
        </h3>
        <p className="sg-text-main" style={{ marginTop: "0.75em" }}>
          This card is rendered with the live token values: padding, radius,
          background, foreground, border, and shadow all come from the editor
          on the left.
        </p>
        <div style={{ marginTop: "1em", display: "flex", gap: "0.5em" }}>
          <button type="button" className="sg-button">Primary action</button>
        </div>
      </div>
    </div>
  );
}

export function ButtonPreview() {
  return (
    <div className="flex flex-col gap-4">
      <Caption>Button — default & hover</Caption>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="sg-button">Default</button>
        <button
          type="button"
          className="sg-button"
          style={{
            background: "var(--sg-button-hover-background)",
            color: "var(--sg-button-hover-foreground)",
          }}
        >
          Hover state
        </button>
      </div>
      <Caption>In context</Caption>
      <div className="sg-card">
        <p className="sg-text-main">
          Talk to our team about your launch, your rebrand, or the system
          underneath both.
        </p>
        <div style={{ marginTop: "1em", display: "flex", gap: "0.5em" }}>
          <button type="button" className="sg-button">Start a project</button>
          <button
            type="button"
            className="sg-button"
            style={{ background: "transparent", color: "var(--sg-color-dark)" }}
          >
            Read the brief
          </button>
        </div>
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
          Empty. Sections like footer-minimal can reference these by name once
          you add them.
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
    <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--chrome-fg-subtle)]">
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

function formula(rem, vp) {
  if (!rem || !vp) return "—";
  return `${Number(((Number(rem) / Number(vp)) * 100).toFixed(4))}vw`;
}

function kebab(s) {
  return s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}
