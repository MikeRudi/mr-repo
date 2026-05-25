"use client";

import { useMemo, useState } from "react";
import { hasImplementation } from "../../../../library/registry.js";

export default function SectionsPanel({
  sections,
  onAdd,
}) {
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const live = sections.filter((s) => hasImplementation(s.id));
    const filtered = needle
      ? live.filter((s) => {
          const hay = `${s.name} ${s.id} ${s.category}`.toLowerCase();
          return hay.includes(needle);
        })
      : live;
    const by = new Map();
    for (const s of filtered) {
      const cat = s.category ?? "uncategorised";
      if (!by.has(cat)) by.set(cat, []);
      by.get(cat).push(s);
    }
    return Array.from(by.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sections, q]);

  return (
    <div className="flex flex-col gap-5 p-4">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search sections"
        className="app-input w-full px-3"
        style={{ textTransform: "none", letterSpacing: "normal" }}
      />

      {grouped.length === 0 ? (
        <p className="app-text px-1 py-2">
          Nothing matches.
        </p>
      ) : null}

      {grouped.map(([category, items]) => (
        <details key={category} className="app-panel overflow-hidden" open>
          <summary className="app-subtitle cursor-pointer px-4 py-3">
            {toTitleCase(category)}
          </summary>
          <ul className="flex flex-col gap-2 border-t border-[var(--chrome-border)] p-3">
            {items.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onAdd(s.id)}
                  className="btn-chrome btn-chrome--ghost btn-chrome--block"
                  style={{ justifyContent: "space-between" }}
                >
                  <span className="truncate">{sectionPickerName(s)}</span>
                  <span aria-hidden>+</span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

function sectionPickerName(section) {
  if (section.id === "auto-accordion") return "Auto progress with image";
  return section.name;
}

function toTitleCase(s) {
  if (!s) return s;
  return s
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
