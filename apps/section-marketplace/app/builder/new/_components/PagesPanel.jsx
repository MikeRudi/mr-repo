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
    <div className="flex flex-col gap-4 p-4">
      <button
        type="button"
        onClick={onAdd}
        className="btn-chrome btn-chrome--block"
      >
        + Add page
      </button>

      <ul className="flex flex-col gap-2">
        {pages.map((p) => {
          const active = p.id === activePageId;
          return (
            <li
              key={p.id}
              className={`rounded-[0.25rem] border p-4 transition-colors ${
                active
                  ? "bg-[var(--chrome-ground)] border-[var(--chrome-border-strong)]"
                  : "bg-[var(--chrome-ground)] border-[var(--chrome-border)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                    className={`text-[16px] font-normal ${
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
                    className="text-[16px] text-[var(--chrome-fg-subtle)] hover:text-[var(--chrome-fg)]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <input
                type="text"
                value={p.name}
                onChange={(e) => onRename(p.id, e.target.value)}
                className="app-input mb-2 w-full px-3"
                aria-label="Page name"
              />
              <input
                type="text"
                value={p.slug}
                onChange={(e) => onReslug(p.id, e.target.value)}
                className="app-input w-full px-3 font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-muted)]"
                aria-label="Page slug"
              />
              <p className="mt-2 text-[16px] text-[var(--chrome-fg-subtle)]">
                {p.sections.length} section{p.sections.length === 1 ? "" : "s"}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
