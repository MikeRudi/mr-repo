"use client";

import { RADIUS_TOKENS } from "../../../../lib/styleguide-defaults.js";
import { Field, TextInput, Stack } from "../Fields.jsx";
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
            <Field label="Desktop (em)" htmlFor={`r-${key}-d`}>
              <TextInput
                id={`r-${key}-d`}
                value={value?.[key]?.desktop}
                onChange={(v) => set(key, "desktop", v)}
                placeholder="0.5em"
              />
            </Field>
            <Field label="Mobile (rem)" htmlFor={`r-${key}-m`}>
              <TextInput
                id={`r-${key}-m`}
                value={value?.[key]?.mobile}
                onChange={(v) => set(key, "mobile", v)}
                placeholder="0.5rem"
              />
            </Field>
          </Stack>
        </div>
      ))}
    </div>
  );
}
