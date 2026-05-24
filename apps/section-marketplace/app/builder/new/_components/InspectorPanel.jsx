"use client";

import { useEffect, useRef } from "react";

// Generic inspector. Renders controls declared in the section's manifest
// (section.json -> controls[]). No more per-section hand-wired schemas.
//
// Supported control types:
//   text         — single-line text input
//   textarea     — multi-line text area
//   number       — numeric input
//   slider       — range input (min, max, step)
//   select       — dropdown ({ value, label } options)
//   image        — URL string (rendered as text input for now)
//   array-object — list of objects, each with `objectFields` controls

export default function InspectorPanel({
  name,
  controls = [],
  props = {},
  onChange,
  onClose,
  onMoveUp,
  onMoveDown,
  onRemove,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [name]);

  const setField = (key, value) => onChange({ ...props, [key]: value });

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
        {controls.length === 0 ? (
          <p className="text-[12px] text-[var(--chrome-fg-muted)]">
            This section has no editable controls.
          </p>
        ) : null}

        {controls.map((control) => (
          <ControlField
            key={control.key}
            control={control}
            value={props[control.key]}
            onChange={(v) => setField(control.key, v)}
          />
        ))}

        <div className="mt-4 pt-4 border-t border-[var(--chrome-border)] flex flex-col gap-2">
          <button
            type="button"
            onClick={onMoveUp}
            className="h-9 rounded-[6px] border border-[var(--chrome-border)] text-[11px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
          >
            Move up
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            className="h-9 rounded-[6px] border border-[var(--chrome-border)] text-[11px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
          >
            Move down
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="h-9 rounded-[6px] border border-[var(--chrome-track-experimental)]/40 text-[11px] text-[var(--chrome-track-experimental)] hover:bg-[var(--chrome-track-experimental)]/10"
          >
            Remove section
          </button>
        </div>
      </div>
    </div>
  );
}

function ControlField({ control, value, onChange }) {
  switch (control.type) {
    case "text":
    case "image":
      return (
        <FieldShell label={control.label}>
          <Input value={value ?? ""} onChange={onChange} />
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

    case "slider":
      return (
        <FieldShell label={`${control.label}${value != null ? ` — ${value}` : ""}`}>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step ?? 1}
            value={value ?? control.min ?? 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full"
          />
        </FieldShell>
      );

    case "select":
      return (
        <FieldShell label={control.label}>
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            <option value="">Default</option>
            {(control.options ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label ?? opt.value}
              </option>
            ))}
          </select>
        </FieldShell>
      );

    case "array-object":
      return (
        <ArrayObjectField
          control={control}
          value={Array.isArray(value) ? value : []}
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

function ArrayObjectField({ control, value, onChange }) {
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
