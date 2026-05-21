"use client";

import { RADIUS_TOKENS } from "../../../../lib/styleguide-defaults.js";
import { Field, TextInput, NumberInput, SelectInput, Stack } from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

const COLOR_OPTIONS = [["light", "Light"], ["dark", "Dark"], ["brand", "Brand"]];
const RADIUS_OPTIONS = RADIUS_TOKENS.map(([k, l]) => [k, l]);

export default function ButtonEditor({ value, onChange }) {
  const set = (path, v) => {
    const next = structuredClone(value);
    let cur = next;
    const parts = path.split(".");
    for (let i = 0; i < parts.length - 1; i++) {
      cur[parts[i]] = cur[parts[i]] ?? {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = v;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <GroupHeading>Padding</GroupHeading>
        <Stack cols={2}>
          <Field label="Desktop (em)" htmlFor="btn-p-d">
            <TextInput
              id="btn-p-d"
              value={value?.padding?.desktop}
              onChange={(v) => set("padding.desktop", v)}
              placeholder="0.875em 1.5em"
            />
          </Field>
          <Field label="Mobile (rem)" htmlFor="btn-p-m">
            <TextInput
              id="btn-p-m"
              value={value?.padding?.mobile}
              onChange={(v) => set("padding.mobile", v)}
              placeholder="0.875rem 1.5rem"
            />
          </Field>
        </Stack>
      </div>

      <div>
        <GroupHeading>Default state</GroupHeading>
        <Stack cols={3}>
          <Field label="Background" htmlFor="btn-bg">
            <SelectInput
              id="btn-bg"
              value={value?.background}
              onChange={(v) => set("background", v)}
              options={COLOR_OPTIONS}
            />
          </Field>
          <Field label="Foreground" htmlFor="btn-fg">
            <SelectInput
              id="btn-fg"
              value={value?.foreground}
              onChange={(v) => set("foreground", v)}
              options={COLOR_OPTIONS}
            />
          </Field>
          <Field label="Radius" htmlFor="btn-r">
            <SelectInput
              id="btn-r"
              value={value?.radius}
              onChange={(v) => set("radius", v)}
              options={RADIUS_OPTIONS}
            />
          </Field>
        </Stack>
      </div>

      <div>
        <GroupHeading>Border</GroupHeading>
        <Stack cols={3}>
          <Field label="Color" htmlFor="btn-b-c">
            <SelectInput
              id="btn-b-c"
              value={value?.border?.color}
              onChange={(v) => set("border.color", v)}
              options={COLOR_OPTIONS}
            />
          </Field>
          <Field label="Width" htmlFor="btn-b-w">
            <TextInput
              id="btn-b-w"
              value={value?.border?.width}
              onChange={(v) => set("border.width", v)}
              placeholder="1px"
            />
          </Field>
          <Field label="Opacity (0–1)" htmlFor="btn-b-o">
            <NumberInput
              id="btn-b-o"
              value={value?.border?.opacity}
              onChange={(v) => set("border.opacity", v)}
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
          <Field label="Background" htmlFor="btn-h-bg">
            <SelectInput
              id="btn-h-bg"
              value={value?.hover?.background}
              onChange={(v) => set("hover.background", v)}
              options={COLOR_OPTIONS}
            />
          </Field>
          <Field label="Foreground" htmlFor="btn-h-fg">
            <SelectInput
              id="btn-h-fg"
              value={value?.hover?.foreground}
              onChange={(v) => set("hover.foreground", v)}
              options={COLOR_OPTIONS}
            />
          </Field>
        </Stack>
      </div>
    </div>
  );
}
