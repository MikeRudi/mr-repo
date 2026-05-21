"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [selectedElementKey, setSelectedElementKey] = useState(null);

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

  // Escape clears element, then section selection
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (selectedElementKey) setSelectedElementKey(null);
        else setSelectedSectionId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedElementKey]);

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
    setSelectedElementKey(null);
  };
  const removeSection = (instanceId) => {
    setPages((p) =>
      p.map((pg) =>
        pg.id !== activePageId
          ? pg
          : { ...pg, sections: pg.sections.filter((s) => s.id !== instanceId) }
      )
    );
    if (selectedSectionId === instanceId) {
      setSelectedSectionId(null);
      setSelectedElementKey(null);
    }
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

  const isNav = (sectionId) => sectionId === "navigation-floating-bar";

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
          <style>{`
            .sg-canvas-builder [data-sg-prop] {
              transition: box-shadow 0.15s ease;
            }
            .sg-canvas-builder [data-sg-prop]:hover {
              box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.35);
            }
            .sg-canvas-builder [data-sg-prop][data-sg-selected="true"] {
              box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.65);
            }
          `}</style>
          <Canvas
            page={activePage}
            sectionsMeta={initialSections}
            selectedId={selectedSectionId}
            selectedElementKey={selectedElementKey}
            onSelectSection={(id) => {
              setSelectedSectionId(id);
              setSelectedElementKey(null);
            }}
            onSelectElement={(sectionId, elementKey) => {
              setSelectedSectionId(sectionId);
              setSelectedElementKey(elementKey);
            }}
            onMove={moveSection}
            onRemove={removeSection}
            isNav={isNav}
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
            elementKey={selectedElementKey}
            onChange={(next) => updateSectionProps(selectedSectionId, next)}
            onClose={() => {
              setSelectedElementKey(null);
              setSelectedSectionId(null);
            }}
            onBack={() => setSelectedElementKey(null)}
            buttonVariants={tokens.buttons?.map((b) => b.id) ?? []}
            typographyVariants={Object.keys(tokens.typography ?? {})}
            cardVariants={tokens.cards?.map((c) => c.id) ?? []}
            onMoveUp={() => moveSection(selectedSectionId, -1)}
            onMoveDown={() => moveSection(selectedSectionId, +1)}
            onRemove={() => removeSection(selectedSectionId)}
          />
        </aside>
      ) : null}
    </div>
  );
}

function Canvas({
  page,
  sectionsMeta,
  selectedId,
  selectedElementKey,
  onSelectSection,
  onSelectElement,
  onMove,
  onRemove,
  isNav,
}) {
  if (!page) return null;

  const navSections = page.sections.filter((s) => isNav(s.sectionId));
  const contentSections = page.sections.filter((s) => !isNav(s.sectionId));

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
      {/* Nav sections rendered at top without wrapper */}
      {navSections.map((inst) => {
        const Component = getSectionComponent(inst.sectionId);
        return (
          <NavInstance
            key={inst.id}
            instance={inst}
            meta={sectionsMeta.find((s) => s.id === inst.sectionId)}
            selected={inst.id === selectedId && !selectedElementKey}
            selectedElementKey={selectedElementKey}
            elementStyles={inst.props?.__elementStyles}
            onSelect={() => onSelectSection(inst.id)}
            onSelectElement={(key) => onSelectElement(inst.id, key)}
          >
            {Component ? <Component {...inst.props} /> : null}
          </NavInstance>
        );
      })}

      {/* Content sections */}
      {contentSections.map((inst) => (
        <SectionInstance
          key={inst.id}
          instance={inst}
          meta={sectionsMeta.find((s) => s.id === inst.sectionId)}
          selected={inst.id === selectedId && !selectedElementKey}
          selectedElementKey={selectedElementKey}
          elementStyles={inst.props?.__elementStyles}
          onSelect={() => onSelectSection(inst.id)}
          onSelectElement={(key) => onSelectElement(inst.id, key)}
          onMoveUp={() => onMove(inst.id, -1)}
          onMoveDown={() => onMove(inst.id, +1)}
          onRemove={() => onRemove(inst.id)}
        />
      ))}
    </div>
  );
}

function findElementKey(target) {
  let el = target;
  while (el && el !== document.body) {
    const prop = el.dataset?.sgProp;
    if (prop) {
      return {
        key: prop,
        index: el.dataset?.sgIndex,
        sub: el.dataset?.sgSub,
        linkIndex: el.dataset?.sgLinkIndex,
      };
    }
    el = el.parentElement;
  }
  return null;
}

function styleKey(el) {
  if (!el) return "";
  const parts = [el.key];
  if (el.index != null) parts.push(String(el.index));
  if (el.sub) parts.push(el.sub);
  if (el.linkIndex != null) parts.push("links", String(el.linkIndex));
  return parts.join(":");
}

function matchesElementKey(el, key) {
  if (el.dataset.sgProp !== key.key) return false;
  if (key.index != null && el.dataset.sgIndex !== String(key.index)) return false;
  if (key.sub != null && el.dataset.sgSub !== key.sub) return false;
  if (key.linkIndex != null && el.dataset.sgLinkIndex !== String(key.linkIndex)) return false;
  return true;
}

function useApplyElementStyles(ref, elementStyles, selectedElementKey) {
  useEffect(() => {
    if (!ref.current) return;
    // Clear previous inline styles on data-sg-prop elements
    const all = ref.current.querySelectorAll("[data-sg-prop]");
    all.forEach((el) => {
      el.removeAttribute("style");
      el.removeAttribute("data-sg-selected");
    });
    // Apply __elementStyles
    if (elementStyles && typeof elementStyles === "object") {
      for (const [key, styles] of Object.entries(elementStyles)) {
        if (!styles || typeof styles !== "object") continue;
        const parts = key.split(":");
        const prop = parts[0];
        const idx = parts[1] != null ? Number(parts[1]) : null;
        const sub = parts[2] ?? null;
        const linkIdx = parts[3] != null ? Number(parts[3]) : null;
        const sel = `[data-sg-prop="${prop}"]` +
          (idx != null ? `[data-sg-index="${idx}"]` : "") +
          (sub ? `[data-sg-sub="${sub}"]` : "");
        const target = ref.current.querySelector(sel);
        if (target) {
          Object.assign(target.style, styles);
        }
      }
    }
    // Mark selected element
    if (selectedElementKey) {
      const sel = `[data-sg-prop="${selectedElementKey.key}"]` +
        (selectedElementKey.index != null ? `[data-sg-index="${selectedElementKey.index}"]` : "") +
        (selectedElementKey.sub ? `[data-sg-sub="${selectedElementKey.sub}"]` : "");
      const target = ref.current.querySelector(sel);
      if (target) target.setAttribute("data-sg-selected", "true");
    }
  }, [ref, elementStyles, selectedElementKey]);
}

function NavInstance({ instance, meta, selected, selectedElementKey, elementStyles, onSelect, onSelectElement, children }) {
  const wrapperRef = useRef(null);
  useApplyElementStyles(wrapperRef, elementStyles, selectedElementKey);
  return (
    <div
      ref={wrapperRef}
      className={`relative cursor-pointer ${
        selected
          ? "ring-2 ring-inset ring-[var(--chrome-track-stable)]"
          : "hover:ring-1 hover:ring-inset hover:ring-[var(--chrome-border-strong)]"
      }`}
      onClick={(e) => {
        if (e.target.closest("button")) return;
        const el = findElementKey(e.target);
        if (el) {
          e.preventDefault();
          onSelectElement(el);
        }
        else onSelect();
      }}
    >
      {children}
      {/* Label */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <span className="px-2 h-7 inline-flex items-center rounded-[6px] bg-[var(--chrome-fg)]/85 text-[var(--chrome-fg-inverse)] text-[10px] font-bold uppercase tracking-[0.04em]">
          {meta?.name ?? instance.sectionId}
        </span>
      </div>
    </div>
  );
}

function SectionInstance({
  instance,
  meta,
  selected,
  selectedElementKey,
  elementStyles,
  onSelect,
  onSelectElement,
  onMoveUp,
  onMoveDown,
  onRemove,
}) {
  const Component = getSectionComponent(instance.sectionId);
  const wrapperRef = useRef(null);
  useApplyElementStyles(wrapperRef, elementStyles, selectedElementKey);
  return (
    <div
      ref={wrapperRef}
      className={`group relative border-b border-[var(--chrome-border)] cursor-pointer ${
        selected
          ? "ring-2 ring-inset ring-[var(--chrome-track-stable)]"
          : "hover:ring-1 hover:ring-inset hover:ring-[var(--chrome-border-strong)]"
      }`}
      onClick={(e) => {
        if (e.target.closest("button")) return;
        const el = findElementKey(e.target);
        if (el) {
          e.preventDefault();
          onSelectElement(el);
        }
        else onSelect();
      }}
    >
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

