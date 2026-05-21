"use client";

import { useState } from "react";
import { TYPOGRAPHY_SCALES } from "../../../../lib/styleguide-defaults.js";
import { Field, TextInput, NumberInput, SelectInput, Stack } from "../Fields.jsx";

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

  const familyOptions = [
    ...Object.keys(fonts ?? {}).map((k) => [k, `${k} — ${truncate(fonts[k])}`]),
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Scale picker */}
      <div
        role="tablist"
        aria-label="Typography scale"
        className="flex flex-wrap gap-1.5"
      >
        {TYPOGRAPHY_SCALES.map(([key, label]) => {
          const sel = key === active;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={sel}
              onClick={() => setActive(key)}
              className={`inline-flex items-center h-7 px-2.5 rounded-full text-[11px] uppercase tracking-[0.08em] border transition-colors ${
                sel
                  ? "bg-[var(--chrome-fg)] border-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)]"
                  : "bg-[var(--chrome-ground)] border-[var(--chrome-border)] text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Desktop */}
      <BreakpointBlock label="Desktop (≥ tablet)">
        <Stack cols={2}>
          <Field label="Font family" htmlFor={`t-${active}-d-fam`}>
            <SelectInput
              id={`t-${active}-d-fam`}
              value={scale.desktop?.family}
              onChange={(v) => setScale("desktop", "family", v)}
              options={familyOptions}
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
          <Field label="Font size (rem)" htmlFor={`t-${active}-d-s`}>
            <TextInput
              id={`t-${active}-d-s`}
              value={scale.desktop?.size}
              onChange={(v) => setScale("desktop", "size", v)}
              placeholder="2rem"
            />
          </Field>
          <Field label="Line height (unitless)" htmlFor={`t-${active}-d-lh`}>
            <NumberInput
              id={`t-${active}-d-lh`}
              value={scale.desktop?.lineHeight}
              onChange={(v) => setScale("desktop", "lineHeight", v)}
              min={0.8}
              max={3}
              step={0.01}
            />
          </Field>
          <Field label="Letter spacing (em)" htmlFor={`t-${active}-d-ls`}>
            <TextInput
              id={`t-${active}-d-ls`}
              value={scale.desktop?.letterSpacing}
              onChange={(v) => setScale("desktop", "letterSpacing", v)}
              placeholder="-0.01em"
            />
          </Field>
        </Stack>
      </BreakpointBlock>

      {/* Mobile */}
      <BreakpointBlock label="Mobile (< tablet)">
        <Stack cols={2}>
          <Field label="Font family" htmlFor={`t-${active}-m-fam`}>
            <SelectInput
              id={`t-${active}-m-fam`}
              value={scale.mobile?.family}
              onChange={(v) => setScale("mobile", "family", v)}
              options={familyOptions}
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
          <Field label="Font size (rem)" htmlFor={`t-${active}-m-s`}>
            <TextInput
              id={`t-${active}-m-s`}
              value={scale.mobile?.size}
              onChange={(v) => setScale("mobile", "size", v)}
              placeholder="1.5rem"
            />
          </Field>
          <Field label="Line height (unitless)" htmlFor={`t-${active}-m-lh`}>
            <NumberInput
              id={`t-${active}-m-lh`}
              value={scale.mobile?.lineHeight}
              onChange={(v) => setScale("mobile", "lineHeight", v)}
              min={0.8}
              max={3}
              step={0.01}
            />
          </Field>
          <Field label="Letter spacing (em)" htmlFor={`t-${active}-m-ls`}>
            <TextInput
              id={`t-${active}-m-ls`}
              value={scale.mobile?.letterSpacing}
              onChange={(v) => setScale("mobile", "letterSpacing", v)}
              placeholder="0em"
            />
          </Field>
        </Stack>
      </BreakpointBlock>

      <BreakpointBlock label="Font stacks">
        <p className="text-[11px] text-[var(--chrome-fg-subtle)] mb-3">
          Stacks are referenced by name from every scale above.
        </p>
        <Stack cols={1}>
          {Object.entries(fonts ?? {}).map(([key, stack]) => (
            <Field key={key} label={key} htmlFor={`f-${key}`}>
              <TextInput
                id={`f-${key}`}
                value={stack}
                onChange={(v) => onFontsChange({ ...fonts, [key]: v })}
                placeholder="Lay Grotesk, Inter, system-ui, sans-serif"
              />
            </Field>
          ))}
        </Stack>
      </BreakpointBlock>
    </div>
  );
}

function BreakpointBlock({ label, children }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--chrome-fg-subtle)] mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}

function truncate(s, max = 28) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
