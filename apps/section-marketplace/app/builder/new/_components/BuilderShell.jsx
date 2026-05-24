"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSectionComponent } from "../../../../library/registry.js";
import { generateCss } from "../../../../lib/styleguide-css.js";
import { DEFAULT_TOKENS, normalizeTokens } from "../../../../lib/styleguide-defaults.js";
import SectionsPanel from "./SectionsPanel.jsx";
import PagesPanel from "./PagesPanel.jsx";
import StylePanel from "./StylePanel.jsx";
import InspectorPanel from "./InspectorPanel.jsx";

// Must match the key used by /builder/start/StartWizard.jsx
const WIZARD_KEY = "mr.builder.wizardState.v1";

const TOOLS = [
  { id: "sections", label: "Sections" },
  { id: "pages",    label: "Pages"    },
  { id: "style",    label: "Style"    },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makePage(name = "Home", slug = "/") {
  return { id: uid(), name, slug, sections: [] };
}

export default function BuilderShell({ initialSections, initialTemplate }) {
  const [activeTool, setActiveTool] = useState("sections");
  const [pages, setPages] = useState([makePage()]);
  const [activePageId, setActivePageId] = useState(() => "");
  const [siteName, setSiteName] = useState("Untitled site");
  // Style guides are PER-SITE only. They live in this local state and are
  // round-tripped to /api/sites/publish on Save. Global library deferred.
  const [styleGuides, setStyleGuides] = useState(() => [
    { id: uid(), name: "Default", tokens: DEFAULT_TOKENS, isActive: true },
  ]);
  const [activeGuideId, setActiveGuideId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from the onboarding wizard's sessionStorage payload on mount.
  // If absent (e.g. user came straight to /builder/new), keep defaults.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(WIZARD_KEY);
      if (raw) {
        const payload = JSON.parse(raw);
        if (payload && typeof payload === "object") {
          if (typeof payload.siteName === "string" && payload.siteName.trim()) {
            setSiteName(payload.siteName.trim());
          }
          if (Array.isArray(payload.styleGuides) && payload.styleGuides.length) {
            const normalised = payload.styleGuides.map((g) => ({
              id: g.id ?? uid(),
              name: g.name ?? "Untitled",
              tokens: normalizeTokens(g.tokens ?? DEFAULT_TOKENS),
              isActive: Boolean(g.isActive),
            }));
            setStyleGuides(normalised);
            const active =
              normalised.find((g) => g.id === payload.activeStyleGuideId) ??
              normalised.find((g) => g.isActive) ??
              normalised[0];
            setActiveGuideId(active.id);
          }
          // Consume the payload so a refresh doesn't keep re-hydrating.
          sessionStorage.removeItem(WIZARD_KEY);
        }
      }
    } catch {
      // sessionStorage parse failure — fall through with defaults
    }
    setHydrated(true);
  }, []);

  // Pick the first guide as active if nothing else set one yet.
  useEffect(() => {
    if (!activeGuideId && styleGuides.length > 0) {
      setActiveGuideId(styleGuides[0].id);
    }
  }, [activeGuideId, styleGuides]);

  useEffect(() => {
    if (!activePageId && pages.length > 0) setActivePageId(pages[0].id);
  }, [activePageId, pages]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedSectionId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Resolve the active guide + its tokens from local state.
  const activeGuide =
    styleGuides.find((g) => g.id === activeGuideId) ?? styleGuides[0] ?? null;
  const tokens = activeGuide?.tokens ?? DEFAULT_TOKENS;

  function setActiveGuide(id) {
    setActiveGuideId(id);
    setStyleGuides((prev) =>
      prev.map((g) => ({ ...g, isActive: g.id === id }))
    );
  }

  function updateActiveGuideTokens(nextTokens) {
    setStyleGuides((prev) =>
      prev.map((g) =>
        g.id === activeGuideId ? { ...g, tokens: nextTokens } : g
      )
    );
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const siteData = {
        name: siteName,
        pages,
        styleGuides,
        activeStyleGuideId: activeGuideId,
        // Keep `tokens` in the payload too for back-compat with the
        // existing /site/[siteId] reader. It mirrors the active guide.
        tokens,
      };
      const res = await fetch("/api/sites/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteData),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setSavedUrl(data.url);
    } catch (err) {
      console.error(err);
      alert("Failed to save site");
    } finally {
      setIsSaving(false);
    }
  }

  const activePage = pages.find((p) => p.id === activePageId) ?? pages[0];

  const addPage = () => {
    const n = pages.length + 1;
    const next = makePage(`Page ${n}`, `/page-${n}`);
    setPages((p) => [...p, next]);
    setActivePageId(next.id);
  };
  const renamePage = (id, name) =>
    setPages((p) => p.map((pg) => (pg.id === id ? { ...pg, name } : pg)));
  const reslugPage = (id, slug) =>
    setPages((p) => p.map((pg) => (pg.id === id ? { ...pg, slug } : pg)));
  const removePage = (id) => {
    if (pages.length <= 1) return;
    const next = pages.filter((pg) => pg.id !== id);
    setPages(next);
    if (id === activePageId) setActivePageId(next[0].id);
  };

  const addSection = (sectionId) => {
    const newId = uid();
    setPages((p) =>
      p.map((pg) =>
        pg.id !== activePageId
          ? pg
          : {
              ...pg,
              sections: [...pg.sections, { id: newId, sectionId, props: {} }],
            }
      )
    );
    setSelectedSectionId(newId);
  };
  const removeSection = (instanceId) => {
    setPages((p) =>
      p.map((pg) =>
        pg.id !== activePageId
          ? pg
          : { ...pg, sections: pg.sections.filter((s) => s.id !== instanceId) }
      )
    );
    if (selectedSectionId === instanceId) setSelectedSectionId(null);
  };
  const moveSection = (instanceId, dir) => {
    setPages((p) =>
      p.map((pg) => {
        if (pg.id !== activePageId) return pg;
        const idx = pg.sections.findIndex((s) => s.id === instanceId);
        if (idx < 0) return pg;
        const nextIdx = idx + dir;
        if (nextIdx < 0 || nextIdx >= pg.sections.length) return pg;
        const next = [...pg.sections];
        [next[idx], next[nextIdx]] = [next[nextIdx], next[idx]];
        return { ...pg, sections: next };
      })
    );
  };

  const updateSectionProps = (instanceId, nextProps) => {
    setPages((p) =>
      p.map((pg) =>
        pg.id !== activePageId
          ? pg
          : {
              ...pg,
              sections: pg.sections.map((s) =>
                s.id === instanceId ? { ...s, props: nextProps } : s
              ),
            }
      )
    );
  };

  const canvasCss = useMemo(
    () => generateCss(tokens, ".sg-canvas-builder", { scoped: true }),
    [tokens]
  );

  const selectedInstance = activePage?.sections?.find(
    (s) => s.id === selectedSectionId
  );
  const selectedMeta = selectedInstance
    ? initialSections.find((s) => s.id === selectedInstance.sectionId)
    : null;

  const showInspector = Boolean(selectedSectionId && selectedMeta);
  const gridCols = showInspector
    ? "grid-cols-[280px_1fr_320px]"
    : "grid-cols-[280px_1fr]";

  return (
    <div className={`grid h-dvh grid-rows-[48px_1fr] ${gridCols} bg-[var(--chrome-ground)]`}>
      <header className="col-span-full flex items-center gap-3 px-4 border-b border-[var(--chrome-border)] bg-[var(--chrome-surface)]">
        <Link
          href="/"
          className="text-[12px] tracking-[0.04em] text-[var(--chrome-fg)]"
        >
          MR
        </Link>
        <span className="text-[var(--chrome-border)]">/</span>
        <span className="text-[12px] text-[var(--chrome-fg-muted)]" style={{ textTransform: "none", letterSpacing: "normal" }}>
          {siteName}{initialTemplate ? ` · from "${initialTemplate}"` : ""}
        </span>
        <div className="flex-1" />
        <select
          aria-label="Active page"
          value={activePage?.id ?? ""}
          onChange={(e) => setActivePageId(e.target.value)}
          className="h-8 px-2 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px]"
          style={{ textTransform: "none", letterSpacing: "normal" }}
        >
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={addPage} className="btn-chrome btn-chrome--ghost btn-chrome--sm">
          + Page
        </button>
        <button type="button" onClick={handleSave} disabled={isSaving} className="btn-chrome btn-chrome--sm">
          {isSaving ? "Saving..." : "Save"}
        </button>
        {savedUrl && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(savedUrl);
              alert("Link copied!");
            }}
            className="btn-chrome btn-chrome--ghost btn-chrome--sm"
          >
            Copy link
          </button>
        )}
        <Link href="/" className="btn-chrome btn-chrome--ghost btn-chrome--sm">
          Exit
        </Link>
      </header>

      <aside className="row-start-2 col-start-1 min-h-0 border-r border-[var(--chrome-border)] bg-[var(--chrome-surface)] flex flex-col overflow-hidden">
        <nav role="tablist" className="flex border-b border-[var(--chrome-border)]">
          {TOOLS.map((t) => {
            const sel = t.id === activeTool;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={sel}
                onClick={() => setActiveTool(t.id)}
                className={`flex-1 h-9 text-[11px] tracking-[0.06em] transition-colors ${
                  sel
                    ? "bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)]"
                    : "text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)] hover:bg-[var(--chrome-ground)]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="flex-1 overflow-y-auto">
          {activeTool === "sections" ? (
            <SectionsPanel sections={initialSections} onAdd={addSection} />
          ) : null}
          {activeTool === "pages" ? (
            <PagesPanel
              pages={pages}
              activePageId={activePageId}
              onSelect={setActivePageId}
              onAdd={addPage}
              onRename={renamePage}
              onReslug={reslugPage}
              onRemove={removePage}
            />
          ) : null}
          {activeTool === "style" ? (
            <StylePanel
              guides={styleGuides}
              activeGuideId={activeGuideId}
              loading={false}
              onSelect={setActiveGuide}
            />
          ) : null}
        </div>
      </aside>

      <main
        className="row-start-2 col-start-2 min-h-0 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedSectionId(null);
        }}
      >
        <div className="sg-canvas-builder" style={{ fontSize: "16px" }}>
          <style dangerouslySetInnerHTML={{ __html: canvasCss }} />
          <Canvas
            page={activePage}
            sectionsMeta={initialSections}
            selectedId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            onMove={moveSection}
            onRemove={removeSection}
            onPropChange={(instanceId, key, value) => {
              const inst = activePage?.sections?.find((s) => s.id === instanceId);
              if (!inst) return;
              updateSectionProps(instanceId, { ...(inst.props ?? {}), [key]: value });
            }}
          />
        </div>
      </main>

      {showInspector ? (
        <aside className="row-start-2 col-start-3 min-h-0 overflow-hidden">
          <InspectorPanel
            name={selectedMeta?.name ?? selectedInstance?.sectionId}
            controls={selectedMeta?.controls ?? []}
            props={selectedInstance?.props ?? {}}
            context={{ buttons: tokens.buttons ?? [] }}
            onChange={(next) => updateSectionProps(selectedSectionId, next)}
            onClose={() => setSelectedSectionId(null)}
            onMoveUp={() => moveSection(selectedSectionId, -1)}
            onMoveDown={() => moveSection(selectedSectionId, +1)}
            onRemove={() => removeSection(selectedSectionId)}
          />
        </aside>
      ) : null}
    </div>
  );
}

function Canvas({ page, sectionsMeta, selectedId, onSelectSection, onMove, onRemove, onPropChange }) {
  if (!page) return null;

  if (page.sections.length === 0) {
    return (
      <div className="grid place-items-center h-full min-h-[60vh] text-[var(--chrome-fg-disabled)]">
        <div className="text-center">
          <p className="text-[14px]" style={{ textTransform: "none", letterSpacing: "normal" }}>Empty canvas</p>
          <p className="text-[12px] mt-1 text-[var(--chrome-fg-subtle)]" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Open the Sections tool on the left and click a section to add it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {page.sections.map((inst) => (
        <SectionInstance
          key={inst.id}
          instance={inst}
          meta={sectionsMeta.find((s) => s.id === inst.sectionId)}
          selected={inst.id === selectedId}
          onSelect={() => onSelectSection(inst.id)}
          onMoveUp={() => onMove(inst.id, -1)}
          onMoveDown={() => onMove(inst.id, +1)}
          onRemove={() => onRemove(inst.id)}
          onPropChange={(key, value) => onPropChange(inst.id, key, value)}
        />
      ))}
    </div>
  );
}

function SectionInstance({
  instance,
  meta,
  selected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onRemove,
  onPropChange,
}) {
  const Component = getSectionComponent(instance.sectionId);
  return (
    <div
      className={`group relative border-b border-[var(--chrome-border)] cursor-pointer ${
        selected
          ? "ring-2 ring-inset ring-[var(--chrome-track-stable)]"
          : "hover:ring-1 hover:ring-inset hover:ring-[var(--chrome-border-strong)]"
      }`}
      onClick={(e) => {
        if (e.target.closest("button, a, [contenteditable=true]")) return;
        onSelect();
      }}
    >
      {Component ? (
        <Component
          {...instance.props}
          _editing
          _onPropChange={onPropChange}
        />
      ) : (
        <div className="px-6 py-16 text-center text-[var(--chrome-fg-disabled)]">
          <p className="text-[12px] tracking-[0.04em]">
            {meta?.name ?? instance.sectionId}
          </p>
          <p className="text-[11px] mt-1" style={{ textTransform: "none", letterSpacing: "normal" }}>
            implementation missing
          </p>
        </div>
      )}

      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="px-2 h-7 inline-flex items-center rounded-[6px] bg-[var(--chrome-fg)]/85 text-[var(--chrome-fg-inverse)] text-[10px] tracking-[0.06em]">
          {meta?.name ?? instance.sectionId}
        </span>
        <ToolbarBtn label="Move up" onClick={onMoveUp}>↑</ToolbarBtn>
        <ToolbarBtn label="Move down" onClick={onMoveDown}>↓</ToolbarBtn>
        <ToolbarBtn label="Remove" onClick={onRemove}>×</ToolbarBtn>
      </div>
    </div>
  );
}

function ToolbarBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="h-7 w-7 grid place-items-center rounded-[6px] bg-[var(--chrome-fg)]/85 text-[var(--chrome-fg-inverse)] text-[12px] hover:bg-[var(--chrome-fg)]"
    >
      {children}
    </button>
  );
}
