"use client";

import { useEffect, useRef } from "react";
import { getSchema } from "../../../../library/section-props.js";

export default function InspectorPanel({ sectionId, name, props, onChange, onClose }) {
  const schema = getSchema(sectionId);
  const scrollRef = useRef(null);

  // Scroll to top when section changes
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [sectionId]);

  function setKey(key, value) {
    onChange({ ...props, [key]: value });
  }

  return (
    <div className="flex flex-col h-full border-l border-[var(--chrome-border)] bg-[var(--chrome-surface)] overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-4 h-10 border-b border-[var(--chrome-border)] shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)] truncate">
          {name || sectionId}
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {schema ? (
          <div className="flex flex-col gap-5">
            {schema.fields.map((field) => (
              <FieldBlock
                key={field.key}
                field={field}
                value={props?.[field.key]}
                onChange={(v) => setKey(field.key, v)}
              />
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-[var(--chrome-fg-muted)]">
            This section type does not have editable fields yet.
          </p>
        )}
      </div>
    </div>
  );
}

function FieldBlock({ field, value, onChange }) {
  const def = getDefault(field.type);
  const current = value ?? def;

  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)]">
        {field.label}
      </label>
      {field.hint ? (
        <p className="text-[10px] text-[var(--chrome-fg-subtle)] mt-0.5 mb-2">
          {field.hint}
        </p>
      ) : null}
      <div className="mt-1.5">
        {field.type === "text" && (
          <TextInput value={current} onChange={onChange} />
        )}
        {field.type === "textarea" && (
          <TextareaInput value={current} onChange={onChange} />
        )}
        {field.type === "number" && (
          <NumberInput value={current} onChange={onChange} min={field.min} step={field.step} />
        )}
        {field.type === "cta" && (
          <CtaInput value={current} onChange={onChange} />
        )}
        {field.type === "link" && (
          <LinkInput value={current} onChange={onChange} />
        )}
        {field.type === "array-text" && (
          <ArrayTextInput value={current} onChange={onChange} />
        )}
        {field.type === "array-object" && (
          <ArrayObjectInput value={current} onChange={onChange} schema={field.objectFields} />
        )}
      </div>
    </div>
  );
}

/* --- Individual field renderers --- */

function TextInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
    />
  );
}

function TextareaInput({ value, onChange }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full px-2.5 py-2 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] resize-y"
    />
  );
}

function NumberInput({ value, onChange, min, step }) {
  return (
    <input
      type="number"
      value={value ?? 0}
      min={min}
      step={step ?? 1}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] font-[family-name:var(--chrome-font-mono)]"
    />
  );
}

function CtaInput({ value, onChange }) {
  const v = value ?? { label: "", href: "" };
  return (
    <div className="flex flex-col gap-1.5">
      <input
        type="text"
        placeholder="Label"
        value={v.label ?? ""}
        onChange={(e) => onChange({ ...v, label: e.target.value })}
        className="h-8 px-2.5 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
      />
      <input
        type="text"
        placeholder="Href"
        value={v.href ?? ""}
        onChange={(e) => onChange({ ...v, href: e.target.value })}
        className="h-8 px-2.5 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] font-[family-name:var(--chrome-font-mono)]"
      />
    </div>
  );
}

function LinkInput({ value, onChange }) {
  const v = value ?? { label: "", href: "" };
  return (
    <div className="flex flex-col gap-1.5">
      <input
        type="text"
        placeholder="Label"
        value={v.label ?? ""}
        onChange={(e) => onChange({ ...v, label: e.target.value })}
        className="h-8 px-2.5 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
      />
      <input
        type="text"
        placeholder="Href"
        value={v.href ?? ""}
        onChange={(e) => onChange({ ...v, href: e.target.value })}
        className="h-8 px-2.5 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] font-[family-name:var(--chrome-font-mono)]"
      />
    </div>
  );
}

function ArrayTextInput({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const update = (idx, val) => {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  };
  const add = () => onChange([...items, ""]);
  const remove = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-1.5">
          <input
            type="text"
            value={item ?? ""}
            onChange={(e) => update(idx, e.target.value)}
            className="flex-1 h-8 px-2.5 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            className="h-8 px-2 rounded-[6px] border border-[var(--chrome-border)] text-[11px] text-[var(--chrome-fg-subtle)] hover:text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="h-8 rounded-[6px] border border-[var(--chrome-border)] text-[11px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
      >
        + Add row
      </button>
    </div>
  );
}

function ArrayObjectInput({ value, onChange, schema }) {
  const items = Array.isArray(value) ? value : [];
  const add = () => {
    const blank = {};
    for (const f of schema) blank[f.key] = f.type === "number" ? 0 : "";
    onChange([...items, blank]);
  };
  const remove = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    onChange(next);
  };
  const updateItem = (idx, key, val) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: val };
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-[8px] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] p-2.5 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg-subtle)]">
              #{idx + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-[10px] text-[var(--chrome-fg-subtle)] hover:text-[var(--chrome-fg)]"
            >
              Remove
            </button>
          </div>
          {schema.map((f) => (
            <div key={f.key}>
              <label className="text-[10px] uppercase tracking-[0.04em] text-[var(--chrome-fg-subtle)]">
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={item[f.key] ?? ""}
                  onChange={(e) => updateItem(idx, f.key, e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-2 py-1.5 rounded-[6px] bg-[var(--chrome-surface)] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] resize-y"
                />
              ) : f.type === "array-object" ? (
                <ArrayObjectInput
                  value={item[f.key]}
                  onChange={(v) => updateItem(idx, f.key, v)}
                  schema={f.objectFields}
                />
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={item[f.key] ?? (f.type === "number" ? 0 : "")}
                  onChange={(e) =>
                    updateItem(
                      idx,
                      f.key,
                      f.type === "number" ? Number(e.target.value) : e.target.value
                    )
                  }
                  className="w-full mt-1 h-7 px-2 rounded-[6px] bg-[var(--chrome-surface)] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] font-[family-name:var(--chrome-font-mono)]"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="h-8 rounded-[6px] border border-[var(--chrome-border)] text-[11px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
      >
        + Add row
      </button>
    </div>
  );
}

function getDefault(type) {
  switch (type) {
    case "text":
    case "textarea":
      return "";
    case "number":
      return 0;
    case "cta":
    case "link":
      return { label: "", href: "" };
    case "array-text":
      return [];
    case "array-object":
      return [];
    default:
      return null;
  }
}
