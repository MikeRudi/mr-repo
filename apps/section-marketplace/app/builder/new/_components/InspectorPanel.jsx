"use client";

import { useEffect, useRef } from "react";
import { getSchema } from "../../../../library/section-props.js";

export default function InspectorPanel({
  sectionId,
  name,
  props,
  elementKey,
  onChange,
  onClose,
  onBack,
  buttonVariants = [],
  onMoveUp,
  onMoveDown,
  onRemove,
}) {
  const schema = getSchema(sectionId);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [sectionId, elementKey]);

  function setKey(key, value) {
    onChange({ ...props, [key]: value });
  }

  function setArrayItem(key, index, subKey, value) {
    const arr = Array.isArray(props[key]) ? [...props[key]] : [];
    if (!arr[index]) return;
    arr[index] = { ...arr[index], [subKey]: value };
    onChange({ ...props, [key]: arr });
  }

  function setTextArrayItem(key, index, value) {
    const arr = Array.isArray(props[key]) ? [...props[key]] : [];
    arr[index] = value;
    onChange({ ...props, [key]: arr });
  }

  const selectedField = elementKey
    ? schema?.fields?.find((f) => f.key === elementKey.key)
    : null;

  return (
    <div className="flex flex-col h-full border-l border-[var(--chrome-border)] bg-[var(--chrome-surface)] overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-4 h-10 border-b border-[var(--chrome-border)] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {elementKey ? (
            <button
              type="button"
              onClick={onBack}
              className="text-[11px] text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)]"
            >
              ←
            </button>
          ) : null}
          <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)] truncate">
            {elementKey
              ? formatElementLabel(elementKey)
              : name || sectionId}
          </span>
        </div>
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
        {elementKey ? (
          <ElementEditor
            elementKey={elementKey}
            value={props}
            onChange={setKey}
            onArrayChange={setArrayItem}
            onTextArrayChange={setTextArrayItem}
            variants={buttonVariants}
          />
        ) : (
          <SectionControls
            name={name || sectionId}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
          />
        )}
      </div>
    </div>
  );
}

function formatElementLabel(el) {
  if (el.sub) return `${el.key} · ${el.sub}`;
  if (el.index != null) return `${el.key}[${el.index}]`;
  return el.key;
}

function ElementEditor({ elementKey, value, onChange, onArrayChange, onTextArrayChange, variants }) {
  const { key, index, sub, linkIndex } = elementKey;

  // Determine what kind of editor to show based on the key
  const isCta = key.toLowerCase().includes("cta");
  const isButton = key.toLowerCase().includes("button") || isCta;

  // Array item with sub-field (testimonials, carousel, footer groups)
  if (index != null && sub) {
    const arr = Array.isArray(value[key]) ? value[key] : [];
    const item = arr[Number(index)] ?? {};

    if (sub === "links" && linkIndex != null) {
      const links = Array.isArray(item.links) ? item.links : [];
      const link = links[Number(linkIndex)] ?? { label: "", href: "" };
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Link Label" value={link.label} onChange={(v) => {
            const nextLinks = [...links];
            nextLinks[Number(linkIndex)] = { ...link, label: v };
            onArrayChange(key, Number(index), "links", nextLinks);
          }} />
          <TextField label="Link Href" value={link.href} onChange={(v) => {
            const nextLinks = [...links];
            nextLinks[Number(linkIndex)] = { ...link, href: v };
            onArrayChange(key, Number(index), "links", nextLinks);
          }} />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <TextField label={sub.charAt(0).toUpperCase() + sub.slice(1)} value={item[sub] ?? ""} onChange={(v) => onArrayChange(key, Number(index), sub, v)} />
      </div>
    );
  }

  // Plain array text item (features-marquee, reasons)
  if (index != null && !sub) {
    const arr = Array.isArray(value[key]) ? value[key] : [];
    const item = arr[Number(index)] ?? "";
    return (
      <div className="flex flex-col gap-4">
        <TextField label={`${key}[${index}]`} value={item} onChange={(v) => onTextArrayChange(key, Number(index), v)} />
      </div>
    );
  }

  // Simple prop — text, heading, or CTA/button
  const v = value[key] ?? "";

  if (isButton && typeof v === "object") {
    return (
      <div className="flex flex-col gap-4">
        <TextField label="Label" value={v.label ?? ""} onChange={(val) => onChange({ ...value, [key]: { ...v, label: val } })} />
        {variants.length > 0 ? (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)]">Variant</label>
            <select
              value={v.variant ?? "primary"}
              onChange={(e) => onChange({ ...value, [key]: { ...v, variant: e.target.value } })}
              className="mt-1.5 w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
            >
              {variants.map((id) => (
                <option key={id} value={id}>
                  {id === "primary" ? "Primary" : id.charAt(0).toUpperCase() + id.slice(1)}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <TextField label="Href" value={v.href ?? ""} onChange={(val) => onChange({ ...value, [key]: { ...v, href: val } })} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TextField label={key} value={v} onChange={(val) => onChange({ ...value, [key]: val })} />
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)]">
        {label}
      </label>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
      />
    </div>
  );
}

function SectionControls({ name, onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-[var(--chrome-fg-muted)]">
        Click any element inside this section to edit its text and style.
      </p>
      <div className="mt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={onMoveUp}
          className="h-9 rounded-[6px] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
        >
          Move up
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          className="h-9 rounded-[6px] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
        >
          Move down
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="h-9 rounded-[6px] border border-[var(--chrome-track-experimental)]/40 text-[12px] text-[var(--chrome-track-experimental)] hover:bg-[var(--chrome-track-experimental)]/10"
        >
          Remove section
        </button>
      </div>
    </div>
  );
}
