"use client";

import { RADIUS_TOKENS } from "../../../../lib/styleguide-defaults.js";
import {
  Field,
  TextInput,
  NumberInput,
  SelectInput,
  Stack,
  FilterPills,
} from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

const RADIUS_OPTIONS = RADIUS_TOKENS.map(([k, l]) => [k, l]);

export default function ButtonEditor({ value, colors, activeId, onActiveChange, onChange }) {
  const buttons = value ?? [];
  const idx = Math.max(0, buttons.findIndex((b) => b.id === activeId));
  const btn = buttons[idx] ?? buttons[0];

  const colorOptions = [
    ["transparent", "Transparent"],
    ...Object.keys(colors ?? {}).map((k) => [k, capitalize(k)]),
  ];

  const setActive = (path, v) => {
    const next = [...buttons];
    const updated = structuredClone(next[idx]);
    setDeep(updated, path, v);
    next[idx] = updated;
    onChange(next);
  };

  const addBtn = () => {
    const baseId = `btn-${buttons.length + 1}`;
    const newBtn = {
      ...structuredClone(buttons[0] ?? {}),
      id: baseId,
      name: `Button ${buttons.length + 1}`,
    };
    onChange([...buttons, newBtn]);
    onActiveChange(baseId);
  };

  const removeBtn = () => {
    if (buttons.length <= 1) return;
    const next = buttons.filter((b) => b.id !== btn.id);
    onChange(next);
    onActiveChange(next[0].id);
  };

  if (!btn) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <FilterPills
          items={buttons.map((b) => ({ id: b.id, label: b.name }))}
          activeId={btn.id}
          onSelect={onActiveChange}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addBtn}
            className="inline-flex items-center h-7 px-3 rounded-full border border-[var(--chrome-border)] text-[11px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
          >
            + Add
          </button>
          {buttons.length > 1 ? (
            <button
              type="button"
              onClick={removeBtn}
              className="inline-flex items-center h-7 px-3 rounded-full border border-[var(--chrome-border)] text-[11px] text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <Stack cols={2}>
        <Field label="Name" htmlFor={`b-${btn.id}-n`}>
          <TextInput
            id={`b-${btn.id}-n`}
            value={btn.name}
            onChange={(v) => setActive("name", v)}
            monospace={false}
          />
        </Field>
        <Field label="Slug" htmlFor={`b-${btn.id}-id`} hint="Used as the CSS class suffix.">
          <TextInput
            id={`b-${btn.id}-id`}
            value={btn.id}
            onChange={(v) => setActive("id", slugify(v))}
          />
        </Field>
      </Stack>

      <div>
        <GroupHeading>Padding</GroupHeading>
        <Stack cols={2}>
          <Field label="Vertical · desktop" htmlFor={`b-${btn.id}-pyd`}>
            <NumberInput
              id={`b-${btn.id}-pyd`}
              value={btn.padding?.desktop}
              onChange={(v) => setActive("padding.desktop", v)}
              suffix="px"
            />
          </Field>
          <Field label="Vertical · mobile" htmlFor={`b-${btn.id}-pym`}>
            <NumberInput
              id={`b-${btn.id}-pym`}
              value={btn.padding?.mobile}
              onChange={(v) => setActive("padding.mobile", v)}
              suffix="px"
            />
          </Field>
          <Field label="Horizontal · desktop" htmlFor={`b-${btn.id}-pxd`}>
            <NumberInput
              id={`b-${btn.id}-pxd`}
              value={btn.paddingX?.desktop}
              onChange={(v) => setActive("paddingX.desktop", v)}
              suffix="px"
            />
          </Field>
          <Field label="Horizontal · mobile" htmlFor={`b-${btn.id}-pxm`}>
            <NumberInput
              id={`b-${btn.id}-pxm`}
              value={btn.paddingX?.mobile}
              onChange={(v) => setActive("paddingX.mobile", v)}
              suffix="px"
            />
          </Field>
        </Stack>
      </div>

      <div>
        <GroupHeading>Default state</GroupHeading>
        <Stack cols={3}>
          <Field label="Background" htmlFor={`b-${btn.id}-bg`}>
            <SelectInput
              id={`b-${btn.id}-bg`}
              value={btn.background}
              onChange={(v) => setActive("background", v)}
              options={colorOptions}
            />
          </Field>
          <Field label="Foreground" htmlFor={`b-${btn.id}-fg`}>
            <SelectInput
              id={`b-${btn.id}-fg`}
              value={btn.foreground}
              onChange={(v) => setActive("foreground", v)}
              options={colorOptions}
            />
          </Field>
          <Field label="Radius" htmlFor={`b-${btn.id}-r`}>
            <SelectInput
              id={`b-${btn.id}-r`}
              value={btn.radius}
              onChange={(v) => setActive("radius", v)}
              options={RADIUS_OPTIONS}
            />
          </Field>
        </Stack>
      </div>

      <div>
        <GroupHeading>Border</GroupHeading>
        <Stack cols={3}>
          <Field label="Color" htmlFor={`b-${btn.id}-bc`}>
            <SelectInput
              id={`b-${btn.id}-bc`}
              value={btn.border?.color}
              onChange={(v) => setActive("border.color", v)}
              options={colorOptions}
            />
          </Field>
          <Field label="Width" htmlFor={`b-${btn.id}-bw`}>
            <NumberInput
              id={`b-${btn.id}-bw`}
              value={btn.border?.width}
              onChange={(v) => setActive("border.width", v)}
              suffix="px"
              min={0}
            />
          </Field>
          <Field label="Opacity" htmlFor={`b-${btn.id}-bo`}>
            <NumberInput
              id={`b-${btn.id}-bo`}
              value={btn.border?.opacity}
              onChange={(v) => setActive("border.opacity", v)}
              min={0}
              max={1}
              step={0.01}
            />
          </Field>
        </Stack>
      </div>

      <div>
        <GroupHeading>Hover state</GroupHeading>
        <Stack cols={2}>
          <Field label="Background" htmlFor={`b-${btn.id}-hbg`}>
            <SelectInput
              id={`b-${btn.id}-hbg`}
              value={btn.hover?.background}
              onChange={(v) => setActive("hover.background", v)}
              options={colorOptions}
            />
          </Field>
          <Field label="Foreground" htmlFor={`b-${btn.id}-hfg`}>
            <SelectInput
              id={`b-${btn.id}-hfg`}
              value={btn.hover?.foreground}
              onChange={(v) => setActive("hover.foreground", v)}
              options={colorOptions}
            />
          </Field>
        </Stack>
      </div>
    </div>
  );
}

function setDeep(obj, path, v) {
  let cur = obj;
  const parts = path.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] ?? {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = v;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
