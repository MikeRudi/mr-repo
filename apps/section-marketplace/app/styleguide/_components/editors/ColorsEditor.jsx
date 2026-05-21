"use client";

import { Field, ColorInput, Stack } from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

const TOKENS = [
  ["light", "Light",  "A white. The page background in light surfaces."],
  ["dark",  "Dark",   "A black. The default foreground in light surfaces."],
  ["brand", "Brand",  "The primary accent. Used for emphasis, hovers, and CTAs."],
];

export default function ColorsEditor({ value, onChange }) {
  const set = (key, v) => onChange({ ...value, [key]: v });
  return (
    <div className="flex flex-col gap-6">
      <Stack cols={1}>
        {TOKENS.map(([k, label, hint]) => (
          <Field key={k} label={label} hint={hint} htmlFor={`c-${k}`}>
            <ColorInput
              id={`c-${k}`}
              value={value?.[k]}
              onChange={(v) => set(k, v)}
            />
          </Field>
        ))}
      </Stack>
      <div>
        <GroupHeading>How variants work</GroupHeading>
        <p className="text-[12px] text-[var(--chrome-fg-muted)] leading-relaxed">
          Only these three are stored. The builder UI generates opacity, tint,
          and shade variants at the point of use — never persisted, so the
          palette stays small and editable.
        </p>
      </div>
    </div>
  );
}
