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
  typographyVariants = [],
  cardVariants = [],
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

  function setElementStyle(key, styleKey, styleValue) {
    const current = props.__elementStyles ?? {};
    const elStyles = { ...(current[key] ?? {}) };
    if (styleValue === "" || styleValue == null) {
      delete elStyles[styleKey];
    } else {
      elStyles[styleKey] = styleValue;
    }
    const next = { ...current, [key]: elStyles };
    if (Object.keys(elStyles).length === 0) delete next[key];
    onChange({ ...props, __elementStyles: next });
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
            elementStyles={props?.__elementStyles ?? {}}
            onChange={setKey}
            onArrayChange={setArrayItem}
            onTextArrayChange={setTextArrayItem}
            onStyleChange={setElementStyle}
            buttonVariants={buttonVariants}
            typographyVariants={typographyVariants}
            cardVariants={cardVariants}
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

function ElementEditor({ elementKey, value, elementStyles, onChange, onArrayChange, onTextArrayChange, onStyleChange, buttonVariants, typographyVariants, cardVariants }) {
  const sKey = styleKey(elementKey);
  const currentStyles = elementStyles[sKey] ?? {};

  const styleSection = (
    <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-[var(--chrome-border)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)]">
        Style overrides
      </p>
      <StyleEditor
        styles={currentStyles}
        onChange={(prop, val) => onStyleChange(sKey, prop, val)}
        buttonVariants={buttonVariants}
        typographyVariants={typographyVariants}
        cardVariants={cardVariants}
        isButton={isButton}
        currentVariant={isButton && typeof v === "object" ? v.variant : null}
        onVariantChange={(variant) => onChange({ ...value, [key]: { ...v, variant } })}
      />
    </div>
  );
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
          {styleSection}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <TextField label={sub.charAt(0).toUpperCase() + sub.slice(1)} value={item[sub] ?? ""} onChange={(v) => onArrayChange(key, Number(index), sub, v)} />
        {styleSection}
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
        {styleSection}
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
        {styleSection}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TextField label={key} value={v} onChange={(val) => onChange({ ...value, [key]: val })} />
      {styleSection}
    </div>
  );
}

function styleKey(el) {
  if (!el) return "";
  const parts = [el.key];
  if (el.index != null) parts.push(String(el.index));
  if (el.sub) parts.push(el.sub);
  if (el.linkIndex != null) parts.push("links", String(el.linkIndex));
  return parts.join(":");
}

function StyleEditor({ styles, onChange, buttonVariants, typographyVariants, cardVariants, isButton, currentVariant, onVariantChange }) {
  const fields = [
    { key: "color", label: "Text color", type: "color" },
    { key: "backgroundColor", label: "Background", type: "color" },
    { key: "fontSize", label: "Font size", type: "text", placeholder: "e.g. 18px" },
    { key: "fontWeight", label: "Font weight", type: "select", options: ["", "100", "200", "300", "400", "500", "600", "700", "800", "900"] },
    { key: "borderRadius", label: "Radius", type: "text", placeholder: "e.g. 8px" },
    { key: "padding", label: "Padding", type: "text", placeholder: "e.g. 8px 16px" },
  ];

  return (
    <>
      {/* Styleguide presets */}
      {(typographyVariants.length > 0 || cardVariants.length > 0 || buttonVariants.length > 0) && (
        <div className="flex flex-col gap-2 mb-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg-subtle)]">
            Styleguide presets
          </label>
          {isButton && buttonVariants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {buttonVariants.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onVariantChange(v)}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] border ${
                    currentVariant === v
                      ? "border-[var(--chrome-fg)] bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)]"
                      : "border-[var(--chrome-border)] text-[var(--chrome-fg-muted)] hover:border-[var(--chrome-border-strong)]"
                  }`}
                >
                  {v === "primary" ? "Primary" : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          )}
          {typographyVariants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {typographyVariants.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    onChange("fontSize", "");
                    onChange("fontWeight", "");
                    onChange("fontFamily", "");
                    // Apply typography preset
                    if (v === "h1") { onChange("fontSize", "96px"); onChange("fontWeight", "500"); }
                    else if (v === "h2") { onChange("fontSize", "64px"); onChange("fontWeight", "500"); }
                    else if (v === "h3") { onChange("fontSize", "44px"); onChange("fontWeight", "500"); }
                    else if (v === "h4") { onChange("fontSize", "32px"); onChange("fontWeight", "500"); }
                    else if (v === "h5") { onChange("fontSize", "24px"); onChange("fontWeight", "500"); }
                    else if (v === "h6") { onChange("fontSize", "18px"); onChange("fontWeight", "600"); }
                    else if (v === "textLarge") { onChange("fontSize", "20px"); onChange("fontWeight", "400"); }
                    else if (v === "textMain") { onChange("fontSize", "16px"); onChange("fontWeight", "400"); }
                    else if (v === "textSmall") { onChange("fontSize", "14px"); onChange("fontWeight", "400"); }
                  }}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] border ${
                    (styles.fontSize && styles.fontSize.includes(v === "textLarge" ? "20" : v === "textMain" ? "16" : v === "textSmall" ? "14" : v === "h1" ? "96" : v === "h2" ? "64" : v === "h3" ? "44" : v === "h4" ? "32" : v === "h5" ? "24" : v === "h6" ? "18" : "16"))
                      ? "border-[var(--chrome-fg)] bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)]"
                      : "border-[var(--chrome-border)] text-[var(--chrome-fg-muted)] hover:border-[var(--chrome-border-strong)]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          {cardVariants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cardVariants.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    if (v === "default") {
                      onChange("borderRadius", "12px");
                      onChange("padding", "28px");
                    } else if (v === "feature") {
                      onChange("borderRadius", "24px");
                      onChange("padding", "40px");
                    }
                  }}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] border ${
                    (styles.borderRadius && styles.borderRadius.includes(v === "default" ? "12" : "24"))
                      ? "border-[var(--chrome-fg)] bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)]"
                      : "border-[var(--chrome-border)] text-[var(--chrome-fg-muted)] hover:border-[var(--chrome-border-strong)]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom overrides */}
      <div className="grid grid-cols-2 gap-3">
      {fields.map((f) => (
        <div key={f.key} className={f.type === "color" ? "col-span-2" : ""}>
          <label className="text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg-subtle)]">
            {f.label}
          </label>
          {f.type === "color" ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={styles[f.key] || "#000000"}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="w-8 h-8 p-0 border-0 rounded-[4px] cursor-pointer"
              />
              <input
                type="text"
                value={styles[f.key] ?? ""}
                placeholder="#rrggbb"
                onChange={(e) => onChange(f.key, e.target.value)}
                className="flex-1 h-8 px-2.5 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] font-[family-name:var(--chrome-font-mono)]"
              />
              {styles[f.key] ? (
                <button
                  type="button"
                  onClick={() => onChange(f.key, "")}
                  className="text-[10px] text-[var(--chrome-fg-subtle)] hover:text-[var(--chrome-fg)]"
                >
                  Clear
                </button>
              ) : null}
            </div>
          ) : f.type === "select" ? (
            <select
              value={styles[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="mt-1 w-full h-8 px-2 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
            >
              {f.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "" ? "Default" : opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={styles[f.key] ?? ""}
              placeholder={f.placeholder}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="mt-1 w-full h-8 px-2.5 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] font-[family-name:var(--chrome-font-mono)]"
            />
          )}
        </div>
      ))}
    </div>
    </>
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
