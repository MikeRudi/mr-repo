"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_TOKENS,
  BASE_REM_PX,
  normalizeTokens,
} from "../../lib/styleguide-defaults.js";
import { generateCss } from "../../lib/styleguide-css.js";

import SectionBlock from "./_components/SectionBlock.jsx";
import CssExport from "./_components/CssExport.jsx";
import ColorsEditor from "./_components/editors/ColorsEditor.jsx";
import TypographyEditor from "./_components/editors/TypographyEditor.jsx";
import SpacingEditor from "./_components/editors/SpacingEditor.jsx";
import RadiiEditor from "./_components/editors/RadiiEditor.jsx";
import CardEditor from "./_components/editors/CardEditor.jsx";
import ButtonEditor from "./_components/editors/ButtonEditor.jsx";
import LinksEditor from "./_components/editors/LinksEditor.jsx";
import {
  ColorsPreview,
  TypographyPreview,
  SpacingPreview,
  RadiiPreview,
  CardPreview,
  ButtonPreview,
  LinksPreview,
} from "./_components/Previews.jsx";

// Container max-width is fixed at 1920 for everyone — no editor section.
const SECTIONS = [
  { id: "colors",     eyebrow: "01",  title: "Colors" },
  { id: "typography", eyebrow: "02",  title: "Typography" },
  { id: "spacing",    eyebrow: "03",  title: "Spacing" },
  { id: "radii",      eyebrow: "04",  title: "Border radius" },
  { id: "card",       eyebrow: "05",  title: "Card" },
  { id: "button",     eyebrow: "06",  title: "Button" },
  { id: "links",      eyebrow: "07",  title: "Links" },
];

export default function StyleGuideForm() {
  const [guides, setGuides] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState("Default");
  const [tokens, setTokens] = useState(DEFAULT_TOKENS);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState({ kind: "idle" });
  const [loadingList, setLoadingList] = useState(false);

  // Active variant state for the filter pills in the Card / Button sections.
  const [activeCardId, setActiveCardId] = useState(DEFAULT_TOKENS.cards[0].id);
  const [activeBtnId, setActiveBtnId] = useState(DEFAULT_TOKENS.buttons[0].id);

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
        if (list.length > 0 && !currentId) {
          await load(list[0].id);
        }
      } catch {
        // offline / Neon not provisioned
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
      const merged = normalizeTokens(g.tokens);
      setTokens(merged);
      // Reset active variants if the loaded guide doesn't include the current ones.
      if (!merged.cards?.find((c) => c.id === activeCardId)) {
        setActiveCardId(merged.cards?.[0]?.id ?? "default");
      }
      if (!merged.buttons?.find((b) => b.id === activeBtnId)) {
        setActiveBtnId(merged.buttons?.[0]?.id ?? "primary");
      }
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
    setActiveCardId(DEFAULT_TOKENS.cards[0].id);
    setActiveBtnId(DEFAULT_TOKENS.buttons[0].id);
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
      fetch("/api/styleguides")
        .then((r) => r.json())
        .then((d) => setGuides(d?.styleGuides ?? []))
        .catch(() => {});
    } catch (err) {
      setStatus({ kind: "error", msg: err?.message ?? "Network error" });
    }
  }

  const scopedCss = useMemo(
    () => generateCss(tokens, ".sg-canvas", { scoped: true }),
    [tokens]
  );
  const exportCss = useMemo(() => generateCss(tokens, ":root"), [tokens]);

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
          <a
            href="#css"
            className="mt-2 rounded-[0.25rem] px-3 py-2 text-[16px] text-[var(--chrome-fg-muted)] hover:bg-[var(--chrome-surface)] hover:text-[var(--chrome-fg)]"
          >
            CSS export
          </a>
        </nav>
      </aside>

      <main>
        <div className="sticky top-0 z-30 -mx-4 px-4 pt-4 pb-4 bg-[var(--chrome-ground)]/95 backdrop-blur border-b border-[var(--chrome-border)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="sg-pick"
                className="text-[16px] font-normal text-[var(--chrome-fg)]"
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
                className="app-input min-w-[200px] px-3"
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
              className="app-input min-w-[220px] flex-1 px-3"
            />

            <button
              type="button"
              onClick={save}
              disabled={status.kind === "saving"}
              className="btn-chrome"
            >
              {status.kind === "saving"
                ? "Saving…"
                : currentId
                  ? dirty
                    ? "Save changes"
                    : "Saved"
                  : "Create"}
            </button>

            <span className="min-h-4 text-[16px] text-[var(--chrome-fg-subtle)]">
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

          <div id="css">
            <CssExport css={exportCss} />
          </div>
        </div>
      </main>
    </div>
  );
}
