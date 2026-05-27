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
  autoControl = null,
  onChange,
  onPlayAnimation,
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
  const autoValue = autoControl
    ? Boolean(props[autoControl.key] ?? autoControl.defaultValue)
    : false;
  const visibleControls =
    panel === "animation" && autoControl
      ? controls.filter((control) => control.key !== autoControl.key)
      : controls;
  const groupedControls =
    panel === "styles"
      ? groupStyleControls(visibleControls)
      : panel === "animation"
        ? groupAnimationControls(visibleControls)
        : null;

  return (
    <div className="flex h-full flex-col overflow-hidden border-l border-[var(--chrome-border)] bg-[var(--chrome-surface)]">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--chrome-border)] px-5">
        <div className="min-w-0">
          <p className="truncate text-[16px] font-medium text-[var(--chrome-fg)]">
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
        {panel === "animation" && autoControl ? (
          <button
            type="button"
            onClick={() => setField(autoControl.key, !autoValue)}
            className={`btn-chrome btn-chrome--block ${
              autoValue ? "" : "btn-chrome--ghost"
            }`}
            aria-pressed={autoValue}
          >
            Auto play {autoValue ? "On" : "Off"}
          </button>
        ) : null}
        {panel === "animation" && !autoControl ? (
          <button
            type="button"
            onClick={onPlayAnimation}
            className="btn-chrome btn-chrome--block"
          >
            Play animation
          </button>
        ) : null}
        {visibleControls.length === 0 ? (
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
                <summary className="cursor-pointer px-4 py-3 text-[16px] font-medium text-[var(--chrome-fg)]">
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
          : visibleControls.map((control) => (
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

function groupAnimationControls(controls) {
  const presetControl = controls.find(isPresetSelector);
  const remaining = controls.filter((control) => control !== presetControl);
  const globalControls = remaining.filter(isGlobalAnimationControl);
  const presetGroups = [];
  for (const control of remaining) {
    if (isGlobalAnimationControl(control)) continue;
    const id = control.group || "presetControls";
    let group = presetGroups.find((item) => item.id === id);
    if (!group) {
      group = { id, label: humanizeGroup(id), open: false, controls: [] };
      presetGroups.push(group);
    }
    group.controls.push(control);
  }
  return [
    presetControl
      ? {
          id: "animationPreset",
          label: "Animation preset",
          open: true,
          controls: [presetControl],
        }
      : null,
    globalControls.length
      ? {
          id: "animationGlobal",
          label: "Global controls",
          open: true,
          controls: globalControls,
        }
      : null,
    ...presetGroups,
  ].filter(Boolean);
}

function isPresetSelector(control) {
  if (control?.type !== "select") return false;
  return /preset|style/i.test(`${control.key ?? ""} ${control.label ?? ""}`);
}

function isGlobalAnimationControl(control) {
  const group = String(control?.group ?? "").toLowerCase();
  if (group === "global" || group === "shared") return true;
  if (group) return false;
  return !isPresetSelector(control);
}

function humanizeGroup(id) {
  return String(id)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
