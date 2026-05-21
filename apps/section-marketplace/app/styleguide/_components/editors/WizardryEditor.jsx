"use client";

import { Field, NumberInput } from "../Fields.jsx";

export default function WizardryEditor({ value, onChange }) {
  const w = value ?? {};
  const set = (path, v) => {
    const next = structuredClone(w);
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
    <div className="flex flex-col gap-4 max-w-[320px]">
      <Field
        label="Container max-width"
        hint="The max content width applied via .sg-container. The fluid rem on desktop is anchored to this width — at the max viewport, 1rem = 16px."
        htmlFor="w-maxw"
      >
        <NumberInput
          id="w-maxw"
          value={w.container?.maxWidth}
          onChange={(v) => set("container.maxWidth", v)}
          suffix="px"
        />
      </Field>
    </div>
  );
}
