"use client";

// Per-site style guide list. The active guide drives the canvas tokens and
// can be edited in-place from the builder.

export default function StylePanel({
  guides,
  activeGuideId,
  onSelect,
  onAdd,
  onEdit,
  onRenameActive,
}) {
  if (!guides || guides.length === 0) {
    return (
      <div className="p-3">
        <p
          className="text-[12px] text-[var(--chrome-fg-muted)]"
          style={{ textTransform: "none", letterSpacing: "normal" }}
        >
          No style guides on this site yet.
        </p>
      </div>
    );
  }
  const activeGuide =
    guides.find((g) => g.id === activeGuideId) ?? guides[0] ?? null;
  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="px-1 text-[10px] uppercase tracking-[0.18em] text-[var(--chrome-fg-subtle)] font-semibold">
        Site style guides
      </p>
      {activeGuide ? (
        <div className="flex flex-col gap-2 rounded-[8px] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] p-3">
          <label
            htmlFor="active-guide-name"
            className="text-[10px] uppercase tracking-[0.12em] text-[var(--chrome-fg-subtle)]"
          >
            Active guide
          </label>
          <input
            id="active-guide-name"
            type="text"
            value={activeGuide.name}
            onChange={(e) => onRenameActive(e.target.value)}
            className="h-9 px-2.5 rounded-[8px] bg-[var(--chrome-surface)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)]"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          />
          <button
            type="button"
            onClick={onEdit}
            className="btn-chrome btn-chrome--block"
          >
            Edit style guide
          </button>
        </div>
      ) : null}
      <ul className="flex flex-col gap-1.5">
        {guides.map((g) => {
          const active = g.id === activeGuideId;
          return (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => onSelect(g.id)}
                className={`btn-chrome btn-chrome--block ${
                  active ? "" : "btn-chrome--ghost"
                }`}
                style={{ justifyContent: "space-between" }}
              >
                <span className="truncate">{g.name}</span>
                <span aria-hidden>{active ? "●" : ""}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onAdd}
        className="btn-chrome btn-chrome--ghost btn-chrome--block"
      >
        + Add guide
      </button>
    </div>
  );
}
