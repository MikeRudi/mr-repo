"use client";

import { ControlField } from "./InspectorPanel.jsx";

const PANEL_TITLES = {
  styles: "Styles",
  animation: "Animation",
};

const STYLE_GROUPS = [
  ["typography", "Typography"],
  ["layout", "Layout"],
  ["color", "Color"],
  ["spacing", "Spacing"],
];

export default function SectionControlsPanel({
  name,
  panel,
  controls = [],
  props = {},
  context = {},
  onChange,
  onClose,
}) {
  const groupedControls = panel === "styles" ? groupStyleControls(controls) : null;

  const setField = (key, value) => {
    const next = { ...props };
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
    onChange(next);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border-l border-[var(--chrome-border)] bg-[var(--chrome-surface)]">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--chrome-border)] px-5">
        <div className="min-w-0">
          <p className="app-subtitle truncate">
            {PANEL_TITLES[panel] ?? "Controls"}
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
          aria-label={`Close ${PANEL_TITLES[panel] ?? "controls"} panel`}
        >
          x
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        {controls.length === 0 ? (
          <p
            className="app-text"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            No controls in this panel yet.
          </p>
        ) : null}
        {groupedControls
          ? groupedControls.map((group) => (
              <details
                key={group.id}
                open={group.open}
                className="app-panel bg-[var(--chrome-ground)]"
              >
                <summary className="app-subtitle cursor-pointer px-4 py-3">
                  {group.label}
                </summary>
                <div className="flex flex-col gap-5 border-t border-[var(--chrome-border)] p-4">
                  {group.controls.map((control) => (
                    <ControlField
                      key={control.key}
                      control={control}
                      value={props[control.key]}
                      context={context}
                      onChange={(value) => setField(control.key, value)}
                    />
                  ))}
                </div>
              </details>
            ))
          : controls.map((control) => (
              <ControlField
                key={control.key}
                control={control}
                value={props[control.key]}
                context={context}
                onChange={(value) => setField(control.key, value)}
              />
            ))}
      </div>
    </div>
  );
}

function groupStyleControls(controls) {
  return STYLE_GROUPS.map(([id, label]) => ({
    id,
    label,
    open: false,
    controls: controls.filter((control) => control.group === id),
  })).filter((group) => group.controls.length > 0);
}
