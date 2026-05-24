"use client";

import { useMemo, useState } from "react";
import { hasImplementation } from "../../../../library/registry.js";

// Section picker for the builder. Groups sections by category folder.
// Category labels render in UPPERCASE. Buttons inherit the global uppercase
// chrome treatment.
export default function SectionsPanel({ sections, onAdd }) {
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
    <div className="flex flex-col gap-4 p-3">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search sections"
        className="h-9 px-3 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] focus:outline-none focus:border-[var(--chrome-border-strong)]"
        style={{ textTransform: "none", letterSpacing: "normal" }}
      />

      {grouped.length === 0 ? (
        <p className="text-[12px] text-[var(--chrome-fg-subtle)] px-1 py-2">
          Nothing matches.
        </p>
      ) : null}

      {grouped.map(([category, items]) => (
        <div key={category} className="flex flex-col gap-2">
          <p className="px-1 text-[10px] uppercase tracking-[0.18em] text-[var(--chrome-fg-subtle)] font-semibold">
            {category}
          </p>
          <ul className="flex flex-col gap-1.5">
            {items.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onAdd(s.id)}
                  className="btn-chrome btn-chrome--ghost btn-chrome--block"
                  style={{ justifyContent: "space-between" }}
                >
                  <span className="truncate">{s.name}</span>
                  <span aria-hidden>+</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
