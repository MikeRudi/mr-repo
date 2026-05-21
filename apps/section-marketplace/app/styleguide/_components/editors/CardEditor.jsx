"use client";

import { RADIUS_TOKENS } from "../../../../lib/styleguide-defaults.js";
import { Field, TextInput, NumberInput, SelectInput, Stack } from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

const COLOR_OPTIONS = [["light", "Light"], ["dark", "Dark"], ["brand", "Brand"]];
const RADIUS_OPTIONS = RADIUS_TOKENS.map(([k, l]) => [k, l]);

export default function CardEditor({ value, onChange }) {
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
          <Field label="Desktop (em)" htmlFor="card-p-d">
            <TextInput
              id="card-p-d"
              value={value?.padding?.desktop}
              onChange={(v) => set("padding.desktop", v)}
              placeholder="1.75em"
            />
          </Field>
          <Field label="Mobile (rem)" htmlFor="card-p-m">
            <TextInput
              id="card-p-m"
              value={value?.padding?.mobile}
              onChange={(v) => set("padding.mobile", v)}
              placeholder="1.25rem"
            />
          </Field>
        </Stack>
      </div>

      <div>
        <GroupHeading>Surface</GroupHeading>
        <Stack cols={3}>
          <Field label="Background" htmlFor="card-bg">
            <SelectInput
              id="card-bg"
              value={value?.background}
              onChange={(v) => set("background", v)}
              options={COLOR_OPTIONS}
            />
          </Field>
          <Field label="Foreground" htmlFor="card-fg">
            <SelectInput
              id="card-fg"
              value={value?.foreground}
              onChange={(v) => set("foreground", v)}
              options={COLOR_OPTIONS}
            />
          </Field>
          <Field label="Radius" htmlFor="card-r">
            <SelectInput
              id="card-r"
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
          <Field label="Color" htmlFor="card-b-c">
            <SelectInput
              id="card-b-c"
              value={value?.border?.color}
              onChange={(v) => set("border.color", v)}
              options={COLOR_OPTIONS}
            />
          </Field>
          <Field label="Width" htmlFor="card-b-w">
            <TextInput
              id="card-b-w"
              value={value?.border?.width}
              onChange={(v) => set("border.width", v)}
              placeholder="1px"
            />
          </Field>
          <Field label="Opacity (0–1)" htmlFor="card-b-o">
            <NumberInput
              id="card-b-o"
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
        <GroupHeading>Shadow</GroupHeading>
        <Field
          label="Box-shadow value"
          hint="Standard CSS box-shadow string. Use `none` to disable."
          htmlFor="card-sh"
        >
          <TextInput
            id="card-sh"
            value={value?.shadow}
            onChange={(v) => set("shadow", v)}
            placeholder="0 1px 2px rgba(0,0,0,0.04)"
          />
        </Field>
      </div>
    </div>
  );
}
