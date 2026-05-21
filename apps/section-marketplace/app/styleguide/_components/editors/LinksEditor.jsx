"use client";

import { useState } from "react";
import { Field, TextInput } from "../Fields.jsx";

export default function LinksEditor({ value, onChange }) {
  const items = value ?? [];
  const [draftName, setDraftName] = useState("");
  const [draftUrl, setDraftUrl] = useState("");

  const add = () => {
    const name = draftName.trim();
    const url = draftUrl.trim();
    if (!name || !url) return;
    onChange([...items, { name, url }]);
    setDraftName("");
    setDraftUrl("");
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)] mb-3">
          Add a link
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-end">
          <Field label="Name" htmlFor="ln-new-n">
            <TextInput
              id="ln-new-n"
              value={draftName}
              onChange={setDraftName}
              placeholder="Privacy policy"
              monospace={false}
            />
          </Field>
          <Field label="URL" htmlFor="ln-new-u">
            <input
              id="ln-new-u"
              type="text"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              onKeyDown={handleKey}
              placeholder="/privacy"
              className="h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] font-[family-name:var(--chrome-font-mono)]"
            />
          </Field>
          <button
            type="button"
            onClick={add}
            disabled={!draftName.trim() || !draftUrl.trim()}
            className="h-9 px-4 rounded-full bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)] text-[12px] disabled:opacity-40"
          >
            Add link
          </button>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)] mb-3">
          Saved links{items.length > 0 ? ` (${items.length})` : ""}
        </p>
        {items.length === 0 ? (
          <p className="text-[12px] text-[var(--chrome-fg-muted)]">
            None yet. Add the URLs that footer, contact, or legal sections will
            reference later.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="grid grid-cols-[140px_1fr_auto] gap-3 px-3 py-2 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] items-center"
              >
                <span className="text-[12px] text-[var(--chrome-fg)] truncate">
                  {item.name}
                </span>
                <span className="text-[11px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-muted)] truncate">
                  {item.url}
                </span>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-[11px] text-[var(--chrome-fg-subtle)] hover:text-[var(--chrome-fg)]"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
