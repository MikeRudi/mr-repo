"use client";

export default function PagesPanel({
  pages,
  activePageId,
  onSelect,
  onAdd,
  onRename,
  onReslug,
  onRemove,
}) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <button
        type="button"
        onClick={onAdd}
        className="h-9 rounded-[8px] bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)] text-[12px] font-medium"
      >
        + Add page
      </button>

      <ul className="flex flex-col gap-2">
        {pages.map((p) => {
          const active = p.id === activePageId;
          return (
            <li
              key={p.id}
              className={`rounded-[10px] border p-3 transition-colors ${
                active
                  ? "bg-[var(--chrome-ground)] border-[var(--chrome-border-strong)]"
                  : "bg-[var(--chrome-ground)] border-[var(--chrome-border)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className={`text-[12px] font-bold uppercase tracking-[0.04em] ${
                    active ? "text-[var(--chrome-fg)]" : "text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)]"
                  }`}
                >
                  {active ? "● " : ""}
                  {p.name}
                </button>
                {pages.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => onRemove(p.id)}
                    className="text-[11px] text-[var(--chrome-fg-subtle)] hover:text-[var(--chrome-fg)]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <input
                type="text"
                value={p.name}
                onChange={(e) => onRename(p.id, e.target.value)}
                className="w-full h-8 px-2 rounded-[6px] bg-[var(--chrome-surface)] border border-[var(--chrome-border)] text-[12px] mb-1.5"
                aria-label="Page name"
              />
              <input
                type="text"
                value={p.slug}
                onChange={(e) => onReslug(p.id, e.target.value)}
                className="w-full h-8 px-2 rounded-[6px] bg-[var(--chrome-surface)] border border-[var(--chrome-border)] text-[11px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-muted)]"
                aria-label="Page slug"
              />
              <p className="text-[10px] text-[var(--chrome-fg-subtle)] mt-1.5">
                {p.sections.length} section{p.sections.length === 1 ? "" : "s"}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
