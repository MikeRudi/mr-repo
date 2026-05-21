"use client";

import { SPACING_TOKENS } from "../../../../lib/styleguide-defaults.js";
import { Field, NumberInput, Stack } from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

export default function SpacingEditor({ value, onChange }) {
  const set = (key, bp, v) =>
    onChange({
      ...value,
      [key]: { ...value[key], [bp]: v },
    });

  return (
    <div className="flex flex-col gap-6">
      {SPACING_TOKENS.map(([key, label]) => (
        <div key={key}>
          <GroupHeading>{label}</GroupHeading>
          <Stack cols={2}>
            <Field label="Desktop" htmlFor={`sp-${key}-d`}>
              <NumberInput
                id={`sp-${key}-d`}
                value={value?.[key]?.desktop}
                onChange={(v) => set(key, "desktop", v)}
                suffix="px"
              />
            </Field>
            <Field label="Mobile" htmlFor={`sp-${key}-m`}>
              <NumberInput
                id={`sp-${key}-m`}
                value={value?.[key]?.mobile}
                onChange={(v) => set(key, "mobile", v)}
                suffix="px"
              />
            </Field>
          </Stack>
        </div>
      ))}
    </div>
  );
}
