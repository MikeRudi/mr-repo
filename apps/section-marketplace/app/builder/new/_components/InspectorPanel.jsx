"use client";

import { useEffect, useRef, useState } from "react";

// Generic inspector. Renders controls declared in the section's manifest
// (section.json -> controls[]). No more per-section hand-wired schemas.
//
// Supported control types:
//   text         — single-line text input
//   textarea     — multi-line text area
//   number       — numeric input
//   slider       — range input (min, max, step)
//   select       — dropdown ({ value, label } options)
//   image        — URL string with upload helper
//   array-object   — list of objects, each with `objectFields` controls
//   button-variant — pick a button style from the active style guide
//                    (option list comes from `context.buttons`)

// The inspector edits **content + style** only. Move-up / move-down / remove
// live on the canvas hover toolbar — never here. See PANEL_RULES.md (rule 3).
export default function InspectorPanel({
  name,
  controls = [],
  props = {},
  context = {},
  hasCms = false,
  panels = [],
  onChange,
  onOpenCms,
  onOpenPanel,
  onClose,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [name]);

  const setField = (key, value) => {
    const next = { ...props };
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
    onChange(next);
  };

  return (
    <div className="flex flex-col h-full border-l border-[var(--chrome-border)] bg-[var(--chrome-surface)] overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-4 h-10 border-b border-[var(--chrome-border)] shrink-0">
        <span className="text-[11px] tracking-[0.06em] text-[var(--chrome-fg)] truncate">
          {name}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 grid place-items-center rounded-[6px] text-[12px] text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)] hover:bg-[var(--chrome-ground)]"
          aria-label="Close inspector"
        >
          ×
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {hasCms || panels.length > 0 ? (
          <div className="rounded-[8px] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] p-3">
            <p
              className="mb-2 text-[11px] text-[var(--chrome-fg-muted)]"
              style={{ textTransform: "none", letterSpacing: "normal" }}
            >
              Open focused panels for this section.
            </p>
            <div className="flex flex-col gap-2">
              {hasCms ? (
                <button
                  type="button"
                  onClick={onOpenCms}
                  className="btn-chrome btn-chrome--block"
                >
                  Update CMS
                </button>
              ) : null}
              {panels.map((panel) => (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => onOpenPanel(panel.id)}
                  className="btn-chrome btn-chrome--ghost btn-chrome--block"
                >
                  Update {panel.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {controls.length === 0 && !hasCms && panels.length === 0 ? (
          <p className="text-[12px] text-[var(--chrome-fg-muted)]">
            This section has no editable controls.
          </p>
        ) : null}

        {controls.map((control) => (
          <ControlField
            key={control.key}
            control={control}
            value={props[control.key]}
            context={context}
            onChange={(v) => setField(control.key, v)}
          />
        ))}

      </div>
    </div>
  );
}

export function ControlField({ control, value, context = {}, onChange }) {
  switch (control.type) {
    case "text":
      return (
        <FieldShell label={control.label}>
          <Input value={value ?? ""} onChange={onChange} />
        </FieldShell>
      );

    case "image":
      return (
        <FieldShell label={control.label}>
          <ImageInput value={value ?? ""} onChange={onChange} />
        </FieldShell>
      );

    case "textarea":
      return (
        <FieldShell label={control.label}>
          <Textarea value={value ?? ""} onChange={onChange} />
        </FieldShell>
      );

    case "number":
      return (
        <FieldShell label={control.label}>
          <Input
            type="number"
            value={value ?? ""}
            onChange={(v) => onChange(v === "" ? undefined : Number(v))}
          />
        </FieldShell>
      );

    case "slider": {
      // PANEL_RULES.md (rule 4): sliders are percent-based, centred at 50.
      const min = control.min ?? 0;
      const max = control.max ?? 100;
      const mid = Math.round((min + max) / 2);
      const current = typeof value === "number" ? value : mid;
      const isPercent = min === 0 && max === 100;
      const displayValue = isPercent ? `${current}%` : current;
      return (
        <FieldShell label={`${control.label} — ${displayValue}`}>
          <input
            type="range"
            min={min}
            max={max}
            step={control.step ?? 1}
            value={current}
            onChange={(e) => onChange(Number(e.target.value))}
            onDoubleClick={() => onChange(mid)}
            className="w-full accent-black"
            title="Double-click to reset"
          />
          <div
            className="flex items-center justify-between text-[9px] text-[var(--chrome-fg-subtle)]"
            style={{ textTransform: "none", letterSpacing: "0.06em" }}
          >
            <span>{isPercent ? "0%" : min}</span>
            <span>{isPercent ? "50%" : mid}</span>
            <span>{isPercent ? "100%" : max}</span>
          </div>
        </FieldShell>
      );
    }

    case "select":
      const selectOptions = control.options ?? [];
      const hasDefaultOption = selectOptions.some((opt) => opt.value === "default");
      return (
        <FieldShell label={control.label}>
          <select
            value={value ?? (hasDefaultOption ? "default" : "")}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            {hasDefaultOption ? null : <option value="">Default</option>}
            {selectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label ?? opt.value}
              </option>
            ))}
          </select>
        </FieldShell>
      );

    case "button-variant": {
      const buttons = Array.isArray(context.buttons) ? context.buttons : [];
      return (
        <FieldShell label={control.label}>
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="mt-1 w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            <option value="">Default button</option>
            {buttons.map((btn) => (
              <option key={btn.id} value={btn.id}>
                {btn.name ?? btn.id}
              </option>
            ))}
          </select>
        </FieldShell>
      );
    }

    case "color-token": {
      const colors = Array.isArray(context.colors) ? context.colors : [];
      return (
        <FieldShell label={control.label}>
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="mt-1 w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            <option value="">Default color</option>
            {colors.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </FieldShell>
      );
    }

    case "typography-token": {
      const typography = Array.isArray(context.typography)
        ? context.typography
        : [];
      return (
        <FieldShell label={control.label}>
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="mt-1 w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            <option value="">Default tag</option>
            {typography.map((scale) => (
              <option key={scale.value} value={scale.value}>
                {scale.label}
              </option>
            ))}
          </select>
        </FieldShell>
      );
    }

    case "array-object":
      return (
        <ArrayObjectField
          control={control}
          value={
            Array.isArray(value)
              ? value
              : Array.isArray(control.defaultValue)
                ? structuredClone(control.defaultValue)
                : []
          }
          context={context}
          onChange={onChange}
        />
      );

    default:
      return (
        <FieldShell label={control.label}>
          <p className="text-[11px] text-[var(--chrome-fg-subtle)]">
            Unsupported control type: {control.type}
          </p>
        </FieldShell>
      );
  }
}

function ArrayObjectField({ control, value, context = {}, onChange }) {
  const fields = control.objectFields ?? [];

  const updateRow = (index, key, v) => {
    const next = value.slice();
    next[index] = { ...next[index], [key]: v };
    onChange(next);
  };
  const removeRow = (index) => {
    const next = value.slice();
    next.splice(index, 1);
    onChange(next);
  };
  const addRow = () => {
    const next = value.slice();
    const fresh = {};
    for (const f of fields) fresh[f.key] = "";
    next.push(fresh);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] tracking-[0.06em] text-[var(--chrome-fg)]">
        {control.label}
      </p>
      <ul className="flex flex-col gap-3">
        {value.map((row, i) => (
          <li
            key={i}
            className="rounded-[10px] border border-[var(--chrome-border)] p-3 flex flex-col gap-3 bg-[var(--chrome-ground)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.06em] text-[var(--chrome-fg-subtle)]">
                Item {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-[10px] text-[var(--chrome-track-experimental)] hover:opacity-70"
              >
                Remove
              </button>
            </div>
            {fields.map((f) => (
              <FieldShell key={f.key} label={f.label} size="sm">
                {f.type === "textarea" ? (
                  <Textarea
                    value={row[f.key] ?? ""}
                    onChange={(v) => updateRow(i, f.key, v)}
                  />
                ) : f.type === "image" ? (
                  <ImageInput
                    value={row[f.key] ?? ""}
                    onChange={(v) => updateRow(i, f.key, v)}
                  />
                ) : f.type === "button-variant" ? (
                  <ButtonVariantSelect
                    value={row[f.key]}
                    buttons={Array.isArray(context.buttons) ? context.buttons : []}
                    onChange={(v) => updateRow(i, f.key, v)}
                  />
                ) : (
                  <Input
                    value={row[f.key] ?? ""}
                    onChange={(v) => updateRow(i, f.key, v)}
                  />
                )}
              </FieldShell>
            ))}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={addRow}
        className="h-9 rounded-[8px] border border-dashed border-[var(--chrome-border)] text-[11px] text-[var(--chrome-fg-muted)] hover:border-[var(--chrome-border-strong)] hover:text-[var(--chrome-fg)]"
      >
        + Add item
      </button>
    </div>
  );
}

export function ImageInput({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const fileRef = useRef(null);

  const readAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setStatus("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads/images", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.url) {
        onChange(data.url);
        setStatus("Uploaded");
        return;
      }

      const localPreview = await readAsDataUrl(file);
      onChange(localPreview);
      setStatus(data?.error ? "Local preview" : "Local preview");
    } catch {
      const localPreview = await readAsDataUrl(file);
      onChange(localPreview);
      setStatus("Local preview");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative overflow-hidden rounded-[8px] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] aspect-[4/3]">
          <img src={value} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <Input value={value ?? ""} onChange={onChange} />
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          onChange={(e) => upload(e.target.files?.[0])}
          className="sr-only"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="h-8 px-3 rounded-[8px] border border-[var(--chrome-border)] text-[11px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)] disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload image"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="h-8 px-3 rounded-[8px] text-[11px] text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)]"
          >
            Clear
          </button>
        ) : null}
        {status ? (
          <span
            className="text-[10px] text-[var(--chrome-fg-subtle)]"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            {status}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ButtonVariantSelect({ value, buttons, onChange }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      className="mt-1 w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
      style={{ textTransform: "none", letterSpacing: "normal" }}
    >
      <option value="">Default button</option>
      {buttons.map((btn) => (
        <option key={btn.id} value={btn.id}>
          {btn.name ?? btn.id}
        </option>
      ))}
    </select>
  );
}

function FieldShell({ label, size = "md", children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={`tracking-[0.06em] text-[var(--chrome-fg)] ${
          size === "sm" ? "text-[10px]" : "text-[11px]"
        }`}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
      style={{ textTransform: "none", letterSpacing: "normal" }}
    />
  );
}

function Textarea({ value, onChange }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full px-2.5 py-2 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] resize-y"
      style={{ textTransform: "none", letterSpacing: "normal" }}
    />
  );
}
