"use client";

import { Field, TextInput } from "../Fields.jsx";

export default function LinksEditor({ value, onChange }) {
  const items = value ?? [];
  const set = (idx, key, v) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: v };
    onChange(next);
  };
  const add = () => onChange([...items, { name: "", url: "" }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-[12px] text-[var(--chrome-fg-muted)] leading-relaxed">
          No links yet. Add the URLs that footer, legal, social, or contact
          sections will pull from later.
        </p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-end"
          >
            <Field label={`#${idx + 1} name`} htmlFor={`ln-${idx}-n`}>
              <TextInput
                id={`ln-${idx}-n`}
                value={item.name}
                onChange={(v) => set(idx, "name", v)}
                placeholder="Privacy policy"
                monospace={false}
              />
            </Field>
            <Field label="URL" htmlFor={`ln-${idx}-u`}>
              <TextInput
                id={`ln-${idx}-u`}
                value={item.url}
                onChange={(v) => set(idx, "url", v)}
                placeholder="/privacy"
              />
            </Field>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="h-9 px-3 rounded-[8px] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center h-9 px-3 rounded-full border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
        >
          + Add link
        </button>
      </div>
    </div>
  );
}
