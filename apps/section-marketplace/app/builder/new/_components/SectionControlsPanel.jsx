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
      <header className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-[var(--chrome-border)] px-4">
        <div className="min-w-0">
          <p className="truncate text-[11px] tracking-[0.06em] text-[var(--chrome-fg)]">
            {PANEL_TITLES[panel] ?? "Controls"}
          </p>
          <p
            className="truncate text-[10px] text-[var(--chrome-fg-subtle)]"
            style={{ textTransform: "none", letterSpacing: "normal" }}
          >
            {name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-[6px] text-[12px] text-[var(--chrome-fg-muted)] hover:bg-[var(--chrome-ground)] hover:text-[var(--chrome-fg)]"
          aria-label={`Close ${PANEL_TITLES[panel] ?? "controls"} panel`}
        >
          x
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
        {controls.length === 0 ? (
          <p
            className="text-[12px] text-[var(--chrome-fg-muted)]"
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
                className="rounded-[8px] border border-[var(--chrome-border)] bg-[var(--chrome-ground)]"
              >
                <summary className="cursor-pointer px-3 py-2 text-[11px] tracking-[0.06em] text-[var(--chrome-fg)]">
                  {group.label}
                </summary>
                <div className="flex flex-col gap-5 border-t border-[var(--chrome-border)] p-3">
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
  return STYLE_GROUPS.map(([id, label], index) => ({
    id,
    label,
    open: index === 0,
    controls: controls.filter((control) => control.group === id),
  })).filter((group) => group.controls.length > 0);
}
