"use client";

import { useMemo, useState } from "react";
import { hasImplementation } from "../../../../library/registry.js";

export default function SectionsPanel({ sections, onAdd }) {
  const [q, setQ] = useState("");
  const [onlyLive, setOnlyLive] = useState(true);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sections.filter((s) => {
      if (onlyLive && !hasImplementation(s.id)) return false;
      if (!needle) return true;
      const hay = `${s.name} ${s.id} ${s.category} ${s.track}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [sections, q, onlyLive]);

  return (
    <div className="flex flex-col gap-3 p-3">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search sections"
        className="h-9 px-3 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] focus:outline-none focus:border-[var(--chrome-border-strong)]"
      />
      <label className="flex items-center gap-2 text-[12px] text-[var(--chrome-fg-muted)]">
        <input
          type="checkbox"
          checked={onlyLive}
          onChange={(e) => setOnlyLive(e.target.checked)}
        />
        Only live (implemented) sections
      </label>

      <ul className="flex flex-col gap-1">
        {filtered.map((s) => {
          const live = hasImplementation(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onAdd(s.id)}
                disabled={!live}
                className="w-full text-left px-3 py-2 rounded-[8px] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] hover:border-[var(--chrome-border-strong)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-[12px] text-[var(--chrome-fg)] truncate">
                    {s.name}
                  </p>
                  <p className="text-[10px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-subtle)] truncate">
                    {s.id}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center h-5 px-1.5 rounded-full text-[9px] uppercase tracking-[0.06em] font-bold ${
                    live
                      ? "bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)]"
                      : "bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[var(--chrome-fg-muted)]"
                  }`}
                >
                  {live ? "Live" : "Soon"}
                </span>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 ? (
          <li className="text-[12px] text-[var(--chrome-fg-subtle)] px-1 py-2">
            Nothing matches.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
