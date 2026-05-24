"use client";

// Per-site style guide list. The active guide drives the canvas tokens.
// In-builder editing of the guide is deferred to a follow-up commit; for
// now this panel just shows which guides exist on the site and lets the
// user switch the active one.

export default function StylePanel({ guides, activeGuideId, onSelect }) {
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
  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="px-1 text-[10px] uppercase tracking-[0.18em] text-[var(--chrome-fg-subtle)] font-semibold">
        Site style guides
      </p>
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
      <p
        className="text-[11px] text-[var(--chrome-fg-subtle)] mt-2 px-1"
        style={{ textTransform: "none", letterSpacing: "normal" }}
      >
        Editing this style guide in the builder is coming soon. For now, set up
        your guide in the onboarding wizard.
      </p>
    </div>
  );
}
