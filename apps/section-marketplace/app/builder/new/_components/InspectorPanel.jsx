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
//   toggle       — boolean on/off control

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
    <div className="flex h-full flex-col overflow-hidden border-l border-[var(--chrome-border)] bg-[var(--chrome-surface)]">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--chrome-border)] px-5">
        <span className="app-subtitle truncate">
          {name}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="btn-chrome btn-chrome--ghost btn-chrome--sm !min-h-10 !w-10 !px-0"
          aria-label="Close inspector"
        >
          ×
        </button>
      </header>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        {hasCms || panels.length > 0 ? (
          <div className="app-panel bg-[var(--chrome-ground)] p-4">
            <p
              className="app-text mb-3"
              style={{ textTransform: "none", letterSpacing: "normal" }}
            >
              Section panels
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
          <p className="app-text">
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

    case "toggle": {
      const current =
        typeof value === "boolean" ? value : Boolean(control.defaultValue);
      return (
        <FieldShell label={control.label}>
          <button
            type="button"
            onClick={() => onChange(!current)}
            className={`btn-chrome btn-chrome--block ${
              current ? "" : "btn-chrome--ghost"
            }`}
            aria-pressed={current}
          >
            {current ? "On" : "Off"}
          </button>
        </FieldShell>
      );
    }

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
            onInput={(e) => onChange(Number(e.target.value))}
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
      const selectValue =
        value ??
        control.defaultValue ??
        selectOptions[0]?.value ??
        "";
      return (
        <FieldShell label={control.label}>
          <select
            value={selectValue}
            onChange={(e) => onChange(e.target.value)}
            className="app-input mt-1 w-full px-3"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
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
            className="app-input mt-1 w-full px-3"
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
      const colorValue = value ?? control.defaultValue ?? colors[0]?.value ?? "";
      return (
        <FieldShell label={control.label}>
          <select
            value={colorValue}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="app-input mt-1 w-full px-3"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            {control.defaultValue ? null : <option value="">Default color</option>}
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
            value={value ?? control.defaultValue ?? typography[0]?.value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="app-input mt-1 w-full px-3"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            {control.defaultValue ? null : <option value="">Default tag</option>}
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
      <p className="app-subtitle">
        {control.label}
      </p>
      <ul className="flex flex-col gap-3">
        {value.map((row, i) => (
          <li
            key={i}
            className="app-panel flex flex-col gap-3 bg-[var(--chrome-ground)] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="app-eyebrow">
                Item {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-[16px] text-[var(--chrome-track-experimental)] hover:opacity-70"
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
        className="btn-chrome btn-chrome--ghost btn-chrome--block"
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
        <div className="relative aspect-[4/3] overflow-hidden rounded-[0.25rem] border border-[var(--chrome-border)] bg-[var(--chrome-ground)]">
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
          className="btn-chrome btn-chrome--ghost btn-chrome--sm"
        >
          {uploading ? "Uploading..." : "Upload image"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="btn-chrome btn-chrome--ghost btn-chrome--sm"
          >
            Clear
          </button>
        ) : null}
        {status ? (
          <span
            className="text-[16px] text-[var(--chrome-fg-subtle)]"
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
      className="app-input mt-1 w-full px-3"
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
        className={`text-[16px] font-normal text-[var(--chrome-fg)] ${
          size === "sm" ? "" : ""
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
      className="app-input w-full px-3"
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
      className="app-input w-full resize-y px-3 py-2"
      style={{ textTransform: "none", letterSpacing: "normal" }}
    />
  );
}
