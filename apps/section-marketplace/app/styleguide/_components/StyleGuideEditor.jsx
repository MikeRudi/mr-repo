"use client";

import { useMemo, useState } from "react";
import { BASE_REM_PX } from "../../../lib/styleguide-defaults.js";
import { generateCss } from "../../../lib/styleguide-css.js";

import SectionBlock from "./SectionBlock.jsx";
import ColorsEditor from "./editors/ColorsEditor.jsx";
import TypographyEditor from "./editors/TypographyEditor.jsx";
import SpacingEditor from "./editors/SpacingEditor.jsx";
import RadiiEditor from "./editors/RadiiEditor.jsx";
import CardEditor from "./editors/CardEditor.jsx";
import ButtonEditor from "./editors/ButtonEditor.jsx";
import LinksEditor from "./editors/LinksEditor.jsx";
import {
  ColorsPreview,
  TypographyPreview,
  SpacingPreview,
  RadiiPreview,
  CardPreview,
  ButtonPreview,
  LinksPreview,
} from "./Previews.jsx";

// Container max-width is fixed at 1920 for everyone — no editor section.
const SECTIONS = [
  { id: "colors",     eyebrow: "01", title: "Colors" },
  { id: "typography", eyebrow: "02", title: "Typography" },
  { id: "spacing",    eyebrow: "03", title: "Spacing" },
  { id: "radii",      eyebrow: "04", title: "Border radius" },
  { id: "card",       eyebrow: "05", title: "Card" },
  { id: "button",     eyebrow: "06", title: "Button" },
  { id: "links",      eyebrow: "07", title: "Links" },
];

// Pure editor surface — no save buttons, no name input, no list dropdown.
// Owner of `tokens` state is the parent (the standalone /styleguide page,
// the onboarding wizard, or the builder Style tab in the future).
export default function StyleGuideEditor({ tokens, onChange }) {
  const [activeCardId, setActiveCardId] = useState(
    tokens?.cards?.[0]?.id ?? "default"
  );
  const [activeBtnId, setActiveBtnId] = useState(
    tokens?.buttons?.[0]?.id ?? "primary"
  );

  const update = (patch) => onChange({ ...tokens, ...patch });

  const scopedCss = useMemo(
    () => generateCss(tokens, ".sg-canvas", { scoped: true }),
    [tokens]
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav
          aria-label="Style guide sections"
          className="sticky top-24 flex flex-col gap-1"
        >
          <p className="app-eyebrow mb-3 px-3">
            Sections
          </p>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-[0.25rem] px-3 py-2 text-[16px] text-[var(--chrome-fg-muted)] hover:bg-[var(--chrome-surface)] hover:text-[var(--chrome-fg)]"
            >
              {s.eyebrow}  {s.title}
            </a>
          ))}
        </nav>
      </aside>

      <main>
        <div className="sg-canvas" style={{ fontSize: `${BASE_REM_PX}px` }}>
          <style dangerouslySetInnerHTML={{ __html: scopedCss }} />

          <SectionBlock
            {...SECTIONS[0]}
            editor={
              <ColorsEditor
                value={tokens.colors}
                onChange={(v) => update({ colors: v })}
              />
            }
            preview={<ColorsPreview tokens={tokens} />}
          />

          <SectionBlock
            {...SECTIONS[1]}
            editor={
              <TypographyEditor
                value={tokens.typography}
                fonts={tokens.fonts}
                onChange={(v) => update({ typography: v })}
                onFontsChange={(v) => update({ fonts: v })}
              />
            }
            preview={<TypographyPreview tokens={tokens} />}
          />

          <SectionBlock
            {...SECTIONS[2]}
            editor={
              <SpacingEditor
                value={tokens.spacing}
                onChange={(v) => update({ spacing: v })}
              />
            }
            preview={<SpacingPreview tokens={tokens} />}
          />

          <SectionBlock
            {...SECTIONS[3]}
            editor={
              <RadiiEditor
                value={tokens.radii}
                onChange={(v) => update({ radii: v })}
              />
            }
            preview={<RadiiPreview tokens={tokens} />}
          />

          <SectionBlock
            {...SECTIONS[4]}
            editor={
              <CardEditor
                value={tokens.cards}
                colors={tokens.colors}
                activeId={activeCardId}
                onActiveChange={setActiveCardId}
                onChange={(v) => update({ cards: v })}
              />
            }
            preview={<CardPreview activeId={activeCardId} />}
          />

          <SectionBlock
            {...SECTIONS[5]}
            editor={
              <ButtonEditor
                value={tokens.buttons}
                colors={tokens.colors}
                activeId={activeBtnId}
                onActiveChange={setActiveBtnId}
                onChange={(v) => update({ buttons: v })}
              />
            }
            preview={<ButtonPreview activeId={activeBtnId} />}
          />

          <SectionBlock
            {...SECTIONS[6]}
            editor={
              <LinksEditor
                value={tokens.links}
                onChange={(v) => update({ links: v })}
              />
            }
            preview={<LinksPreview tokens={tokens} />}
          />
        </div>
      </main>
    </div>
  );
}
