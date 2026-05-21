"use client";

import { useState } from "react";
import { TYPOGRAPHY_SCALES } from "../../../../lib/styleguide-defaults.js";
import {
  Field,
  TextInput,
  NumberInput,
  SelectInput,
  Stack,
  FilterPills,
} from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

const FAMILY_OPTIONS = [
  ["primary",   "Primary"],
  ["secondary", "Secondary"],
  ["tertiary",  "Tertiary"],
];

export default function TypographyEditor({ value, fonts, onChange, onFontsChange }) {
  const [active, setActive] = useState(TYPOGRAPHY_SCALES[0][0]);
  const scale = value?.[active] ?? { desktop: {}, mobile: {} };

  const setScale = (bp, key, v) => {
    onChange({
      ...value,
      [active]: {
        ...value[active],
        [bp]: { ...value[active][bp], [key]: v },
      },
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <FilterPills
        items={TYPOGRAPHY_SCALES.map(([id, label]) => ({ id, label }))}
        activeId={active}
        onSelect={setActive}
      />

      <BreakpointBlock label="Desktop (≥ 992px)">
        <Stack cols={2}>
          <Field label="Font family" htmlFor={`t-${active}-d-fam`}>
            <SelectInput
              id={`t-${active}-d-fam`}
              value={scale.desktop?.family}
              onChange={(v) => setScale("desktop", "family", v)}
              options={FAMILY_OPTIONS}
            />
          </Field>
          <Field label="Font weight" htmlFor={`t-${active}-d-w`}>
            <NumberInput
              id={`t-${active}-d-w`}
              value={scale.desktop?.weight}
              onChange={(v) => setScale("desktop", "weight", v)}
              min={100}
              max={900}
              step={50}
            />
          </Field>
          <Field label="Font size" htmlFor={`t-${active}-d-s`}>
            <NumberInput
              id={`t-${active}-d-s`}
              value={scale.desktop?.size}
              onChange={(v) => setScale("desktop", "size", v)}
              suffix="px"
            />
          </Field>
          <Field label="Line height" htmlFor={`t-${active}-d-lh`}>
            <NumberInput
              id={`t-${active}-d-lh`}
              value={scale.desktop?.lineHeight}
              onChange={(v) => setScale("desktop", "lineHeight", v)}
              min={0.8}
              max={3}
              step={0.01}
            />
          </Field>
          <Field label="Letter spacing" htmlFor={`t-${active}-d-ls`}>
            <NumberInput
              id={`t-${active}-d-ls`}
              value={scale.desktop?.letterSpacing}
              onChange={(v) => setScale("desktop", "letterSpacing", v)}
              min={-0.2}
              max={0.5}
              step={0.001}
              suffix="em"
            />
          </Field>
        </Stack>
      </BreakpointBlock>

      <BreakpointBlock label="Mobile (< 992px)">
        <Stack cols={2}>
          <Field label="Font family" htmlFor={`t-${active}-m-fam`}>
            <SelectInput
              id={`t-${active}-m-fam`}
              value={scale.mobile?.family}
              onChange={(v) => setScale("mobile", "family", v)}
              options={FAMILY_OPTIONS}
            />
          </Field>
          <Field label="Font weight" htmlFor={`t-${active}-m-w`}>
            <NumberInput
              id={`t-${active}-m-w`}
              value={scale.mobile?.weight}
              onChange={(v) => setScale("mobile", "weight", v)}
              min={100}
              max={900}
              step={50}
            />
          </Field>
          <Field label="Font size" htmlFor={`t-${active}-m-s`}>
            <NumberInput
              id={`t-${active}-m-s`}
              value={scale.mobile?.size}
              onChange={(v) => setScale("mobile", "size", v)}
              suffix="px"
            />
          </Field>
          <Field label="Line height" htmlFor={`t-${active}-m-lh`}>
            <NumberInput
              id={`t-${active}-m-lh`}
              value={scale.mobile?.lineHeight}
              onChange={(v) => setScale("mobile", "lineHeight", v)}
              min={0.8}
              max={3}
              step={0.01}
            />
          </Field>
          <Field label="Letter spacing" htmlFor={`t-${active}-m-ls`}>
            <NumberInput
              id={`t-${active}-m-ls`}
              value={scale.mobile?.letterSpacing}
              onChange={(v) => setScale("mobile", "letterSpacing", v)}
              min={-0.2}
              max={0.5}
              step={0.001}
              suffix="em"
            />
          </Field>
        </Stack>
      </BreakpointBlock>

      <div>
        <GroupHeading>Font stacks</GroupHeading>
        <p className="text-[11px] text-[var(--chrome-fg-subtle)] mb-3">
          Three named stacks. Every typography scale references one of these.
        </p>
        <Stack cols={1}>
          {FAMILY_OPTIONS.map(([key, label]) => (
            <Field key={key} label={label} htmlFor={`f-${key}`}>
              <TextInput
                id={`f-${key}`}
                value={fonts?.[key] ?? ""}
                onChange={(v) => onFontsChange({ ...fonts, [key]: v })}
                placeholder='Lay Grotesk, "Inter Variable", system-ui, sans-serif'
              />
            </Field>
          ))}
        </Stack>
      </div>
    </div>
  );
}

function BreakpointBlock({ label, children }) {
  return (
    <div>
      <GroupHeading>{label}</GroupHeading>
      {children}
    </div>
  );
}
