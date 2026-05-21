"use client";

import { RADIUS_TOKENS } from "../../../../lib/styleguide-defaults.js";
import { Field, NumberInput, Stack } from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

export default function RadiiEditor({ value, onChange }) {
  const set = (key, bp, v) =>
    onChange({
      ...value,
      [key]: { ...value[key], [bp]: v },
    });

  return (
    <div className="flex flex-col gap-6">
      {RADIUS_TOKENS.map(([key, label]) => (
        <div key={key}>
          <GroupHeading>{label}</GroupHeading>
          <Stack cols={2}>
            <Field label="Desktop" htmlFor={`r-${key}-d`}>
              <NumberInput
                id={`r-${key}-d`}
                value={value?.[key]?.desktop}
                onChange={(v) => set(key, "desktop", v)}
                suffix="px"
              />
            </Field>
            <Field label="Mobile" htmlFor={`r-${key}-m`}>
              <NumberInput
                id={`r-${key}-m`}
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
