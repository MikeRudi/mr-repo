"use client";

import { Field, NumberInput, Stack } from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

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

  const desktopVw = formula(w.rem?.desktop);
  const mobileVw = formula(w.rem?.mobile);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <GroupHeading>Container</GroupHeading>
        <Stack cols={2}>
          <Field
            label="Max width"
            hint="The max content width applied via .sg-container."
            htmlFor="w-maxw"
          >
            <NumberInput
              id="w-maxw"
              value={w.container?.maxWidth}
              onChange={(v) => set("container.maxWidth", v)}
              suffix="px"
            />
          </Field>
          <Field
            label="Tablet breakpoint"
            hint="Below this viewport width the mobile rem range takes over."
            htmlFor="w-bp"
          >
            <NumberInput
              id="w-bp"
              value={w.breakpoint?.tablet}
              onChange={(v) => set("breakpoint.tablet", v)}
              suffix="px"
            />
          </Field>
        </Stack>
      </div>

      <div>
        <GroupHeading>Desktop fluid rem (≥ tablet breakpoint)</GroupHeading>
        <Stack cols={2}>
          <Field label="Anchor viewport" htmlFor="d-vw">
            <NumberInput
              id="d-vw"
              value={w.rem?.desktop?.anchorViewport}
              onChange={(v) => set("rem.desktop.anchorViewport", v)}
              suffix="px"
            />
          </Field>
          <Field label="Anchor rem" htmlFor="d-rem">
            <NumberInput
              id="d-rem"
              value={w.rem?.desktop?.anchorRem}
              onChange={(v) => set("rem.desktop.anchorRem", v)}
              suffix="px"
            />
          </Field>
        </Stack>
        <p className="mt-2 text-[11px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-subtle)]">
          :root → font-size: {desktopVw};  (capped at {w.rem?.desktop?.anchorRem}px above {w.rem?.desktop?.anchorViewport}px)
        </p>
      </div>

      <div>
        <GroupHeading>Mobile fluid rem (&lt; tablet breakpoint)</GroupHeading>
        <Stack cols={2}>
          <Field label="Anchor viewport" htmlFor="m-vw">
            <NumberInput
              id="m-vw"
              value={w.rem?.mobile?.anchorViewport}
              onChange={(v) => set("rem.mobile.anchorViewport", v)}
              suffix="px"
            />
          </Field>
          <Field label="Anchor rem" htmlFor="m-rem">
            <NumberInput
              id="m-rem"
              value={w.rem?.mobile?.anchorRem}
              onChange={(v) => set("rem.mobile.anchorRem", v)}
              suffix="px"
            />
          </Field>
        </Stack>
        <p className="mt-2 text-[11px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg-subtle)]">
          @media (max-width: {(w.breakpoint?.tablet ?? 992) - 0.02}px) → font-size: {mobileVw};
        </p>
      </div>
    </div>
  );
}

function formula(r) {
  if (!r?.anchorRem || !r?.anchorViewport) return "—";
  const vw = (Number(r.anchorRem) / Number(r.anchorViewport)) * 100;
  return `${Number(vw.toFixed(4))}vw`;
}
