"use client";

import { useState } from "react";
import { Field, ColorInput, TextInput } from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

const FIXED = [
  ["light", "Light",  "A white. Page background in light surfaces."],
  ["dark",  "Dark",   "A black. Default foreground in light surfaces."],
  ["brand", "Brand",  "Primary accent. Used for emphasis, hovers, CTAs."],
];
const FIXED_KEYS = new Set(FIXED.map(([k]) => k));

export default function ColorsEditor({ value, onChange }) {
  const colors = value ?? {};
  const customEntries = Object.entries(colors).filter(([k]) => !FIXED_KEYS.has(k));

  const [draftName, setDraftName] = useState("");
  const [draftHex, setDraftHex] = useState("#000000");

  const set = (key, v) => onChange({ ...colors, [key]: v });

  const renameKey = (oldKey, newKey) => {
    if (!newKey || newKey === oldKey) return;
    if (colors[newKey] != null && newKey !== oldKey) return; // collision
    const next = {};
    for (const [k, v] of Object.entries(colors)) {
      next[k === oldKey ? newKey : k] = v;
    }
    onChange(next);
  };

  const remove = (key) => {
    const next = { ...colors };
    delete next[key];
    onChange(next);
  };

  const add = () => {
    const slug = draftName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug || colors[slug] != null) return;
    onChange({ ...colors, [slug]: draftHex });
    setDraftName("");
    setDraftHex("#000000");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <GroupHeading>Primaries</GroupHeading>
        <div className="flex flex-col gap-3">
          {FIXED.map(([k, label, hint]) => (
            <Field key={k} label={label} hint={hint} htmlFor={`c-${k}`}>
              <ColorInput
                id={`c-${k}`}
                value={colors[k]}
                onChange={(v) => set(k, v)}
              />
            </Field>
          ))}
        </div>
      </div>

      <div>
        <GroupHeading>Custom colors</GroupHeading>
        {customEntries.length === 0 ? (
          <p className="text-[12px] text-[var(--chrome-fg-muted)] mb-3">
            No custom colors yet. Add accents, surfaces, or anything else the
            brand needs beyond light / dark / brand.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 mb-3">
            {customEntries.map(([key, hex]) => (
              <li
                key={key}
                className="grid grid-cols-[140px_1fr_auto] gap-2 items-center"
              >
                <input
                  type="text"
                  value={key}
                  onChange={(e) => renameKey(key, slugify(e.target.value))}
                  className="h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px] font-[family-name:var(--chrome-font-mono)]"
                />
                <ColorInput value={hex} onChange={(v) => set(key, v)} />
                <button
                  type="button"
                  onClick={() => remove(key)}
                  className="h-9 px-3 rounded-[8px] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-[140px_1fr_auto] gap-2 items-end">
          <Field label="New color name" htmlFor="c-new-name">
            <TextInput
              id="c-new-name"
              value={draftName}
              onChange={setDraftName}
              placeholder="accent"
              monospace={false}
            />
          </Field>
          <Field label="Hex" htmlFor="c-new-hex">
            <ColorInput id="c-new-hex" value={draftHex} onChange={setDraftHex} />
          </Field>
          <button
            type="button"
            onClick={add}
            disabled={!draftName.trim()}
            className="h-9 px-3 rounded-full bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)] text-[12px] disabled:opacity-40"
          >
            Add color
          </button>
        </div>
      </div>
    </div>
  );
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
