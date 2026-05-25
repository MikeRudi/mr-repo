"use client";

import { ImageInput } from "./InspectorPanel.jsx";

function blankItem(fields) {
  const next = {};
  for (const field of fields) {
    next[field.key] = field.type === "image" ? "" : "";
  }
  return next;
}

export default function SectionCmsPanel({
  name,
  cms,
  value,
  onChange,
  onClose,
}) {
  const fields = cms?.fields ?? [];
  const rows =
    Array.isArray(value) && value.length
      ? value
      : Array.isArray(cms?.defaultValue)
        ? structuredClone(cms.defaultValue)
        : [];

  const updateRow = (index, key, nextValue) => {
    const next = rows.slice();
    next[index] = { ...next[index], [key]: nextValue };
    onChange(next);
  };

  const addRow = () => onChange([...rows, blankItem(fields)]);

  const removeRow = (index) => {
    const next = rows.slice();
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border-l border-[var(--chrome-border)] bg-[var(--chrome-surface)]">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--chrome-border)] px-5">
        <div className="min-w-0">
          <p className="truncate text-[16px] font-medium text-[var(--chrome-fg)]">
            Section CMS
          </p>
          <p
            className="truncate text-[16px] text-[var(--chrome-fg-subtle)]"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            {name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn-chrome btn-chrome--ghost btn-chrome--sm !min-h-10 !w-10 !px-0"
          aria-label="Close section CMS"
        >
          x
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[16px] font-medium text-[var(--chrome-fg)]">
            {cms?.label ?? "Items"}
          </p>
          <button
            type="button"
            onClick={addRow}
            className="btn-chrome btn-chrome--ghost btn-chrome--sm"
          >
            + Add item
          </button>
        </div>

        {rows.length === 0 ? (
          <p
            className="app-text"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            No items yet.
          </p>
        ) : null}

        <ul className="flex flex-col gap-4">
          {rows.map((row, index) => (
            <li
              key={index}
              className="app-panel bg-[var(--chrome-ground)] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="app-eyebrow">
                  Item {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-[16px] text-[var(--chrome-track-experimental)] hover:opacity-70"
                >
                  Remove
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {fields.map((field) => (
                  <CmsField
                    key={field.key}
                    field={field}
                    value={row[field.key] ?? ""}
                    onChange={(nextValue) =>
                      updateRow(index, field.key, nextValue)
                    }
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CmsField({ field, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[16px] font-normal text-[var(--chrome-fg)]">
        {field.label}
      </span>
      {field.type === "textarea" ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="app-input w-full resize-y px-3 py-2"
          style={{ textTransform: "none", letterSpacing: "normal" }}
        />
      ) : field.type === "image" ? (
        <ImageInput value={value ?? ""} onChange={onChange} />
      ) : (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="app-input w-full px-3"
          style={{ textTransform: "none", letterSpacing: "normal" }}
        />
      )}
    </label>
  );
}
