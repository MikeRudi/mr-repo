const PACKAGE_VERSION = "0.2.0";
const ALLOWED_COLOR_TOKENS = new Set(["light", "dark", "brand"]);
const ALLOWED_TYPOGRAPHY_TOKENS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "textLarge", "textMain", "textSmall"]);
const ALLOWED_BUTTON_VARIANTS = new Set(["primary", "secondary", "ghost"]);

export const SECTION_PACKAGE_FOLDER = "make-reign-section";
export const SECTION_PACKAGE_MANIFEST = "make-reign-section-package.json";
export const SECTION_BUILDER_FOLDER = "make-reign-section-builder";
export const SECTION_BUILDER_MANIFEST = "make-reign-section-builder.json";

export async function buildSectionTemplatePackage() {
  return {
    kind: "make-reign-section-builder",
    packageVersion: PACKAGE_VERSION,
    createdAt: new Date().toISOString(),
    instructions:
      "Reusable local MakeReign section builder app. Start it locally first, give the user the localhost link, then ask what new section they want to make. Export finished sections as JSON packages for upload.",
    files: buildBuilderFiles(),
  };
}

export function buildSectionPackageFolderFiles(packageData) {
  const files = {};
  for (const [path, content] of Object.entries(packageData.files ?? {})) {
    files[`${SECTION_BUILDER_FOLDER}/${path}`] = content;
  }
  files[`${SECTION_BUILDER_FOLDER}/${SECTION_BUILDER_MANIFEST}`] = JSON.stringify(packageData, null, 2);
  return files;
}

export function buildPackageFromFolderFiles(files) {
  const prefix = findPackagePrefix(files);
  const packageFiles = {};
  for (const [path, content] of Object.entries(files)) {
    if (prefix && !path.startsWith(prefix)) continue;
    const relativePath = prefix ? path.slice(prefix.length) : path;
    if (!relativePath || relativePath === SECTION_PACKAGE_MANIFEST) continue;
    packageFiles[relativePath] = content;
  }

  return {
    kind: "make-reign-section-package",
    packageVersion: PACKAGE_VERSION,
    createdAt: new Date().toISOString(),
    instructions: "This package was rebuilt from an uploaded MakeReign section folder.",
    files: packageFiles,
  };
}

export function validateSectionPackage(packageData) {
  if (!packageData || typeof packageData !== "object") {
    return { ok: false, error: "Package must be a JSON object." };
  }
  if (packageData.kind !== "make-reign-section-package") {
    return { ok: false, error: "Package kind is not supported." };
  }
  if (!packageData.files || typeof packageData.files !== "object") {
    return { ok: false, error: "Package files are missing." };
  }

  const sectionJsonRaw = packageData.files["section/section.json"];
  const sectionJsx = packageData.files["section/Section.jsx"];

  if (typeof sectionJsonRaw !== "string") {
    return { ok: false, error: "`section/section.json` is required." };
  }
  if (typeof sectionJsx !== "string" || !sectionJsx.trim()) {
    return { ok: false, error: "`section/Section.jsx` is required." };
  }

  let manifest;
  try {
    manifest = JSON.parse(sectionJsonRaw);
  } catch {
    return { ok: false, error: "`section/section.json` must be valid JSON." };
  }

  const id = typeof manifest.id === "string" ? manifest.id.trim() : "";
  const name = typeof manifest.name === "string" ? manifest.name.trim() : "";
  const category = typeof manifest.category === "string" ? manifest.category.trim() : "";
  const version = typeof manifest.version === "string" ? manifest.version.trim() : "";

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    return { ok: false, error: "`section.json.id` must be kebab-case." };
  }
  if (!name) return { ok: false, error: "`section.json.name` is required." };
  if (!category) return { ok: false, error: "`section.json.category` is required." };
  if (!version) return { ok: false, error: "`section.json.version` is required." };
  if (!Array.isArray(manifest.controls)) {
    return { ok: false, error: "`section.json.controls` must be an array." };
  }
  if (!manifest.controls.some((control) => control?.panel === "styles")) {
    return { ok: false, error: "At least one `panel: \"styles\"` control is required." };
  }
  if (!manifest.controls.some((control) => control?.panel === "styles" && control?.group === "layout")) {
    return { ok: false, error: "At least one Styles/Layout control is required." };
  }

  for (const control of manifest.controls) {
    if (!control || typeof control !== "object") continue;
    const defaultValue = control.defaultValue;
    const colorBase = typeof defaultValue === "string" ? defaultValue.split("/")[0] : defaultValue;
    if (control.type === "color-token" && typeof defaultValue === "string" && defaultValue !== "transparent" && !ALLOWED_COLOR_TOKENS.has(colorBase)) {
      return { ok: false, error: `Unsupported color token "${defaultValue}". Use light, dark, or brand.` };
    }
    if (control.type === "typography-token" && typeof defaultValue === "string" && !ALLOWED_TYPOGRAPHY_TOKENS.has(defaultValue)) {
      return { ok: false, error: `Unsupported typography token "${defaultValue}". Use h1-h6, textLarge, textMain, or textSmall.` };
    }
    if (control.type === "button-variant" && typeof defaultValue === "string" && !ALLOWED_BUTTON_VARIANTS.has(defaultValue)) {
      return { ok: false, error: `Unsupported button variant "${defaultValue}". Use primary, secondary, or ghost.` };
    }
  }

  return { ok: true, manifest, sectionId: id, name };
}

function buildBuilderFiles() {
  return {
    "AI_TASK.md": buildAiTask(),
    "README.md": buildReadme(),
    "package.json": buildPackageJson(),
    "index.html": buildIndexHtml(),
    "vite.config.js": buildViteConfig(),
    "_shared/EditableText.jsx": buildSharedEditableText(),
    "_shared/styleguide-defaults.js": buildSharedStyleguideDefaults(),
    "src/LocalSectionBuilder.jsx": buildLocalSectionBuilder(),
    "src/main.jsx": buildMain(),
    "src/builder.css": buildBuilderCss(),
    "scripts/new-section.mjs": buildNewSectionScript(),
    "scripts/export-section.mjs": buildExportSectionScript(),
    "templates/starter-section/Section.jsx": buildSectionJsx(),
    "templates/starter-section/Section.module.css": buildSectionCss(),
    "templates/starter-section/section.json": buildSectionJson(),
    "templates/starter-section/README.md": buildSectionReadme(),
    "sections/new-section-template/Section.jsx": buildSectionJsx(),
    "sections/new-section-template/Section.module.css": buildSectionCss(),
    "sections/new-section-template/section.json": buildSectionJson(),
    "sections/new-section-template/README.md": buildSectionReadme(),
    "rules/component-contract.md": COMPONENT_CONTRACT_RULES,
    "rules/export.md": SECTION_EXPORT_RULES,
    "rules/local-builder.md": LOCAL_BUILDER_RULES,
    "rules/section-panel.md": SECTION_PANEL_RULES,
    "rules/url-reference.md": URL_REFERENCE_RULES,
    "rules/section.schema.json": SECTION_SCHEMA_REFERENCE,
  };
}

function buildAiTask() {
  return `# AI Task: Start The MakeReign Local Section Builder

You are helping the user launch the reusable MakeReign Local Section Builder app.

## User Prompt This App Is Built For

\`\`\`
Start the app inside make-reign-section-builder.zip; run it on local and give me the link.
\`\`\`

## First Run Workflow

1. Unzip \`make-reign-section-builder.zip\`.
2. Work inside the unzipped \`make-reign-section-builder/\` folder.
3. Read \`README.md\` and every file in \`rules/\`.
4. Run \`npm install\`.
5. Run \`npm run dev\`.
6. Give the user the localhost URL printed by Vite.
7. Ask the user what new section they want to make.

Do not start building a section until the user gives a section URL or description.

## When The User Wants A Section

Create one folder in \`sections/<section-id>/\`:

\`\`\`bash
npm run new -- klarheit-contact-01
\`\`\`

Then edit that section folder, preview it in the app, and export it when ready.

## Source Of Truth

Each section project is only these files:

\`\`\`text
sections/<section-id>/
  Section.jsx
  Section.module.css
  section.json
  README.md
\`\`\`

Do not create a second app. Do not edit \`node_modules\`, \`dist\`, or generated export files.
`;
}

function buildReadme() {
  return `# MakeReign Local Section Builder

This is a reusable local app for creating MakeReign sections with a local AI model.

## Main Prompt

\`\`\`
Start the app inside make-reign-section-builder.zip; run it on local and give me the link.
\`\`\`

## Run The App

\`\`\`bash
npm install
npm run dev
\`\`\`

Open the localhost URL printed by Vite.

After the app is running, the AI should ask what new section you want to make.

## Make A Section

Each local section lives in \`sections/<section-id>/\`.

To create a new starter section:

\`\`\`bash
npm run new -- klarheit-contact-01
\`\`\`

Then ask your AI to edit:

- \`sections/klarheit-contact-01/Section.jsx\`
- \`sections/klarheit-contact-01/Section.module.css\`
- \`sections/klarheit-contact-01/section.json\`
- \`sections/klarheit-contact-01/README.md\`

Restart the dev server if the new section does not appear immediately.

## Preview And Export

The app shows the selected section and a MakeReign-style prop panel:

- Update CMS
- Update Styles
- Update Animation
- Auto play or Play animation when relevant

When the section is ready, click \`Export section JSON\` in the app. It downloads a clean JSON upload package for the selected section. You can also run:

\`\`\`bash
npm run export -- klarheit-contact-01
\`\`\`

Upload the exported JSON file to the MakeReign library.

## Important

The local builder app is reusable. Do not redownload it for every section unless the MakeReign app updates the builder package.
`;
}

function buildPackageJson() {
  return JSON.stringify(
    {
      name: "make-reign-section-builder",
      version: PACKAGE_VERSION,
      private: true,
      type: "module",
      scripts: {
        start: "vite --host 127.0.0.1",
        dev: "vite --host 127.0.0.1",
        build: "vite build",
        preview: "vite preview --host 127.0.0.1",
        new: "node scripts/new-section.mjs",
        export: "node scripts/export-section.mjs",
      },
      dependencies: {
        "@vitejs/plugin-react": "latest",
        vite: "latest",
        react: "latest",
        "react-dom": "latest",
      },
      devDependencies: {},
    },
    null,
    2
  );
}

function buildIndexHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MakeReign Local Section Builder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
}

function buildViteConfig() {
  return `import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "../../_shared/EditableText.jsx",
        replacement: fileURLToPath(new URL("./_shared/EditableText.jsx", import.meta.url)),
      },
      {
        find: "../../../../lib/styleguide-defaults.js",
        replacement: fileURLToPath(new URL("./_shared/styleguide-defaults.js", import.meta.url)),
      },
    ],
  },
});
`;
}

function buildMain() {
  return `import React from "react";
import { createRoot } from "react-dom/client";
import LocalSectionBuilder from "./LocalSectionBuilder.jsx";
import "./builder.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LocalSectionBuilder />
  </React.StrictMode>
);
`;
}

function buildLocalSectionBuilder() {
  return `import { useMemo, useState } from "react";

const manifests = import.meta.glob("../sections/*/section.json", { eager: true });
const components = import.meta.glob("../sections/*/Section.jsx", { eager: true });
const sectionSource = import.meta.glob("../sections/*/Section.jsx", { eager: true, query: "?raw", import: "default" });
const cssSource = import.meta.glob("../sections/*/Section.module.css", { eager: true, query: "?raw", import: "default" });
const jsonSource = import.meta.glob("../sections/*/section.json", { eager: true, query: "?raw", import: "default" });
const readmeSource = import.meta.glob("../sections/*/README.md", { eager: true, query: "?raw", import: "default" });
const ruleSource = import.meta.glob("../rules/*", { eager: true, query: "?raw", import: "default" });

const COLOR_OPTIONS = [["light", "Light"], ["dark", "Dark"], ["brand", "Brand"], ["transparent", "Transparent"], ["light/70", "Light 70%"], ["dark/70", "Dark 70%"], ["brand/70", "Brand 70%"], ["light/40", "Light 40%"], ["dark/40", "Dark 40%"], ["brand/40", "Brand 40%"]];
const TYPOGRAPHY_OPTIONS = [["h1", "H1"], ["h2", "H2"], ["h3", "H3"], ["h4", "H4"], ["h5", "H5"], ["h6", "H6"], ["textLarge", "Text large"], ["textMain", "Text main"], ["textSmall", "Text small"]];
const BUTTON_OPTIONS = [["primary", "Primary"], ["secondary", "Secondary"], ["ghost", "Ghost"]];

function sectionSlug(path) {
  return path.match(/\\.\\.\\/sections\\/([^/]+)\\//)?.[1] ?? "";
}

function loadSections() {
  return Object.entries(manifests)
    .map(([path, mod]) => {
      const slug = sectionSlug(path);
      return {
        slug,
        manifest: mod.default ?? mod,
        Component: components[\`../sections/\${slug}/Section.jsx\`]?.default,
        source: sectionSource[\`../sections/\${slug}/Section.jsx\`] ?? "",
        css: cssSource[\`../sections/\${slug}/Section.module.css\`] ?? "",
        json: jsonSource[\`../sections/\${slug}/section.json\`] ?? "",
        readme: readmeSource[\`../sections/\${slug}/README.md\`] ?? "",
      };
    })
    .filter((section) => section.slug && section.Component)
    .sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));
}

function defaultPropsFromManifest(manifest) {
  const props = {};
  for (const control of manifest.controls ?? []) {
    if (control.defaultValue !== undefined) props[control.key] = control.defaultValue;
  }
  if (manifest.cms?.key) props[manifest.cms.key] = manifest.cms.defaultValue ?? [];
  return props;
}

function groupedControls(manifest) {
  const groups = { styles: [], animation: [], other: [] };
  for (const control of manifest.controls ?? []) {
    const panel = control.panel;
    if (panel && groups[panel]) groups[panel].push(control);
    else groups.other.push(control);
  }
  return groups;
}

export default function LocalSectionBuilder() {
  const sections = useMemo(loadSections, []);
  const [selectedSlug, setSelectedSlug] = useState(sections[0]?.slug ?? "");
  const selected = sections.find((section) => section.slug === selectedSlug) ?? sections[0];
  const [propsBySlug, setPropsBySlug] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.slug, defaultPropsFromManifest(section.manifest)]))
  );
  const [activePanel, setActivePanel] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [exportStatus, setExportStatus] = useState("");
  const [newSectionStatus, setNewSectionStatus] = useState("");
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  if (!selected) {
    return (
      <main className="mr-empty-app">
        <h1>No sections found</h1>
        <p>Ask your AI to run <code>npm run new -- my-section-id</code>, then restart this dev server.</p>
      </main>
    );
  }

  const props = propsBySlug[selected.slug] ?? defaultPropsFromManifest(selected.manifest);
  const groups = groupedControls(selected.manifest);
  const cms = selected.manifest.cms;
  const hasAnimation = groups.animation.length > 0;
  const autoControl = (selected.manifest.controls ?? []).find(
    (control) => control.type === "toggle" && /auto/i.test(control.key + control.label)
  );
  const Component = selected.Component;

  function update(key, value) {
    setPropsBySlug((current) => ({
      ...current,
      [selected.slug]: {
        ...(current[selected.slug] ?? {}),
        [key]: value,
      },
    }));
  }

  function selectSection(slug) {
    setSelectedSlug(slug);
    setActivePanel(null);
    setExportStatus("");
    setNewSectionStatus("");
  }

  function showNewSectionHelp() {
    setNewSectionStatus("Ask your AI to run: npm run new -- kebab-case-section-id. Restart this app if the new project does not appear.");
  }

  function exportSection() {
    const packageData = createSectionPackage(selected);
    const blob = new Blob([JSON.stringify(packageData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`make-reign-\${selected.manifest.id}.json\`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setExportStatus(\`Exported make-reign-\${selected.manifest.id}.json\`);
  }

  return (
    <main className={isPreviewFullscreen ? "mr-builder mr-builder--preview" : "mr-builder"}>
      <aside className="mr-panel mr-panel--left">
        <div className="mr-panel__header">
          <p className="mr-eyebrow">Section project</p>
          <h1>Build Mode</h1>
          <p>Create sections locally, then export one JSON package for upload.</p>
        </div>

        <label className="mr-control">
          <span>Section project</span>
          <select value={selected.slug} onChange={(event) => selectSection(event.target.value)}>
            {sections.map((section) => (
              <option key={section.slug} value={section.slug}>{section.manifest.name}</option>
            ))}
          </select>
        </label>

        <button type="button" className="mr-full-button" onClick={showNewSectionHelp}>Start a new section</button>
        <button type="button" className="mr-full-button" onClick={() => setIsPreviewFullscreen(true)}>Preview fullscreen</button>
        {newSectionStatus ? <p className="mr-status">{newSectionStatus}</p> : null}

        <div className="mr-project-card">
          <p className="mr-eyebrow">Selected</p>
          <h2>{selected.manifest.name}</h2>
          <p>{selected.manifest.id}</p>
        </div>

        <button type="button" className="mr-export" onClick={exportSection}>Export section JSON</button>
        {exportStatus ? <p className="mr-status">{exportStatus}</p> : null}
      </aside>

      <section className="mr-canvas">
        {isPreviewFullscreen ? (
          <button type="button" className="mr-preview-exit" onClick={() => setIsPreviewFullscreen(false)}>Exit preview</button>
        ) : null}
        <div className="mr-style-scope">
          <Component key={previewKey} {...props} _editing _onPropChange={update} />
        </div>
      </section>

      <aside className="mr-panel mr-panel--right">
        {!activePanel ? (
          <InspectorBasePanel
            name={selected.manifest.name}
            hasCms={Boolean(cms)}
            hasAnimation={hasAnimation}
            autoControl={autoControl}
            props={props}
            onOpenCms={() => setActivePanel("cms")}
            onOpenPanel={setActivePanel}
            onPlayAnimation={() => setPreviewKey((key) => key + 1)}
            onToggleAuto={(value) => update(autoControl.key, value)}
          />
        ) : activePanel === "cms" ? (
          <CmsPanel
            name={selected.manifest.name}
            cms={cms}
            value={props[cms?.key] ?? []}
            onChange={(value) => update(cms.key, value)}
            onClose={() => setActivePanel(null)}
          />
        ) : (
          <FocusedControlsPanel
            name={selected.manifest.name}
            panel={activePanel}
            controls={groups[activePanel] ?? []}
            props={props}
            update={update}
            onClose={() => setActivePanel(null)}
          />
        )}
      </aside>
    </main>
  );
}

function InspectorBasePanel({ name, hasCms, hasAnimation, autoControl, props, onOpenCms, onOpenPanel, onPlayAnimation, onToggleAuto }) {
  const autoValue = autoControl ? Boolean(props[autoControl.key] ?? autoControl.defaultValue) : false;
  return (
    <div className="mr-inspector">
      <header className="mr-inspector-header">
        <span>{name}</span>
        <button type="button" aria-label="Close inspector">x</button>
      </header>
      <div className="mr-inspector-body">
        <div className="mr-panel-card">
          <p className="mr-panel-label">Section panels</p>
          <div className="mr-panel-actions">
            {hasCms ? <button type="button" onClick={onOpenCms}>Update CMS</button> : null}
            <button type="button" className="mr-ghost-button" onClick={() => onOpenPanel("styles")}>Update Styles</button>
            {hasAnimation ? <button type="button" className="mr-ghost-button" onClick={() => onOpenPanel("animation")}>Update Animation</button> : null}
            {autoControl ? (
              <button type="button" className={autoValue ? "" : "mr-ghost-button"} onClick={() => onToggleAuto(!autoValue)} aria-pressed={autoValue}>
                Auto play {autoValue ? "On" : "Off"}
              </button>
            ) : null}
            <button type="button" className="mr-ghost-button" onClick={onPlayAnimation}>Play animation</button>
          </div>
        </div>
        <p className="mr-empty">Double-click visible section text in the preview to edit it inline.</p>
      </div>
    </div>
  );
}

function FocusedControlsPanel({ name, panel, controls, props, update, onClose }) {
  const grouped = panel === "styles" ? groupStyleControls(controls) : null;
  return (
    <div className="mr-inspector">
      <PanelHeader title={panel === "styles" ? "Styles" : panel === "animation" ? "Animation" : "Controls"} subtitle={name} onClose={onClose} />
      <div className="mr-inspector-body">
        {controls.length === 0 ? <p className="mr-empty">No controls in this panel yet.</p> : null}
        {grouped ? grouped.map((group) => (
          <details key={group.id} className="mr-details">
            <summary>{group.label}</summary>
            <div className="mr-details-body">
              {group.controls.map((control) => (
                <Control key={control.key} control={control} value={props[control.key] ?? control.defaultValue ?? ""} onChange={(value) => update(control.key, value)} />
              ))}
            </div>
          </details>
        )) : controls.map((control) => (
          <Control key={control.key} control={control} value={props[control.key] ?? control.defaultValue ?? ""} onChange={(value) => update(control.key, value)} />
        ))}
      </div>
    </div>
  );
}

function groupStyleControls(controls) {
  return [["typography", "Typography"], ["layout", "Layout"], ["color", "Color"], ["spacing", "Spacing"]]
    .map(([id, label]) => ({ id, label, controls: controls.filter((control) => control.group === id) }))
    .filter((group) => group.controls.length > 0);
}

function PanelHeader({ title, subtitle, onClose }) {
  return (
    <header className="mr-inspector-header">
      <div className="mr-inspector-title">
        <p>{title}</p>
        <span>{subtitle}</span>
      </div>
      <button type="button" onClick={onClose} aria-label="Close panel">x</button>
    </header>
  );
}

function CmsPanel({ name, cms, value, onChange, onClose }) {
  const rows = Array.isArray(value) ? value : [];
  const fields = cms.fields ?? [];
  function updateRow(index, key, nextValue) {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: nextValue } : row));
  }
  function addRow() {
    const template = fields.reduce((row, field) => ({ ...row, [field.key]: "" }), {});
    onChange([...rows, template]);
  }
  function removeRow(index) {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  }
  return (
    <div className="mr-inspector">
      <PanelHeader title="Section CMS" subtitle={name} onClose={onClose} />
      <div className="mr-inspector-body">
        <div className="mr-cms-heading">
          <p>{cms.label ?? "Items"}</p>
          <button type="button" onClick={addRow}>+ Add item</button>
        </div>
        {rows.length === 0 ? <p className="mr-empty">No items yet.</p> : null}
        <ul className="mr-cms-list">
          {rows.map((row, index) => (
            <li key={index} className="mr-cms-row">
              <div className="mr-cms-row-header">
                <span>Item {index + 1}</span>
                <button type="button" onClick={() => removeRow(index)}>Remove</button>
              </div>
              <div className="mr-cms-fields">
                {fields.map((field) => (
                  <label key={field.key} className="mr-control">
                    <span>{field.label ?? field.key}</span>
                    {field.type === "textarea" ? (
                      <textarea value={row[field.key] ?? ""} onChange={(event) => updateRow(index, field.key, event.target.value)} />
                    ) : (
                      <input value={row[field.key] ?? ""} onChange={(event) => updateRow(index, field.key, event.target.value)} />
                    )}
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Control({ control, value, onChange }) {
  return (
    <label className="mr-control">
      <span>{control.label ?? control.key}</span>
      {renderControl(control, value, onChange)}
    </label>
  );
}

function renderControl(control, value, onChange) {
  if (control.type === "slider") {
    const min = control.min ?? 0;
    const max = control.max ?? 100;
    const mid = Math.round((min + max) / 2);
    const defaultValue = typeof control.defaultValue === "number" ? control.defaultValue : mid;
    const current = typeof value === "number" ? value : defaultValue;
    const isPercent = min === 0 && max === 100;
    return (
      <div className="mr-slider">
        <input type="range" min={min} max={max} step={control.step ?? 1} value={current} onChange={(event) => onChange(Number(event.target.value))} onDoubleClick={() => onChange(defaultValue)} />
        <div className="mr-slider-scale">
          <span>{isPercent ? "0%" : min}</span>
          <span>{isPercent ? defaultValue + "%" : defaultValue}</span>
          <span>{isPercent ? "100%" : max}</span>
        </div>
      </div>
    );
  }
  if (control.type === "toggle") return <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />;
  if (control.type === "select") {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {(control.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label ?? option.value}</option>)}
      </select>
    );
  }
  if (control.type === "color-token") return <TokenSelect options={COLOR_OPTIONS} value={value} onChange={onChange} />;
  if (control.type === "typography-token") return <TokenSelect options={TYPOGRAPHY_OPTIONS} value={value} onChange={onChange} />;
  if (control.type === "button-variant") return <TokenSelect options={BUTTON_OPTIONS} value={value} onChange={onChange} />;
  if (control.type === "textarea") return <textarea value={value} onChange={(event) => onChange(event.target.value)} />;
  return <input value={value} onChange={(event) => onChange(event.target.value)} />;
}

function TokenSelect({ options, value, onChange }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}
    </select>
  );
}

function createSectionPackage(section) {
  const files = {
    "section/Section.jsx": section.source,
    "section/Section.module.css": section.css,
    "section/section.json": section.json,
    "section/README.md": section.readme,
  };
  for (const [path, content] of Object.entries(ruleSource)) {
    files[\`rules/\${path.split("/").pop()}\`] = content;
  }
  return {
    kind: "make-reign-section-package",
    packageVersion: "0.2.0",
    createdAt: new Date().toISOString(),
    instructions: "Exported from the MakeReign Local Section Builder.",
    files,
  };
}
`;
}

function buildBuilderCss() {
  return `:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #0a0b0d;
  background: #f4f4f1;
  --chrome-ground: #ffffff;
  --chrome-surface: #ffffff;
  --chrome-surface-muted: #f4f4f1;
  --chrome-fg: #0a0b0d;
  --chrome-fg-muted: rgba(10, 11, 13, 0.68);
  --chrome-border: rgba(10, 11, 13, 0.14);
  --chrome-primary: #2c8a5a;
  --sg-color-light: #ffffff;
  --sg-color-dark: #0a0b0d;
  --sg-color-brand: #2c8a5a;
  --sg-space-sitePadding: 2rem;
  --sg-radius-small: 0.25rem;
  --sg-radius-medium: 0.5rem;
  --sg-font-primary: Inter, ui-sans-serif, system-ui, sans-serif;
  --sg-font-secondary: Inter, ui-sans-serif, system-ui, sans-serif;
}

* { box-sizing: border-box; }
body { margin: 0; }
button, input, select, textarea { font: inherit; }

.mr-builder {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr) minmax(300px, 360px);
  min-height: 100vh;
}

.mr-empty-app {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 2rem;
}

.mr-panel {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
  background: var(--chrome-surface);
  padding: 1rem;
}

.mr-panel--left {
  border-right: 1px solid var(--chrome-border);
}

.mr-panel--right {
  border-left: 1px solid var(--chrome-border);
  padding: 0;
}

.mr-panel__header {
  border-bottom: 1px solid var(--chrome-border);
  padding-bottom: 1rem;
}

.mr-panel__header h1 {
  margin: 0.25rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.mr-panel__header p,
.mr-status {
  margin: 0;
  color: var(--chrome-fg-muted);
}

.mr-eyebrow {
  color: rgba(10, 11, 13, 0.7);
  font-size: 0.85rem;
}

.mr-actions,
.mr-control-list {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
}

.mr-actions button,
.mr-actions label,
.mr-full-button,
.mr-panel-row button,
.mr-cms-row button {
  min-height: 2.5rem;
  border: 1px solid var(--chrome-border);
  border-radius: 0.25rem;
  background: transparent;
  color: var(--chrome-fg);
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.mr-actions button:hover,
.mr-full-button:hover,
.mr-panel-row button:hover,
.mr-cms-row button:hover,
.mr-export {
  background: var(--chrome-fg);
  color: #fff;
}

.mr-full-button,
.mr-export {
  width: 100%;
  margin-top: 1rem;
}

.mr-project-card {
  display: grid;
  gap: 0.35rem;
  margin-top: 1rem;
  border: 1px solid var(--chrome-border);
  border-radius: 0.25rem;
  padding: 0.85rem;
}

.mr-project-card h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.mr-project-card p {
  margin: 0;
  color: var(--chrome-fg-muted);
}

.mr-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mr-empty {
  margin-top: 1rem;
  color: var(--chrome-fg-muted);
  line-height: 1.5;
}

.mr-inspector {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.mr-inspector-header {
  display: flex;
  min-height: 4rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid var(--chrome-border);
  padding: 0 1.25rem;
}

.mr-inspector-header > span,
.mr-inspector-title p {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 500;
  color: var(--chrome-fg);
}

.mr-inspector-title {
  min-width: 0;
}

.mr-inspector-title span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--chrome-fg-muted);
  font-size: 1rem;
}

.mr-inspector-header button,
.mr-panel-actions button,
.mr-cms-heading button,
.mr-cms-row-header button {
  min-height: 2.5rem;
  border: 1px solid var(--chrome-border);
  border-radius: 0.25rem;
  background: transparent;
  color: var(--chrome-fg);
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.mr-inspector-header button {
  width: 2.5rem;
  padding: 0;
}

.mr-inspector-header button:hover,
.mr-panel-actions button:hover,
.mr-cms-heading button:hover {
  background: var(--chrome-fg);
  color: #fff;
}

.mr-inspector-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
  padding: 1.25rem;
}

.mr-panel-card,
.mr-details,
.mr-cms-row {
  border: 1px solid var(--chrome-border);
  border-radius: 0.25rem;
  background: var(--chrome-ground);
}

.mr-panel-card {
  padding: 1rem;
}

.mr-panel-label {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--chrome-fg);
}

.mr-panel-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mr-panel-actions button {
  width: 100%;
}

.mr-panel-actions .mr-ghost-button {
  background: transparent;
}

.mr-details summary {
  cursor: pointer;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--chrome-fg);
}

.mr-details-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border-top: 1px solid var(--chrome-border);
  padding: 1rem;
}

.mr-cms-heading,
.mr-cms-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.mr-cms-heading p {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--chrome-fg);
}

.mr-cms-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mr-cms-row {
  padding: 1rem;
}

.mr-cms-row-header {
  margin-bottom: 0.75rem;
}

.mr-cms-row-header span {
  color: var(--chrome-fg-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
}

.mr-cms-row-header button {
  border: 0;
  color: #a33;
  padding: 0;
}

.mr-cms-fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mr-control,
.mr-cms-row label {
  display: grid;
  gap: 0.4rem;
}

.mr-control span,
.mr-cms-row span {
  font-weight: 500;
}

.mr-control input,
.mr-control select,
.mr-control textarea,
.mr-cms-row input,
.mr-cms-row textarea {
  width: 100%;
  min-height: 2.5rem;
  border: 1px solid var(--chrome-border);
  border-radius: 0.25rem;
  padding: 0.5rem;
  background: #fff;
}

.mr-control textarea,
.mr-cms-row textarea {
  min-height: 5rem;
  resize: vertical;
}

.mr-slider {
  display: grid;
  gap: 0.5rem;
}

.mr-slider-scale {
  display: flex;
  justify-content: space-between;
  color: var(--chrome-fg-muted);
  font-size: 0.7rem;
}

.mr-canvas {
  position: relative;
  min-width: 0;
  overflow: auto;
}

.mr-builder--preview {
  grid-template-columns: 1fr;
}

.mr-builder--preview .mr-panel {
  display: none;
}

.mr-builder--preview .mr-canvas {
  min-height: 100vh;
}

.mr-preview-exit {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  min-height: 2.5rem;
  border: 1px solid var(--chrome-border);
  border-radius: 0.25rem;
  background: var(--chrome-fg);
  color: #fff;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.mr-style-scope {
  min-height: 100vh;
  background: var(--chrome-ground);
}

.mr-style-scope h1, .mr-style-scope .sg-h1 { font-size: 4.5rem; line-height: 1; font-weight: 600; }
.mr-style-scope h2, .mr-style-scope .sg-h2 { font-size: 3.5rem; line-height: 1.04; font-weight: 600; }
.mr-style-scope h3, .mr-style-scope .sg-h3 { font-size: 2.5rem; line-height: 1.1; font-weight: 600; }
.mr-style-scope h4, .mr-style-scope .sg-h4 { font-size: 2rem; line-height: 1.15; font-weight: 600; }
.mr-style-scope h5, .mr-style-scope .sg-h5 { font-size: 1.5rem; line-height: 1.2; font-weight: 600; }
.mr-style-scope h6, .mr-style-scope .sg-h6 { font-size: 1.125rem; line-height: 1.25; font-weight: 600; }
.mr-style-scope p, .mr-style-scope .sg-text-main { font-size: 1rem; line-height: 1.55; }
.mr-style-scope .sg-text-large { font-size: 1.25rem; line-height: 1.45; }
.mr-style-scope .sg-text-small { font-size: 1rem; line-height: 1.45; }

.sg-button, .sg-button-secondary, .sg-button-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  border: 1px solid var(--sg-color-dark);
  padding: 1em 1.75em;
  text-decoration: none;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
}

.sg-button { background: var(--sg-color-dark); color: var(--sg-color-light); }
.sg-button-secondary, .sg-button-ghost { background: transparent; color: var(--sg-color-dark); }
.sg-button:hover, .sg-button-secondary:hover, .sg-button-ghost:hover { background: var(--sg-color-brand); border-color: var(--sg-color-brand); color: var(--sg-color-light); }

.editable-text {
  outline: 2px dashed rgba(44, 138, 90, 0.45);
  outline-offset: 0.2rem;
}

@media (max-width: 900px) {
  .mr-builder { grid-template-columns: 1fr; }
  .mr-panel { position: relative; height: auto; border-right: 0; border-left: 0; border-bottom: 1px solid var(--chrome-border); }
}
`;
}

function buildNewSectionScript() {
  return `import { promises as fs } from "node:fs";
import path from "node:path";

const id = process.argv[2];
if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.error("Usage: npm run new -- kebab-case-section-id");
  process.exit(1);
}

const root = process.cwd();
const target = path.join(root, "sections", id);
const template = path.join(root, "templates", "starter-section");

try {
  await fs.mkdir(target);
} catch (error) {
  if (error.code === "EEXIST") {
    console.error("Section already exists:", id);
    process.exit(1);
  }
  throw error;
}

for (const file of ["Section.jsx", "Section.module.css", "README.md"]) {
  await fs.copyFile(path.join(template, file), path.join(target, file));
}

const raw = await fs.readFile(path.join(template, "section.json"), "utf8");
const manifest = JSON.parse(raw);
manifest.id = id;
manifest.name = id
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");
await fs.writeFile(path.join(target, "section.json"), JSON.stringify(manifest, null, 2) + "\\n");

console.log("Created sections/" + id);
console.log("Restart npm run dev if the section does not appear in the app.");
`;
}

function buildExportSectionScript() {
  return `import { promises as fs } from "node:fs";
import path from "node:path";

async function read(filePath) {
  return fs.readFile(filePath, "utf8");
}

async function collectRules(root) {
  const rules = {};
  for (const entry of await fs.readdir(path.join(root, "rules"), { withFileTypes: true })) {
    if (entry.isFile()) {
      rules["rules/" + entry.name] = await read(path.join(root, "rules", entry.name));
    }
  }
  return rules;
}

const root = process.cwd();
const requested = process.argv[2];
let sectionId = requested;
if (!sectionId) {
  const entries = await fs.readdir(path.join(root, "sections"), { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  if (folders.length === 1) sectionId = folders[0];
}
if (!sectionId) {
  console.error("Usage: npm run export -- section-id");
  process.exit(1);
}

const sectionRoot = path.join(root, "sections", sectionId);
const files = {
  "section/Section.jsx": await read(path.join(sectionRoot, "Section.jsx")),
  "section/Section.module.css": await read(path.join(sectionRoot, "Section.module.css")),
  "section/section.json": await read(path.join(sectionRoot, "section.json")),
  "section/README.md": await read(path.join(sectionRoot, "README.md")),
  ...await collectRules(root),
};
const manifest = JSON.parse(files["section/section.json"]);
const reviewManifest = {
  kind: "make-reign-section-package",
  packageVersion: "0.2.0",
  createdAt: new Date().toISOString(),
  instructions: "Exported from the MakeReign Local Section Builder.",
  files,
};

const outPath = path.resolve(root, "exports", "make-reign-" + manifest.id + ".json");
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, JSON.stringify(reviewManifest, null, 2) + "\\n");
console.log("Created " + outPath);
`;
}

function buildSharedEditableText() {
  return `"use client";

import { useEffect, useRef } from "react";

export default function EditableText({
  value,
  editing = false,
  multiline = false,
  onChange,
  as: Tag = "span",
  className = "",
  placeholder = "",
  ...rest
}) {
  const ref = useRef(null);
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return;
    if (ref.current.innerText !== (value ?? "")) ref.current.innerText = value ?? "";
    lastValueRef.current = value;
  }, [value]);

  if (!editing) {
    return <Tag className={className} {...rest}>{value || placeholder}</Tag>;
  }

  const commit = () => {
    const next = ref.current?.innerText ?? "";
    if (next !== lastValueRef.current) {
      lastValueRef.current = next;
      onChange?.(next);
    }
  };

  return (
    <Tag
      ref={ref}
      className={className + " editable-text"}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onDoubleClick={(event) => {
        const el = event.currentTarget;
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          ref.current?.blur();
        } else if (event.key === "Enter" && !multiline) {
          event.preventDefault();
          ref.current?.blur();
        }
      }}
      onBlur={commit}
      data-placeholder={placeholder}
      {...rest}
    >
      {value}
    </Tag>
  );
}
`;
}

function buildSharedStyleguideDefaults() {
  return `export function buttonClass(variant = "primary") {
  return variant === "primary" ? "sg-button" : "sg-button-" + variant;
}
`;
}

const COMPONENT_CONTRACT_RULES = `# Component Contract

These rules make generated sections compatible with MakeReign.

## Source Files

Each local section project lives in \`sections/<section-id>/\` and must contain:

- \`Section.jsx\`
- \`Section.module.css\`
- \`section.json\`
- \`README.md\`

Do not create a second app. The reusable local builder app already exists.

## Required Section.jsx Shape

\`\`\`jsx
"use client";

import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";

export default function SectionName({
  heading = "Default heading",
  _editing = false,
  _onPropChange,
} = {}) {
  const persist = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  return (
    <section className={styles.root}>
      <EditableText
        as="h2"
        value={heading}
        editing={_editing}
        onChange={(value) => persist("heading", value)}
      />
    </section>
  );
}
\`\`\`

## Allowed Imports

- \`import styles from "./Section.module.css";\`
- \`import EditableText from "../../_shared/EditableText.jsx";\`
- Optional React hooks from \`react\` only if needed.
- Optional \`buttonClass\` from \`../../../../lib/styleguide-defaults.js\` only when a button variant is rendered.

Do not import from external packages, remote URLs, app routes, or absolute local paths.

## Style Guide Tokens

Use these token ids as defaults:

- Colors: \`light\`, \`dark\`, \`brand\`
- Faded colors: \`dark/70\`, \`brand/40\`, etc. Parse slash values and apply them with \`color-mix(... transparent)\`.
- Typography: \`h1\`, \`h2\`, \`h3\`, \`h4\`, \`h5\`, \`h6\`, \`textLarge\`, \`textMain\`, \`textSmall\`
- Button variants: \`primary\`, \`secondary\`, \`ghost\`

Do not invent token ids.

## Inline Editable Text

Top-level visible copy uses \`EditableText\` and props such as:

- \`eyebrow\`
- \`heading\`
- \`body\`
- \`ctaLabel\`

Do not put visible section-level copy in normal panel controls.

## CMS Repeatable Content

Repeated cards, links, contact methods, locations, form fields, team members, stats, FAQs, logos, and testimonials must use \`cms\` in \`section.json\`.

The \`cms.key\` must match the component prop name.

## Form Sections

If the referenced section has a form, render a static visual form with semantic \`form\`, \`label\`, \`input\`, \`textarea\`, and \`button\` elements. Do not add submission logic, APIs, validation libraries, or external scripts.
`;

const SECTION_EXPORT_RULES = `# Export Rules

Use the local app's \`Export section JSON\` button for the selected section, or run:

\`\`\`bash
npm run export -- section-id
\`\`\`

The exported upload JSON must be a single \`make-reign-section-package\` object with:

\`\`\`text
{
  "kind": "make-reign-section-package",
  "packageVersion": "0.2.0",
  "files": {
    "section/Section.jsx": "...",
    "section/Section.module.css": "...",
    "section/README.md": "...",
    "section/section.json": "...",
    "rules/section-panel.md": "..."
  }
}
\`\`\`

Do not upload the whole local builder app. Upload only the exported \`make-reign-<section-id>.json\`.

Do not include \`node_modules\`, \`dist\`, temp files, private keys, screenshots, or absolute filesystem paths.
`;

const LOCAL_BUILDER_RULES = `# Local Builder Rules

This downloaded app is reusable. A user should not need to redownload it for every section.

## Create Sections

Create each section as its own folder:

\`\`\`text
sections/<section-id>/
  Section.jsx
  Section.module.css
  README.md
  section.json
\`\`\`

Use:

\`\`\`bash
npm run new -- section-id
\`\`\`

Restart \`npm run dev\` if a newly created section does not appear in the selector.

## Preview

The app previews the selected section and renders a generated MakeReign-style panel:

- Left panel: section project selector, \`Start a new section\`, and export.
- Left panel: \`Preview fullscreen\` so the user can inspect the selected section without panels.
- Center: live section preview.
- Right panel: \`Update CMS\`, \`Update Styles\`, \`Update Animation\`, and \`Play animation\`.
- \`Update CMS\` appears when \`section.json.cms\` exists.
- \`Update Styles\` is always expected.
- \`Update Animation\` appears when animation controls exist.
- \`Auto play\` appears for automatic animation toggles.
- \`Play animation\` appears when animation exists without auto-play.

## Responsiveness

Every section must be responsive on desktop, tablet, and mobile. Use CSS Grid/Flex with wrapping, fluid widths, and media queries when needed. Test at roughly 1440px, 768px, and 390px widths before export.

On tablet and mobile:

- Text must not overlap images, cards, or controls.
- Images and media must keep stable aspect ratios and never overflow the viewport.
- Cards and repeated CMS items should wrap or stack cleanly.
- Section padding and gaps should scale down while still using the section's slider-driven values.

## Export

Use the in-app \`Export section JSON\` button for the selected section. It downloads a clean upload JSON package for that section only.
`;

const URL_REFERENCE_RULES = `# URL Reference Rules

When the user gives a URL, build one section from that URL. Do not copy a full website.

For Flowbase URLs like:

\`\`\`text
https://www.flowbase.co/components?component=klarheit-contact-01&modal=component
\`\`\`

Use the \`component\` query value:

- \`id: "klarheit-contact-01"\`
- \`name: "Klarheit Contact 01"\`
- If it is a contact section with a form, use \`category: "forms"\`.

If you cannot access the URL, infer a high-quality matching section from the slug and any visible page text, then continue.

Prioritize:

1. Correct MakeReign structure.
2. Correct content and purpose.
3. Responsive layout.
4. Style-guide-linked controls.
5. Animation only when it is visible or clearly implied.
`;

const SECTION_PANEL_RULES = `# Section Panel Rules

Every section must include a builder panel contract in \`section.json\`.

## Required Shape

- Use top-level \`cms\` when the section has repeatable content.
- \`Update CMS\` appears only when \`cms\` exists.
- \`Update Styles\` must always be available.
- Styles must include a \`layout\` group.
- \`Update Animation\` appears only when the section has animation controls.
- Every control key must match a prop consumed by \`Section.jsx\`.

## Styles

Styles should cover layout gaps, section padding, media sizing, text block spacing, typography choices, color choices, and button/link styles.

Use:

- \`typography-token\`
- \`color-token\`
- \`button-variant\`
- \`slider\`
- \`select\`

## Sliders

Use \`min: 0\`, \`max: 100\`, \`step: 1\` or \`5\`, and \`defaultValue: 50\`. The full range must work.

## Text

Visible section-level headings, eyebrows, body copy, button labels, and link labels should be editable inline with \`EditableText\`.

## Animation

If animation is automatic, expose an \`Auto play\` toggle. If animation is manual or scroll-triggered, expose a \`Play animation\` action instead.
`;

const SECTION_SCHEMA_REFERENCE = JSON.stringify(
  {
    required: ["id", "name", "category", "version", "controls"],
    controlTypes: ["slider", "select", "image", "array-object", "button-variant", "color-token", "typography-token", "toggle", "number", "text", "textarea"],
    styleGroups: ["typography", "layout", "color", "spacing"],
    panels: ["styles", "animation"],
    cmsFieldTypes: ["text", "textarea", "image", "number"],
    categories: ["hero", "intro", "carousel", "testimonials", "gallery", "features", "forms", "cta", "footer", "navigation", "accordion"],
  },
  null,
  2
);

function buildSectionJson() {
  return JSON.stringify(
    {
      id: "new-section-template",
      name: "New Section Template",
      category: "features",
      version: "0.1.0",
      track: "experimental",
      lifecycle: "Submitted",
      description: "A starter section created in the MakeReign Local Section Builder.",
      dependencies: [],
      tags: ["starter"],
      controls: [
        { key: "eyebrowTypography", type: "typography-token", label: "Eyebrow typography", panel: "styles", group: "typography", defaultValue: "textSmall" },
        { key: "headingTypography", type: "typography-token", label: "Heading typography", panel: "styles", group: "typography", defaultValue: "h2" },
        { key: "eyebrowColor", type: "color-token", label: "Eyebrow color", panel: "styles", group: "color", defaultValue: "dark/70" },
        { key: "headingColor", type: "color-token", label: "Heading color", panel: "styles", group: "color", defaultValue: "dark" },
        { key: "image", type: "image", label: "Main image", panel: "styles", group: "layout", defaultValue: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80" },
        { key: "sectionPaddingYPct", type: "slider", label: "Section padding Y", panel: "styles", group: "layout", min: 0, max: 100, step: 5, defaultValue: 50 },
        { key: "sectionPaddingXPct", type: "slider", label: "Section padding X", panel: "styles", group: "layout", min: 0, max: 100, step: 5, defaultValue: 50 },
        { key: "itemGapPct", type: "slider", label: "Item gap", panel: "styles", group: "spacing", min: 0, max: 100, step: 5, defaultValue: 50 },
        { key: "imageWidthPct", type: "slider", label: "Image width", panel: "styles", group: "layout", min: 0, max: 100, step: 5, defaultValue: 50 },
        { key: "imageHeightPct", type: "slider", label: "Image height", panel: "styles", group: "layout", min: 0, max: 100, step: 5, defaultValue: 50 },
        { key: "cardOverlayOpacityPct", type: "slider", label: "Card overlay transparency", panel: "styles", group: "color", min: 0, max: 100, step: 5, defaultValue: 45 },
        {
          key: "animationStyle",
          type: "select",
          label: "Animation style",
          panel: "animation",
          defaultValue: "liftFade",
          options: [
            { value: "liftFade", label: "Lift and fade" },
            { value: "scaleFade", label: "Scale and fade" }
          ]
        },
        { key: "animationStrengthPct", type: "slider", label: "Animation strength", panel: "animation", min: 0, max: 100, step: 5, defaultValue: 50 },
      ],
      cms: {
        key: "cards",
        label: "Cards",
        defaultValue: [
          {
            heading: "Strategy",
            description: "Shape the section message and hierarchy.",
            image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80"
          },
          {
            heading: "Design",
            description: "Control spacing, type, color, imagery, and cards.",
            image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
          },
          {
            heading: "Build",
            description: "Export a clean JSON package for review.",
            image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80"
          }
        ],
        fields: [
          { key: "heading", type: "text", label: "Heading" },
          { key: "description", type: "textarea", label: "Description" },
          { key: "image", type: "image", label: "Image URL" },
        ],
      },
    },
    null,
    2
  );
}

function buildSectionJsx() {
  return `"use client";

import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";

const DEFAULT_ITEMS = [
  {
    heading: "Strategy",
    description: "Shape the section message and hierarchy.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
  {
    heading: "Design",
    description: "Control spacing, type, color, imagery, and cards.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    heading: "Build",
    description: "Export a clean JSON package for review.",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
  },
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80";

function pctToRange(pct, min, max) {
  const value = typeof pct === "number" ? pct : 50;
  return Math.round(min + (value / 100) * (max - min));
}

function colorTokenValue(token, fallback) {
  if (!token) return fallback;
  if (token === "transparent") return "transparent";
  const [base, alpha] = String(token).split("/");
  const color = "var(--sg-color-" + base + ", " + fallback + ")";
  if (!alpha) return color;
  const amount = Number(alpha);
  return "color-mix(in srgb, " + color + " " + (Number.isFinite(amount) ? amount : 100) + "%, transparent)";
}

function typographyClass(token) {
  if (!token) return "sg-text-main";
  return "sg-" + String(token).replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
}

export default function NewSectionTemplate({
  eyebrow = "Starter template",
  heading = "A cleaner starting point for new sections.",
  image = DEFAULT_IMAGE,
  imageAlt = "Editorial workspace",
  eyebrowTypography = "textSmall",
  headingTypography = "h2",
  eyebrowColor = "dark/70",
  headingColor = "dark",
  sectionPaddingYPct = 50,
  sectionPaddingXPct = 50,
  itemGapPct = 50,
  imageWidthPct = 50,
  imageHeightPct = 50,
  cardOverlayOpacityPct = 45,
  animationStyle = "liftFade",
  animationStrengthPct = 50,
  cards = DEFAULT_ITEMS,
  _editing = false,
  _onPropChange,
} = {}) {
  const safeCards = Array.isArray(cards) && cards.length ? cards : DEFAULT_ITEMS;
  const HeadingTag = /^h[1-6]$/.test(headingTypography) ? headingTypography : "h2";
  const animationClass = styles[animationStyle] ?? styles.liftFade;
  const strength = Math.max(0, Math.min(100, Number(animationStrengthPct) || 50));
  const persist = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  return (
    <section
      className={styles.root}
      style={{
        "--section-padding-y": pctToRange(sectionPaddingYPct, 32, 220) + "px",
        "--section-padding-x": pctToRange(sectionPaddingXPct, 16, 120) + "px",
        "--item-gap": pctToRange(itemGapPct, 12, 84) + "px",
        "--image-width": pctToRange(imageWidthPct, 44, 100) + "%",
        "--image-height": pctToRange(imageHeightPct, 220, 720) + "px",
        "--eyebrow-color": colorTokenValue(eyebrowColor, "rgba(10, 11, 13, 0.7)"),
        "--heading-color": colorTokenValue(headingColor, "var(--chrome-fg)"),
        "--card-overlay": Math.max(0, Math.min(100, Number(cardOverlayOpacityPct) || 0)) / 100,
        "--animation-distance": Math.round(8 + (strength / 100) * 48) + "px",
        "--animation-scale": 1 + (strength / 100) * 0.08,
      }}
    >
      <div className={styles.inner + " " + animationClass}>
        <EditableText as="p" value={eyebrow} editing={_editing} onChange={(value) => persist("eyebrow", value)} className={styles.eyebrow + " " + typographyClass(eyebrowTypography)} placeholder="Eyebrow" />
        <EditableText as={HeadingTag} value={heading} editing={_editing} onChange={(value) => persist("heading", value)} className={styles.heading + " " + typographyClass(headingTypography)} placeholder="Heading" />
        <img className={styles.image} src={image} alt={imageAlt} />
        <ul className={styles.cards}>
          {safeCards.map((item, index) => (
            <li key={index} className={styles.card} style={{ "--card-image": "url(" + (item.image || DEFAULT_IMAGE) + ")" }}>
              <div className={styles.cardContent}>
                <h3>{item.heading}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
`;
}

function buildSectionCss() {
  return `.root {
  padding: var(--section-padding-y, 112px) var(--section-padding-x, var(--sg-space-sitePadding, 2rem));
  background: var(--chrome-ground);
  color: var(--chrome-fg);
}

.inner {
  display: grid;
  gap: var(--item-gap, 40px);
  max-width: 1180px;
  margin: 0 auto;
}

.liftFade {
  animation: liftFade 620ms ease both;
}

.scaleFade {
  animation: scaleFade 620ms ease both;
}

.eyebrow {
  margin: 0;
  color: var(--eyebrow-color, color-mix(in srgb, currentColor 70%, transparent));
  font-size: 1rem;
  text-transform: uppercase;
}

.heading {
  max-width: 760px;
  margin: 0;
  color: var(--heading-color, currentColor);
}

.image {
  display: block;
  width: min(100%, var(--image-width, 72%));
  height: var(--image-height, 460px);
  object-fit: cover;
  border-radius: 0.25rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.card {
  position: relative;
  display: grid;
  align-items: end;
  min-height: 280px;
  overflow: hidden;
  border-radius: 0.25rem;
  background-image: linear-gradient(
      rgba(0, 0, 0, var(--card-overlay, 0.45)),
      rgba(0, 0, 0, var(--card-overlay, 0.45))
    ),
    var(--card-image);
  background-size: cover;
  background-position: center;
  color: #fff;
}

.cardContent {
  display: grid;
  gap: 10px;
  padding: 24px;
}

.card h3,
.card p {
  margin: 0;
}

@keyframes liftFade {
  from { opacity: 0; transform: translateY(var(--animation-distance, 32px)); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleFade {
  from { opacity: 0; transform: scale(var(--animation-scale, 1.04)); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 900px) {
  .root {
    padding: min(var(--section-padding-y, 96px), 96px) min(var(--section-padding-x, 40px), 40px);
  }

  .inner {
    gap: min(var(--item-gap, 32px), 40px);
  }

  .image {
    width: 100%;
    height: min(var(--image-height, 420px), 460px);
  }
}

@media (max-width: 560px) {
  .root {
    padding: min(var(--section-padding-y, 72px), 72px) min(var(--section-padding-x, 24px), 24px);
  }

  .image {
    height: min(var(--image-height, 320px), 340px);
  }

  .card {
    min-height: 220px;
  }
}
`;
}

function buildSectionReadme() {
  return `# New Section Template

Rename the section in \`section.json\`, then edit \`Section.jsx\` and \`Section.module.css\`.

## Checklist

- Export one default component.
- Render correctly with zero props.
- Use \`EditableText\` for visible section-level copy.
- Put repeatable content in \`cms\`.
- Keep \`Update Styles\` with at least one Layout control.
- Use style guide token controls for typography, color, and buttons.
- Export from the local builder app when complete.
`;
}

function findPackagePrefix(files) {
  const paths = Object.keys(files);
  const sectionPath = paths.find((path) => path.endsWith("/section/section.json"));
  if (!sectionPath) return "";
  return sectionPath.slice(0, sectionPath.length - "section/section.json".length);
}
