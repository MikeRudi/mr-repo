"use client";

import Link from "next/link";

export default function StylePanel({ guides, activeGuideId, loading, onSelect }) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)]">
        Active style guide
      </p>
      {loading ? (
        <p className="text-[12px] text-[var(--chrome-fg-subtle)]">Loading…</p>
      ) : guides.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[var(--chrome-border)] p-3">
          <p className="text-[12px] text-[var(--chrome-fg-muted)] mb-2">
            No saved style guides yet.
          </p>
          <Link
            href="/styleguide"
            target="_blank"
            className="inline-flex items-center h-8 px-3 rounded-full bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)] text-[11px]"
          >
            Open Style guide ↗
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {guides.map((g) => {
            const active = g.id === activeGuideId;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => onSelect(g.id)}
                  className={`w-full text-left px-3 py-2 rounded-[8px] border text-[12px] transition-colors ${
                    active
                      ? "bg-[var(--chrome-fg)] border-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)]"
                      : "bg-[var(--chrome-ground)] border-[var(--chrome-border)] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
                  }`}
                >
                  {active ? "● " : ""}
                  {g.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-t border-[var(--chrome-border)] pt-3 mt-1">
        <Link
          href="/styleguide"
          target="_blank"
          className="inline-flex items-center h-8 px-3 rounded-full border border-[var(--chrome-border)] text-[11px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
        >
          Edit style guide ↗
        </Link>
      </div>
    </div>
  );
}
