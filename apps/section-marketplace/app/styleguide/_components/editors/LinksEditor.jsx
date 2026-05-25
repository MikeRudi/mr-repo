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
        <p className="app-subtitle mb-3">
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
              className="app-input px-3 font-[family-name:var(--chrome-font-mono)]"
            />
          </Field>
          <button
            type="button"
            onClick={add}
            disabled={!draftName.trim() || !draftUrl.trim()}
            className="btn-chrome"
          >
            Add link
          </button>
        </div>
      </div>

      <div>
        <p className="app-subtitle mb-3">
          Saved links{items.length > 0 ? ` (${items.length})` : ""}
        </p>
        {items.length === 0 ? (
          <p className="app-text">None yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="grid grid-cols-[140px_1fr_auto] items-center gap-3 rounded-[0.25rem] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] px-3 py-3"
              >
                <span className="truncate text-[16px] text-[var(--chrome-fg)]">
                  {item.name}
                </span>
                <span className="truncate font-[family-name:var(--chrome-font-mono)] text-[16px] text-[var(--chrome-fg-muted)]">
                  {item.url}
                </span>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-[16px] text-[var(--chrome-fg-subtle)] hover:text-[var(--chrome-fg)]"
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
