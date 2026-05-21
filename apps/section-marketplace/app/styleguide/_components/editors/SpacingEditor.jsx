"use client";

import { SPACING_TOKENS } from "../../../../lib/styleguide-defaults.js";
import { Field, TextInput, Stack } from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

export default function SpacingEditor({ value, onChange }) {
  const set = (key, bp, v) =>
    onChange({
      ...value,
      [key]: { ...value[key], [bp]: v },
    });

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[12px] text-[var(--chrome-fg-muted)] leading-relaxed -mt-1">
        Desktop values are in <code className="font-[family-name:var(--chrome-font-mono)]">em</code> so they scale with the fluid rem.
        Mobile values are in <code className="font-[family-name:var(--chrome-font-mono)]">rem</code> so they stay anchored to the html font-size below the tablet breakpoint.
      </p>
      {SPACING_TOKENS.map(([key, label]) => (
        <div key={key}>
          <GroupHeading>{label}</GroupHeading>
          <Stack cols={2}>
            <Field label="Desktop (em)" htmlFor={`sp-${key}-d`}>
              <TextInput
                id={`sp-${key}-d`}
                value={value?.[key]?.desktop}
                onChange={(v) => set(key, "desktop", v)}
                placeholder="6em"
              />
            </Field>
            <Field label="Mobile (rem)" htmlFor={`sp-${key}-m`}>
              <TextInput
                id={`sp-${key}-m`}
                value={value?.[key]?.mobile}
                onChange={(v) => set(key, "mobile", v)}
                placeholder="3rem"
              />
            </Field>
          </Stack>
        </div>
      ))}
    </div>
  );
}
