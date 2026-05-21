"use client";

import { useState } from "react";

const SURFACES = [
  { key: "ground", label: "Ground", default: "#fdfcfc" },
  { key: "surface", label: "Surface", default: "#ffffff" },
  { key: "surfaceMuted", label: "Surface — muted", default: "#f5f3f1" },
  { key: "surfaceInverse", label: "Surface — inverse", default: "#000000" },
];

const FOREGROUND = [
  { key: "fg", label: "Foreground", default: "#000000" },
  { key: "fgMuted", label: "Foreground — muted", default: "#777169" },
  { key: "fgSubtle", label: "Foreground — subtle", default: "#a59f97" },
  { key: "fgDisabled", label: "Foreground — disabled", default: "#b1b0b0" },
  { key: "fgInverse", label: "Foreground — inverse", default: "#fdfcfc" },
];

const BORDERS = [
  { key: "border", label: "Border", default: "#e5e5e5" },
  { key: "borderStrong", label: "Border — strong", default: "#000000" },
];

const ACCENTS = [
  { key: "accent", label: "Accent", default: "#2c8a5a" },
  { key: "danger", label: "Danger", default: "#b54141" },
  { key: "success", label: "Success", default: "#2c8a5a" },
  { key: "warning", label: "Warning", default: "#b07a1f" },
];

const FONTS = [
  {
    key: "fontDisplay",
    label: "Display font stack",
    default: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
    long: true,
  },
  {
    key: "fontBody",
    label: "Body font stack",
    default: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
    long: true,
  },
  {
    key: "fontMono",
    label: "Mono font stack",
    default: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    long: true,
  },
];

const SPACING = [
  { key: "space1", label: "1", default: "4" },
  { key: "space2", label: "2", default: "8" },
  { key: "space3", label: "3", default: "12" },
  { key: "space4", label: "4", default: "16" },
  { key: "space5", label: "5", default: "20" },
  { key: "space6", label: "6", default: "24" },
  { key: "space8", label: "8", default: "32" },
  { key: "space10", label: "10", default: "40" },
  { key: "space12", label: "12", default: "48" },
  { key: "space16", label: "16", default: "64" },
  { key: "space20", label: "20", default: "80" },
  { key: "space24", label: "24", default: "96" },
];

const RADII = [
  { key: "radius1", label: "Radius 1", default: "3" },
  { key: "radius2", label: "Radius 2", default: "6" },
  { key: "radius3", label: "Radius 3", default: "10" },
  { key: "radiusCard", label: "Radius — card", default: "16" },
  { key: "radiusPill", label: "Radius — pill", default: "999" },
];

function defaultsFor(group) {
  return Object.fromEntries(group.map((f) => [f.key, f.default]));
}

const INITIAL = {
  ...defaultsFor(SURFACES),
  ...defaultsFor(FOREGROUND),
  ...defaultsFor(BORDERS),
  ...defaultsFor(ACCENTS),
  ...defaultsFor(FONTS),
  ...defaultsFor(SPACING),
  ...defaultsFor(RADII),
};

export default function StyleGuideForm() {
  const [name, setName] = useState("");
  const [tokens, setTokens] = useState(INITIAL);
  const [status, setStatus] = useState({ kind: "idle" });

  const update = (key) => (e) =>
    setTokens((prev) => ({ ...prev, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setStatus({ kind: "error", msg: "Add a name first." });
      return;
    }
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/styleguides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), tokens }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const msg =
          data?.error ??
          (res.status === 500
            ? "Server error. Has Neon been provisioned in the Vercel Storage tab?"
            : `Failed (${res.status}).`);
        setStatus({ kind: "error", msg });
        return;
      }
      setStatus({
        kind: "saved",
        id: data.styleGuide.id,
        msg: `Saved as ${data.styleGuide.name}`,
      });
    } catch (err) {
      setStatus({ kind: "error", msg: err?.message ?? "Network error" });
    }
  }

  function preview() {
    const cssLines = Object.entries(tokens)
      .map(([k, v]) => `--${camelToKebab(k)}: ${v};`)
      .join("\n");
    return `:root {\n  ${cssLines.replace(/\n/g, "\n  ")}\n}`;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <Group title="Identity">
        <Field
          label="Name"
          hint="A label so you can find this style guide later. e.g. 'Acme · Brand v1'"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My brand"
            className="h-10 w-full px-3 rounded-(--chrome-radius-2) bg-(--chrome-ground) border border-(--chrome-border) text-[14px]"
          />
        </Field>
      </Group>

      <Group title="Surfaces">
        <ColorGrid fields={SURFACES} tokens={tokens} update={update} />
      </Group>
      <Group title="Foreground">
        <ColorGrid fields={FOREGROUND} tokens={tokens} update={update} />
      </Group>
      <Group title="Borders">
        <ColorGrid fields={BORDERS} tokens={tokens} update={update} />
      </Group>
      <Group title="Accents + state">
        <ColorGrid fields={ACCENTS} tokens={tokens} update={update} />
      </Group>

      <Group title="Typography">
        <div className="grid grid-cols-1 gap-4">
          {FONTS.map((f) => (
            <Field key={f.key} label={f.label}>
              <input
                value={tokens[f.key]}
                onChange={update(f.key)}
                className="h-10 w-full px-3 rounded-(--chrome-radius-2) bg-(--chrome-ground) border border-(--chrome-border) font-[family-name:var(--chrome-font-mono)] text-[12px]"
              />
            </Field>
          ))}
        </div>
      </Group>

      <Group title="Spacing (px)">
        <ScaleGrid fields={SPACING} tokens={tokens} update={update} suffix="px" />
      </Group>
      <Group title="Radii (px)">
        <ScaleGrid fields={RADII} tokens={tokens} update={update} suffix="px" />
      </Group>

      <Group title="Preview · CSS">
        <pre className="text-[12px] font-[family-name:var(--chrome-font-mono)] bg-(--chrome-ground) border border-(--chrome-border) rounded-(--chrome-radius-2) p-4 overflow-x-auto whitespace-pre">
          {preview()}
        </pre>
      </Group>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status.kind === "saving"}
          className="h-10 px-5 rounded-(--chrome-radius-pill) bg-(--chrome-fg) text-(--chrome-fg-inverse) text-[13px] disabled:opacity-50"
        >
          {status.kind === "saving" ? "Saving…" : "Save style guide"}
        </button>
        {status.kind === "saved" ? (
          <span className="text-[13px] text-(--chrome-fg-muted)">
            {status.msg}
            {status.id ? (
              <span className="ml-2 font-[family-name:var(--chrome-font-mono)] text-[11px] text-(--chrome-fg-subtle)">
                {status.id}
              </span>
            ) : null}
          </span>
        ) : null}
        {status.kind === "error" ? (
          <span className="text-[13px] text-[var(--chrome-track-experimental)]">
            {status.msg}
          </span>
        ) : null}
      </div>
    </form>
  );
}

function Group({ title, children }) {
  return (
    <fieldset className="border-t border-(--chrome-border) pt-6">
      <legend className="text-[12px] uppercase tracking-[0.08em] text-(--chrome-fg-subtle) mb-4">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] text-(--chrome-fg)">{label}</span>
      {children}
      {hint ? (
        <span className="text-[11px] text-(--chrome-fg-subtle)">{hint}</span>
      ) : null}
    </label>
  );
}

function ColorGrid({ fields, tokens, update }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <Field key={f.key} label={f.label}>
          <div className="flex items-center gap-2 h-10 rounded-(--chrome-radius-2) bg-(--chrome-ground) border border-(--chrome-border) px-2">
            <span
              aria-hidden
              className="size-6 rounded-(--chrome-radius-1) border border-(--chrome-border)"
              style={{ background: tokens[f.key] }}
            />
            <input
              type="color"
              value={isHex(tokens[f.key]) ? tokens[f.key] : "#000000"}
              onChange={update(f.key)}
              className="size-6 cursor-pointer bg-transparent"
              aria-label={`${f.label} color picker`}
            />
            <input
              value={tokens[f.key]}
              onChange={update(f.key)}
              className="flex-1 h-full bg-transparent font-[family-name:var(--chrome-font-mono)] text-[12px] outline-none"
            />
          </div>
        </Field>
      ))}
    </div>
  );
}

function ScaleGrid({ fields, tokens, update, suffix }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      {fields.map((f) => (
        <Field key={f.key} label={f.label}>
          <div className="flex items-center gap-1.5 h-10 rounded-(--chrome-radius-2) bg-(--chrome-ground) border border-(--chrome-border) px-2">
            <input
              value={tokens[f.key]}
              onChange={update(f.key)}
              className="flex-1 h-full bg-transparent font-[family-name:var(--chrome-font-mono)] text-[12px] outline-none"
              inputMode="numeric"
            />
            <span className="text-[11px] text-(--chrome-fg-subtle)">{suffix}</span>
          </div>
        </Field>
      ))}
    </div>
  );
}

function isHex(v) {
  return typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v.trim());
}

function camelToKebab(s) {
  return s.replace(/[A-Z0-9]/g, (c) => `-${c.toLowerCase()}`);
}
