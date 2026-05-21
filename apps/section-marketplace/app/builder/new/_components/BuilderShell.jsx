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
  const [styleGuides, setStyleGuides] = useState([]);
  const [activeGuideId, setActiveGuideId] = useState(null);
  const [tokens, setTokens] = useState(DEFAULT_TOKENS);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  // Initial activePageId once pages exist
  useEffect(() => {
    if (!activePageId && pages.length > 0) {
      setActivePageId(pages[0].id);
    }
  }, [activePageId, pages]);

  // Load style guides
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingGuides(true);
      try {
        const res = await fetch("/api/styleguides");
        if (!res.ok) return;
        const data = await res.json();
        if (!alive) return;
        const list = data?.styleGuides ?? [];
        setStyleGuides(list);
        if (list.length > 0) {
          setActiveGuideId(list[0].id);
          await loadGuide(list[0].id);
        }
      } catch {
        // ignore
      } finally {
        if (alive) setLoadingGuides(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape closes inspector
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedSectionId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function loadGuide(id) {
    try {
      const res = await fetch(`/api/styleguides/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const g = data?.styleGuide;
      if (g?.tokens) {
        setTokens(normalizeTokens(g.tokens));
        setActiveGuideId(g.id);
      }
    } catch {
      // ignore
    }
  }

  const activePage = pages.find((p) => p.id === activePageId) ?? pages[0];

  // -- Page operations
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

  // -- Section operations on the active page
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

  const selectedInstance = activePage?.sections?.find((s) => s.id === selectedSectionId);
  const selectedMeta = selectedInstance
    ? initialSections.find((s) => s.id === selectedInstance.sectionId)
    : null;

  const showInspector = Boolean(selectedSectionId);
  const gridCols = showInspector ? "grid-cols-[280px_1fr_280px]" : "grid-cols-[280px_1fr]";

  return (
    <div className={`grid h-dvh grid-rows-[48px_1fr] ${gridCols} bg-[var(--chrome-ground)]`}>
      {/* Top toolbar */}
      <header className="col-span-full flex items-center gap-3 px-4 border-b border-[var(--chrome-border)] bg-[var(--chrome-surface)]">
        <Link
          href="/"
          className="text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)]"
        >
          MR
        </Link>
        <span className="text-[var(--chrome-border)]">/</span>
        <span className="text-[12px] text-[var(--chrome-fg-muted)]">
          Builder · {initialTemplate ? `from "${initialTemplate}"` : "blank"}
        </span>
        <div className="flex-1" />
        <select
          aria-label="Active page"
          value={activePage?.id ?? ""}
          onChange={(e) => setActivePageId(e.target.value)}
          className="h-8 px-2 rounded-[6px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[12px]"
        >
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addPage}
          className="h-8 px-3 rounded-[6px] border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
        >
          + Page
        </button>
        <button
          type="button"
          disabled
          className="h-8 px-3 rounded-full bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)] text-[12px] opacity-50 cursor-not-allowed"
          title="Persistence comes in the next phase"
        >
          Save
        </button>
        <Link
          href="/"
          className="h-8 grid place-items-center px-3 rounded-[6px] text-[12px] text-[var(--chrome-fg-muted)] hover:text-[var(--chrome-fg)]"
        >
          Exit
        </Link>
      </header>

      {/* Sidebar */}
      <aside className="row-start-2 col-start-1 border-r border-[var(--chrome-border)] bg-[var(--chrome-surface)] flex flex-col overflow-hidden">
        <nav role="tablist" className="flex border-b border-[var(--chrome-border)]">
          {TOOLS.map((t) => {
            const sel = t.id === activeTool;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={sel}
                onClick={() => setActiveTool(t.id)}
                className={`flex-1 h-9 text-[11px] font-bold uppercase tracking-[0.04em] transition-colors ${
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
            <SectionsPanel
              sections={initialSections}
              onAdd={addSection}
            />
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
              loading={loadingGuides}
              onSelect={loadGuide}
            />
          ) : null}
        </div>
      </aside>

      {/* Canvas */}
      <main
        className="row-start-2 col-start-2 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedSectionId(null);
        }}
      >
        <div className="sg-canvas-builder min-h-full" style={{ fontSize: "16px" }}>
          <style dangerouslySetInnerHTML={{ __html: canvasCss }} />
          <Canvas
            page={activePage}
            sectionsMeta={initialSections}
            selectedId={selectedSectionId}
            onSelect={setSelectedSectionId}
            onMove={moveSection}
            onRemove={removeSection}
          />
        </div>
      </main>

      {/* Inspector */}
      {showInspector ? (
        <aside className="row-start-2 col-start-3 overflow-hidden">
          <InspectorPanel
            sectionId={selectedInstance?.sectionId}
            name={selectedMeta?.name}
            props={selectedInstance?.props}
            onChange={(next) => updateSectionProps(selectedSectionId, next)}
            onClose={() => setSelectedSectionId(null)}
            buttonVariants={tokens.buttons?.map((b) => b.id) ?? []}
          />
        </aside>
      ) : null}
    </div>
  );
}

function Canvas({ page, sectionsMeta, selectedId, onSelect, onMove, onRemove }) {
  if (!page) return null;
  if (page.sections.length === 0) {
    return (
      <div className="grid place-items-center h-full min-h-[60vh] text-[var(--chrome-fg-disabled)]">
        <div className="text-center">
          <p className="text-[14px]">Empty canvas</p>
          <p className="text-[12px] mt-1 text-[var(--chrome-fg-subtle)]">
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
          onSelect={() => onSelect(inst.id)}
          onMoveUp={() => onMove(inst.id, -1)}
          onMoveDown={() => onMove(inst.id, +1)}
          onRemove={() => onRemove(inst.id)}
        />
      ))}
    </div>
  );
}

function SectionInstance({ instance, meta, selected, onSelect, onMoveUp, onMoveDown, onRemove }) {
  const Component = getSectionComponent(instance.sectionId);
  return (
    <div
      className={`group relative border-b border-[var(--chrome-border)] cursor-pointer ${
        selected
          ? "ring-2 ring-inset ring-[var(--chrome-track-stable)]"
          : "hover:ring-1 hover:ring-inset hover:ring-[var(--chrome-border-strong)]"
      }`}
      onClick={(e) => {
        // Don't select if clicking a toolbar button
        if (e.target.closest("button")) return;
        onSelect();
      }}
    >
      {/* Live render or placeholder */}
      {Component ? (
        <Component {...instance.props} />
      ) : (
        <div className="px-6 py-16 text-center text-[var(--chrome-fg-disabled)]">
          <p className="text-[12px] uppercase tracking-[0.04em] font-bold">
            {meta?.name ?? instance.sectionId}
          </p>
          <p className="text-[11px] mt-1 font-[family-name:var(--chrome-font-mono)]">
            implementation coming soon
          </p>
        </div>
      )}

      {/* Hover toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="px-2 h-7 inline-flex items-center rounded-[6px] bg-[var(--chrome-fg)]/85 text-[var(--chrome-fg-inverse)] text-[10px] font-bold uppercase tracking-[0.04em]">
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

