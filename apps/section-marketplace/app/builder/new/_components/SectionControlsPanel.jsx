"use client";

import { ControlField } from "./InspectorPanel.jsx";

const PANEL_TITLES = {
  styles: "Styles",
  animation: "Animation",
  typography: "Typography",
};

export default function SectionControlsPanel({
  name,
  panel,
  controls = [],
  props = {},
  context = {},
  onChange,
  onClose,
}) {
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
        {controls.map((control) => (
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
