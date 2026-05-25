"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSectionComponent } from "../../../../library/registry.js";
import { generateCss } from "../../../../lib/styleguide-css.js";
import {
  DEFAULT_TOKENS,
  TYPOGRAPHY_SCALES,
  normalizeTokens,
} from "../../../../lib/styleguide-defaults.js";
import SectionsPanel from "./SectionsPanel.jsx";
import PagesPanel from "./PagesPanel.jsx";
import StylePanel from "./StylePanel.jsx";
import InspectorPanel from "./InspectorPanel.jsx";
import SectionCmsPanel from "./SectionCmsPanel.jsx";
import SectionControlsPanel from "./SectionControlsPanel.jsx";
import StyleGuideEditor from "../../../styleguide/_components/StyleGuideEditor.jsx";

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
  const [styleEditorOpen, setStyleEditorOpen] = useState(false);
  const [activeSectionPanel, setActiveSectionPanel] = useState(null);

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
      if (e.key === "Escape") {
        setActiveSectionPanel(null);
        setSelectedSectionId(null);
      }
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

  function renameActiveGuide(name) {
    setStyleGuides((prev) =>
      prev.map((g) =>
        g.id === activeGuideId ? { ...g, name: name || "Untitled" } : g
      )
    );
  }

  function addStyleGuide() {
    const next = {
      id: uid(),
      name: `Guide ${styleGuides.length + 1}`,
      tokens: normalizeTokens(tokens),
      isActive: false,
    };
    setStyleGuides((prev) => [...prev, next]);
    setActiveGuide(next.id);
    setStyleEditorOpen(true);
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
    setActiveSectionPanel(null);
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
    setActiveSectionPanel(null);
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
  const groupedControls = groupControls(selectedMeta?.controls ?? []);
  const availablePanels = [
    groupedControls.styles.length
      ? { id: "styles", label: "Styles" }
      : null,
    groupedControls.animation.length
      ? { id: "animation", label: "Animation" }
      : null,
  ].filter(Boolean);
  const showCmsPanel = Boolean(
    activeSectionPanel === "cms" && selectedInstance && selectedMeta?.cms
  );
  const activeControls =
    activeSectionPanel && activeSectionPanel !== "cms"
      ? groupedControls[activeSectionPanel] ?? []
      : [];
  const showControlsPanel = Boolean(
    activeSectionPanel && activeSectionPanel !== "cms" && selectedInstance
  );
  const showRightPanel =
    showCmsPanel || showControlsPanel || (showInspector && !activeSectionPanel);
  const gridCols = showRightPanel
    ? "grid-cols-[280px_1fr_320px]"
    : "grid-cols-[280px_1fr]";
  const inspectorContext = makeInspectorContext(tokens);

  return (
    <div className={`grid h-dvh grid-rows-[72px_1fr] ${gridCols} bg-[var(--chrome-ground)]`}>
      <header className="col-span-full flex items-center gap-4 border-b border-[var(--chrome-border)] bg-[var(--chrome-surface)] px-5">
        <Link
          href="/"
          className="text-[16px] font-semibold text-[var(--chrome-fg)]"
        >
          MR
        </Link>
        <span className="text-[var(--chrome-border)]">/</span>
        <span className="text-[16px] text-[var(--chrome-fg-muted)]" style={{ textTransform: "none", letterSpacing: "normal" }}>
          {siteName}{initialTemplate ? ` · from "${initialTemplate}"` : ""}
        </span>
        <div className="flex-1" />
        <select
          aria-label="Active page"
          value={activePage?.id ?? ""}
          onChange={(e) => setActivePageId(e.target.value)}
          className="app-input px-3"
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
        <nav role="tablist" className="flex gap-2 border-b border-[var(--chrome-border)] p-3">
          {TOOLS.map((t) => {
            const sel = t.id === activeTool;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={sel}
                onClick={() => setActiveTool(t.id)}
                className={`min-h-11 flex-1 rounded-[0.25rem] border px-3 text-[16px] font-normal transition-colors ${
                  sel
                    ? "border-[var(--chrome-fg)] bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)]"
                    : "border-[var(--chrome-border)] text-[var(--chrome-fg)] hover:border-[var(--chrome-fg)] hover:bg-[var(--chrome-fg)] hover:text-[var(--chrome-fg-inverse)]"
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
              loading={false}
              onSelect={setActiveGuide}
              onAdd={addStyleGuide}
              onEdit={() => setStyleEditorOpen(true)}
              onRenameActive={renameActiveGuide}
            />
          ) : null}
        </div>
      </aside>

      <main
        className="row-start-2 col-start-2 min-h-0 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setActiveSectionPanel(null);
            setSelectedSectionId(null);
          }
        }}
      >
        <div className="sg-canvas-builder" style={{ fontSize: "16px" }}>
          <style dangerouslySetInnerHTML={{ __html: canvasCss }} />
          <Canvas
            page={activePage}
            sectionsMeta={initialSections}
            selectedId={selectedSectionId}
            onSelectSection={(id) => {
              setActiveSectionPanel(null);
              setSelectedSectionId(id);
            }}
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

      {showCmsPanel ? (
        <aside className="row-start-2 col-start-3 min-h-0 overflow-hidden">
          <SectionCmsPanel
            name={selectedMeta?.name ?? selectedInstance?.sectionId}
            cms={selectedMeta.cms}
            value={selectedInstance?.props?.[selectedMeta.cms.key]}
            onChange={(nextItems) =>
              updateSectionProps(selectedSectionId, {
                ...(selectedInstance?.props ?? {}),
                [selectedMeta.cms.key]: nextItems,
              })
            }
            onClose={() => setActiveSectionPanel(null)}
          />
        </aside>
      ) : showControlsPanel ? (
        <aside className="row-start-2 col-start-3 min-h-0 overflow-hidden">
          <SectionControlsPanel
            name={selectedMeta?.name ?? selectedInstance?.sectionId}
            panel={activeSectionPanel}
            controls={activeControls}
            props={selectedInstance?.props ?? {}}
            context={inspectorContext}
            onChange={(next) => updateSectionProps(selectedSectionId, next)}
            onClose={() => setActiveSectionPanel(null)}
          />
        </aside>
      ) : showInspector ? (
        <aside className="row-start-2 col-start-3 min-h-0 overflow-hidden">
          <InspectorPanel
            name={selectedMeta?.name ?? selectedInstance?.sectionId}
            controls={groupedControls.other}
            props={selectedInstance?.props ?? {}}
            context={inspectorContext}
            hasCms={Boolean(selectedMeta?.cms)}
            panels={availablePanels}
            onChange={(next) => updateSectionProps(selectedSectionId, next)}
            onOpenCms={() => setActiveSectionPanel("cms")}
            onOpenPanel={setActiveSectionPanel}
            onClose={() => setSelectedSectionId(null)}
            onMoveUp={() => moveSection(selectedSectionId, -1)}
            onMoveDown={() => moveSection(selectedSectionId, +1)}
            onRemove={() => removeSection(selectedSectionId)}
          />
        </aside>
      ) : null}

      {styleEditorOpen && activeGuide ? (
        <StyleGuideModal
          guide={activeGuide}
          tokens={tokens}
          onTokensChange={updateActiveGuideTokens}
          onRename={renameActiveGuide}
          onClose={() => setStyleEditorOpen(false)}
        />
      ) : null}
    </div>
  );
}

function StyleGuideModal({ guide, tokens, onTokensChange, onRename, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid grid-rows-[72px_1fr] bg-[var(--chrome-ground)] text-[var(--chrome-fg)]">
      <header className="flex items-center gap-4 border-b border-[var(--chrome-border)] bg-[var(--chrome-surface)] px-5">
        <span className="app-eyebrow">
          Editing style guide
        </span>
        <input
          type="text"
          value={guide.name}
          onChange={(e) => onRename(e.target.value)}
          className="app-input min-w-0 max-w-[360px] flex-1 px-3"
          style={{ textTransform: "none", letterSpacing: "normal" }}
          aria-label="Style guide name"
        />
        <div className="flex-1" />
        <button type="button" onClick={onClose} className="btn-chrome btn-chrome--sm">
          Done
        </button>
      </header>
      <div className="min-h-0 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-[1200px]">
          <StyleGuideEditor tokens={tokens} onChange={onTokensChange} />
        </div>
      </div>
    </div>
  );
}

function groupControls(controls) {
  const groups = { styles: [], animation: [], other: [] };
  for (const control of controls) {
    const panel = control.panel;
    if (panel && groups[panel]) {
      groups[panel].push(control);
    } else {
      groups.other.push(control);
    }
  }
  return groups;
}

function makeInspectorContext(tokens) {
  const colors = makeColorTokenOptions(tokens.colors ?? {});
  const typography = TYPOGRAPHY_SCALES.map(([key, label]) => ({
    value: key,
    label,
  }));
  return {
    buttons: tokens.buttons ?? [],
    colors,
    typography,
  };
}

function makeColorTokenOptions(colors) {
  const alphaSteps = [70, 40, 15, 6];
  const baseOptions = Object.keys(colors).map((key) => ({
    value: key,
    label: humanizeToken(key),
  }));
  const fadeOptions = Object.keys(colors).flatMap((key) =>
    alphaSteps.map((alpha) => ({
      value: `${key}/${alpha}`,
      label: `${humanizeToken(key)} ${alpha}%`,
    }))
  );
  return [
    ...baseOptions,
    { value: "transparent", label: "Transparent" },
    ...fadeOptions,
  ];
}

function humanizeToken(key) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function Canvas({ page, sectionsMeta, selectedId, onSelectSection, onMove, onRemove, onPropChange }) {
  if (!page) return null;

  if (page.sections.length === 0) {
    return (
      <div className="grid place-items-center h-full min-h-[60vh] text-[var(--chrome-fg-disabled)]">
        <div className="text-center">
          <p className="text-[16px] font-medium text-[var(--chrome-fg)]" style={{ textTransform: "none", letterSpacing: "normal" }}>Empty canvas</p>
          <p className="app-text mt-2 text-[var(--chrome-fg-subtle)]" style={{ textTransform: "none", letterSpacing: "normal" }}>
            Add a section from the left panel.
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
          <p className="text-[16px]">
            {meta?.name ?? instance.sectionId}
          </p>
          <p className="mt-1 text-[16px]" style={{ textTransform: "none", letterSpacing: "normal" }}>
            implementation missing
          </p>
        </div>
      )}

      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="inline-flex min-h-10 items-center rounded-[0.25rem] bg-[var(--chrome-fg)]/85 px-3 text-[16px] text-[var(--chrome-fg-inverse)]">
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
      className="grid min-h-10 w-10 place-items-center rounded-[0.25rem] bg-[var(--chrome-fg)]/85 text-[16px] text-[var(--chrome-fg-inverse)] hover:bg-[var(--chrome-fg)]"
    >
      {children}
    </button>
  );
}
