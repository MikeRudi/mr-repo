"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_TOKENS } from "../../lib/styleguide-defaults.js";
import { generateCss } from "../../lib/styleguide-css.js";

import SectionBlock from "./_components/SectionBlock.jsx";
import CssExport from "./_components/CssExport.jsx";
import WizardryEditor from "./_components/editors/WizardryEditor.jsx";
import ColorsEditor from "./_components/editors/ColorsEditor.jsx";
import TypographyEditor from "./_components/editors/TypographyEditor.jsx";
import SpacingEditor from "./_components/editors/SpacingEditor.jsx";
import RadiiEditor from "./_components/editors/RadiiEditor.jsx";
import CardEditor from "./_components/editors/CardEditor.jsx";
import ButtonEditor from "./_components/editors/ButtonEditor.jsx";
import LinksEditor from "./_components/editors/LinksEditor.jsx";
import {
  WizardryPreview,
  ColorsPreview,
  TypographyPreview,
  SpacingPreview,
  RadiiPreview,
  CardPreview,
  ButtonPreview,
  LinksPreview,
} from "./_components/Previews.jsx";

const SECTIONS = [
  { id: "wizardry",   eyebrow: "01",  title: "Wizardry",   description: "Set the container max width and the fluid rem ranges. Below the tablet breakpoint the mobile range takes over." },
  { id: "colors",     eyebrow: "02",  title: "Colors",     description: "Three primaries — light, dark, brand. The builder UI generates opacity, tint, and shade variants at the point of use." },
  { id: "typography", eyebrow: "03",  title: "Typography", description: "Nine scales. Each scale has a desktop and a mobile config. Font sizes in rem; letter-spacing in em; line-height unitless." },
  { id: "spacing",    eyebrow: "04",  title: "Spacing",    description: "Section padding tokens. Desktop values in em scale with the fluid rem; mobile values in rem stay anchored below the breakpoint." },
  { id: "radii",      eyebrow: "05",  title: "Border radius", description: "Three radii — small, medium, large. Used by every card, button, and surface in the system." },
  { id: "card",       eyebrow: "06",  title: "Card",       description: "Composed from the tokens above. Used by every section that needs a contained surface." },
  { id: "button",     eyebrow: "07",  title: "Button",     description: "One canonical button. Default and hover states reference colour tokens directly." },
  { id: "links",      eyebrow: "08",  title: "Links",      description: "Named URLs that sections (footers, contact, legal) can reference later by key." },
];

export default function StyleGuideForm() {
  // -- guide list + current selection
  const [guides, setGuides] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState("Default");
  const [tokens, setTokens] = useState(DEFAULT_TOKENS);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState({ kind: "idle" });
  const [loadingList, setLoadingList] = useState(false);

  // -- bootstrap: load existing guides
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingList(true);
      try {
        const res = await fetch("/api/styleguides");
        if (!res.ok) return;
        const data = await res.json();
        if (!alive) return;
        const list = data?.styleGuides ?? [];
        setGuides(list);
        // Auto-load most recent if nothing is loaded yet
        if (list.length > 0 && !currentId) {
          await load(list[0].id);
        }
      } catch {
        // offline / Neon not provisioned — fine, work locally
      } finally {
        if (alive) setLoadingList(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(id) {
    try {
      const res = await fetch(`/api/styleguides/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const g = data?.styleGuide;
      if (!g) return;
      setCurrentId(g.id);
      setName(g.name ?? "Untitled");
      // Merge with defaults so newer fields populate when loading old rows
      setTokens(mergeDeep(DEFAULT_TOKENS, g.tokens ?? {}));
      setDirty(false);
      setStatus({ kind: "loaded", msg: `Loaded ${g.name}` });
    } catch (err) {
      setStatus({ kind: "error", msg: err?.message ?? "Failed to load" });
    }
  }

  function startNew() {
    setCurrentId(null);
    setName("New style guide");
    setTokens(DEFAULT_TOKENS);
    setDirty(true);
    setStatus({ kind: "idle" });
  }

  function update(patch) {
    setTokens((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }

  async function save() {
    if (!name.trim()) {
      setStatus({ kind: "error", msg: "Add a name first." });
      return;
    }
    setStatus({ kind: "saving" });
    try {
      const url = currentId
        ? `/api/styleguides/${currentId}`
        : "/api/styleguides";
      const method = currentId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), tokens }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({
          kind: "error",
          msg:
            data?.error ??
            (res.status === 500
              ? "Server error. Has Neon been provisioned?"
              : `Failed (${res.status}).`),
        });
        return;
      }
      const saved = data.styleGuide;
      setCurrentId(saved.id);
      setName(saved.name);
      setDirty(false);
      setStatus({ kind: "saved", msg: `Saved ${saved.name}`, id: saved.id });
      // Refresh list silently
      fetch("/api/styleguides")
        .then((r) => r.json())
        .then((d) => setGuides(d?.styleGuides ?? []))
        .catch(() => {});
    } catch (err) {
      setStatus({ kind: "error", msg: err?.message ?? "Network error" });
    }
  }

  // -- CSS
  const scopedCss = useMemo(
    () => generateCss(tokens, ".sg-canvas", { scoped: true }),
    [tokens]
  );
  const exportCss = useMemo(() => generateCss(tokens, ":root"), [tokens]);

  // Apply the desktop anchor rem as the scope's font-size so em values inside
  // the canvas behave like rem-from-anchor.
  const anchorRemPx = tokens.wizardry?.rem?.desktop?.anchorRem ?? 16;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-8">
      {/* Sticky side nav */}
      <aside className="hidden lg:block">
        <nav
          aria-label="Style guide sections"
          className="sticky top-24 flex flex-col gap-1"
        >
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--chrome-fg-subtle)] mb-2 px-3">
            Sections
          </p>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 rounded-[8px] text-[12px] text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)] hover:bg-[var(--chrome-surface)]"
            >
              {s.eyebrow}  {s.title}
            </a>
          ))}
          <a
            href="#css"
            className="mt-2 px-3 py-1.5 rounded-[8px] text-[12px] text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)] hover:bg-[var(--chrome-surface)]"
          >
            CSS export
          </a>
        </nav>
      </aside>

      <main>
        {/* Top toolbar */}
        <div className="sticky top-0 z-30 -mx-4 px-4 pt-4 pb-4 bg-[var(--chrome-ground)]/95 backdrop-blur border-b border-[var(--chrome-border)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="sg-pick"
                className="text-[11px] uppercase tracking-[0.12em] text-[var(--chrome-fg-subtle)]"
              >
                Guide
              </label>
              <select
                id="sg-pick"
                value={currentId ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__new__") startNew();
                  else if (v) load(v);
                }}
                className="h-9 px-2 rounded-[8px] bg-[var(--chrome-surface)] border border-[var(--chrome-border)] text-[12px] min-w-[180px]"
              >
                {loadingList && guides.length === 0 ? (
                  <option value="">Loading…</option>
                ) : null}
                {!loadingList && guides.length === 0 ? (
                  <option value="">No saved guides yet</option>
                ) : null}
                {guides.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
                <option value="__new__">+ New style guide</option>
              </select>
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setDirty(true);
              }}
              placeholder="Style guide name"
              className="h-9 px-3 rounded-[8px] bg-[var(--chrome-surface)] border border-[var(--chrome-border)] text-[13px] min-w-[200px] flex-1"
            />

            <button
              type="button"
              onClick={save}
              disabled={status.kind === "saving"}
              className="h-9 px-4 rounded-full bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)] text-[12px] disabled:opacity-50"
            >
              {status.kind === "saving"
                ? "Saving…"
                : currentId
                  ? dirty
                    ? "Save changes"
                    : "Saved"
                  : "Create"}
            </button>

            <span className="text-[11px] text-[var(--chrome-fg-subtle)] min-h-4">
              {status.kind === "saved" ? `✓ ${status.msg}` : null}
              {status.kind === "loaded" ? status.msg : null}
              {status.kind === "error" ? (
                <span className="text-[var(--chrome-track-experimental)]">
                  {status.msg}
                </span>
              ) : null}
              {status.kind === "idle" && dirty ? "Unsaved changes" : null}
            </span>
          </div>
        </div>

        {/* Live-styled canvas wraps every preview so they inherit the generated CSS */}
        <div className="sg-canvas" style={{ fontSize: `${anchorRemPx}px` }}>
          <style dangerouslySetInnerHTML={{ __html: scopedCss }} />

          <SectionBlock
            id={SECTIONS[0].id}
            eyebrow={SECTIONS[0].eyebrow}
            title={SECTIONS[0].title}
            description={SECTIONS[0].description}
            editor={
              <WizardryEditor
                value={tokens.wizardry}
                onChange={(v) => update({ wizardry: v })}
              />
            }
            preview={<WizardryPreview tokens={tokens} />}
          />

          <SectionBlock
            id={SECTIONS[1].id}
            eyebrow={SECTIONS[1].eyebrow}
            title={SECTIONS[1].title}
            description={SECTIONS[1].description}
            editor={
              <ColorsEditor
                value={tokens.colors}
                onChange={(v) => update({ colors: v })}
              />
            }
            preview={<ColorsPreview tokens={tokens} />}
          />

          <SectionBlock
            id={SECTIONS[2].id}
            eyebrow={SECTIONS[2].eyebrow}
            title={SECTIONS[2].title}
            description={SECTIONS[2].description}
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
            id={SECTIONS[3].id}
            eyebrow={SECTIONS[3].eyebrow}
            title={SECTIONS[3].title}
            description={SECTIONS[3].description}
            editor={
              <SpacingEditor
                value={tokens.spacing}
                onChange={(v) => update({ spacing: v })}
              />
            }
            preview={<SpacingPreview tokens={tokens} />}
          />

          <SectionBlock
            id={SECTIONS[4].id}
            eyebrow={SECTIONS[4].eyebrow}
            title={SECTIONS[4].title}
            description={SECTIONS[4].description}
            editor={
              <RadiiEditor
                value={tokens.radii}
                onChange={(v) => update({ radii: v })}
              />
            }
            preview={<RadiiPreview tokens={tokens} />}
          />

          <SectionBlock
            id={SECTIONS[5].id}
            eyebrow={SECTIONS[5].eyebrow}
            title={SECTIONS[5].title}
            description={SECTIONS[5].description}
            editor={
              <CardEditor
                value={tokens.card}
                onChange={(v) => update({ card: v })}
              />
            }
            preview={<CardPreview />}
          />

          <SectionBlock
            id={SECTIONS[6].id}
            eyebrow={SECTIONS[6].eyebrow}
            title={SECTIONS[6].title}
            description={SECTIONS[6].description}
            editor={
              <ButtonEditor
                value={tokens.button}
                onChange={(v) => update({ button: v })}
              />
            }
            preview={<ButtonPreview />}
          />

          <SectionBlock
            id={SECTIONS[7].id}
            eyebrow={SECTIONS[7].eyebrow}
            title={SECTIONS[7].title}
            description={SECTIONS[7].description}
            editor={
              <LinksEditor
                value={tokens.links}
                onChange={(v) => update({ links: v })}
              />
            }
            preview={<LinksPreview tokens={tokens} />}
          />

          <div id="css">
            <CssExport css={exportCss} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Deep merge that lets stored data override defaults without dropping new
// default keys when loading a row saved before they existed.
function mergeDeep(base, override) {
  if (Array.isArray(override)) return override;
  if (override == null) return base;
  if (typeof override !== "object" || typeof base !== "object") return override;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    out[k] = mergeDeep(base?.[k], override[k]);
  }
  return out;
}
