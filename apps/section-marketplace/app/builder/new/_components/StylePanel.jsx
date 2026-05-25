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
      <div className="p-4">
        <p
          className="app-text"
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
    <div className="flex flex-col gap-4 p-4">
      <p className="app-eyebrow px-1">
        Site style guides
      </p>
      {activeGuide ? (
        <div className="app-panel flex flex-col gap-3 bg-[var(--chrome-ground)] p-4">
          <label
            htmlFor="active-guide-name"
            className="app-eyebrow"
          >
            Active guide
          </label>
          <input
            id="active-guide-name"
            type="text"
            value={activeGuide.name}
            onChange={(e) => onRenameActive(e.target.value)}
            className="app-input px-3"
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
