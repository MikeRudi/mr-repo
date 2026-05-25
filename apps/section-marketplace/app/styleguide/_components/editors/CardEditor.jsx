"use client";

import { RADIUS_TOKENS } from "../../../../lib/styleguide-defaults.js";
import {
  Field,
  TextInput,
  NumberInput,
  SelectInput,
  Stack,
  FilterPills,
} from "../Fields.jsx";
import { GroupHeading } from "../SectionBlock.jsx";

const RADIUS_OPTIONS = RADIUS_TOKENS.map(([k, l]) => [k, l]);

export default function CardEditor({ value, colors, activeId, onActiveChange, onChange }) {
  const cards = value ?? [];
  const idx = Math.max(0, cards.findIndex((c) => c.id === activeId));
  const card = cards[idx] ?? cards[0];

  const colorOptions = Object.keys(colors ?? {}).map((k) => [k, capitalize(k)]);

  const setActive = (path, v) => {
    const next = [...cards];
    const updated = structuredClone(next[idx]);
    setDeep(updated, path, v);
    next[idx] = updated;
    onChange(next);
  };

  const addCard = () => {
    const baseId = `card-${cards.length + 1}`;
    const newCard = {
      ...structuredClone(cards[0] ?? {}),
      id: baseId,
      name: `Card ${cards.length + 1}`,
    };
    onChange([...cards, newCard]);
    onActiveChange(baseId);
  };

  const removeCard = () => {
    if (cards.length <= 1) return;
    const next = cards.filter((c) => c.id !== card.id);
    onChange(next);
    onActiveChange(next[0].id);
  };

  if (!card) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <FilterPills
          items={cards.map((c) => ({ id: c.id, label: c.name }))}
          activeId={card.id}
          onSelect={onActiveChange}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addCard}
            className="btn-chrome btn-chrome--ghost btn-chrome--sm"
          >
            + Add
          </button>
          {cards.length > 1 ? (
            <button
              type="button"
              onClick={removeCard}
              className="btn-chrome btn-chrome--ghost btn-chrome--sm"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <Stack cols={2}>
        <Field label="Name" htmlFor={`c-${card.id}-n`}>
          <TextInput
            id={`c-${card.id}-n`}
            value={card.name}
            onChange={(v) => setActive("name", v)}
            monospace={false}
          />
        </Field>
        <Field label="Slug" htmlFor={`c-${card.id}-id`} hint="Used as the CSS class suffix.">
          <TextInput
            id={`c-${card.id}-id`}
            value={card.id}
            onChange={(v) => setActive("id", slugify(v))}
          />
        </Field>
      </Stack>

      <div>
        <GroupHeading>Padding</GroupHeading>
        <Stack cols={2}>
          <Field label="Desktop" htmlFor={`c-${card.id}-pd`}>
            <NumberInput
              id={`c-${card.id}-pd`}
              value={card.padding?.desktop}
              onChange={(v) => setActive("padding.desktop", v)}
              suffix="px"
            />
          </Field>
          <Field label="Mobile" htmlFor={`c-${card.id}-pm`}>
            <NumberInput
              id={`c-${card.id}-pm`}
              value={card.padding?.mobile}
              onChange={(v) => setActive("padding.mobile", v)}
              suffix="px"
            />
          </Field>
        </Stack>
      </div>

      <div>
        <GroupHeading>Surface</GroupHeading>
        <Stack cols={3}>
          <Field label="Background" htmlFor={`c-${card.id}-bg`}>
            <SelectInput
              id={`c-${card.id}-bg`}
              value={card.background}
              onChange={(v) => setActive("background", v)}
              options={colorOptions}
            />
          </Field>
          <Field label="Foreground" htmlFor={`c-${card.id}-fg`}>
            <SelectInput
              id={`c-${card.id}-fg`}
              value={card.foreground}
              onChange={(v) => setActive("foreground", v)}
              options={colorOptions}
            />
          </Field>
          <Field label="Radius" htmlFor={`c-${card.id}-r`}>
            <SelectInput
              id={`c-${card.id}-r`}
              value={card.radius}
              onChange={(v) => setActive("radius", v)}
              options={RADIUS_OPTIONS}
            />
          </Field>
        </Stack>
      </div>

      <div>
        <GroupHeading>Border</GroupHeading>
        <Stack cols={3}>
          <Field label="Color" htmlFor={`c-${card.id}-bc`}>
            <SelectInput
              id={`c-${card.id}-bc`}
              value={card.border?.color}
              onChange={(v) => setActive("border.color", v)}
              options={colorOptions}
            />
          </Field>
          <Field label="Width" htmlFor={`c-${card.id}-bw`}>
            <NumberInput
              id={`c-${card.id}-bw`}
              value={card.border?.width}
              onChange={(v) => setActive("border.width", v)}
              suffix="px"
              min={0}
            />
          </Field>
          <Field label="Opacity" htmlFor={`c-${card.id}-bo`}>
            <NumberInput
              id={`c-${card.id}-bo`}
              value={card.border?.opacity}
              onChange={(v) => setActive("border.opacity", v)}
              min={0}
              max={1}
              step={0.01}
            />
          </Field>
        </Stack>
      </div>
    </div>
  );
}

function setDeep(obj, path, v) {
  let cur = obj;
  const parts = path.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] ?? {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = v;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
