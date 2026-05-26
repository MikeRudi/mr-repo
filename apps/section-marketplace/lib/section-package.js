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
      "Reusable local MakeReign section builder app. Run it locally, let AI create section folders under sections/, preview with the generated panel, then export individual section upload zips.",
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
  return `# AI Task: Build MakeReign Sections In This Local App

You are inside the reusable MakeReign Local Section Builder app.

## User Prompt This App Is Built For

\`\`\`
Unzip and read all the files in this folder make-reign-section-builder.zip in my downloads folder. Then make this section [URL OR DESCRIPTION] and open the section so we can view and edit it on a localhost.
\`\`\`

## What To Do

1. Read \`README.md\` and every file in \`rules/\`.
2. Run \`npm install\`.
3. Run \`npm run dev\` and open the localhost URL.
4. Create or update one folder in \`sections/<section-id>/\`.
5. Build only the requested section, not a full website.
6. Use the local app to preview the section and generated panel.
7. Use the Export section button in the app, or run \`npm run export -- <section-id>\`.

## Create Another Section Later

This app is reusable. To start another section:

\`\`\`bash
npm run new -- my-next-section
\`\`\`

Then edit \`sections/my-next-section/\`, preview it in the app, and export that section when ready.

## Source Of Truth

Each section project is only these files:

\`\`\`text
sections/<section-id>/
  Section.jsx
  Section.module.css
  section.json
  README.md
\`\`\`

Do not create a second app. Do not edit \`node_modules\`, \`dist\`, or generated export zips.
`;
}

function buildReadme() {
  return `# MakeReign Local Section Builder

This is a reusable local app for creating MakeReign sections with a local AI model.

## Main Prompt

\`\`\`
Unzip and read all the files in this folder make-reign-section-builder.zip in my downloads folder. Then make this section [PASTE SECTION URL OR DESCRIPTION HERE] and open the section so we can view and edit it on a localhost.
\`\`\`

## Run The App

\`\`\`bash
npm install
npm run dev
\`\`\`

Open the localhost URL printed by Vite.

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

When the section is ready, click \`Export section\` in the app. It downloads a clean upload zip for the selected section. You can also run:

\`\`\`bash
npm run export -- klarheit-contact-01
\`\`\`

Upload the exported zip to the MakeReign library.

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
  }

  function exportSection() {
    const blob = createSectionZip(selected);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`make-reign-\${selected.manifest.id}.zip\`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setExportStatus(\`Exported make-reign-\${selected.manifest.id}.zip\`);
  }

  return (
    <main className="mr-builder">
      <aside className="mr-panel">
        <div className="mr-panel__header">
          <p className="mr-eyebrow">MakeReign local builder</p>
          <h1>{selected.manifest.name}</h1>
          <p>{selected.manifest.id}</p>
        </div>

        <label className="mr-control">
          <span>Section project</span>
          <select value={selected.slug} onChange={(event) => selectSection(event.target.value)}>
            {sections.map((section) => (
              <option key={section.slug} value={section.slug}>{section.manifest.name}</option>
            ))}
          </select>
        </label>

        <div className="mr-actions">
          {cms ? <button type="button" onClick={() => setActivePanel(activePanel === "cms" ? null : "cms")}>Update CMS</button> : null}
          <button type="button" onClick={() => setActivePanel(activePanel === "styles" ? null : "styles")}>Update Styles</button>
          {hasAnimation ? <button type="button" onClick={() => setActivePanel(activePanel === "animation" ? null : "animation")}>Update Animation</button> : null}
          {autoControl ? (
            <label className="mr-toggle">
              <input
                type="checkbox"
                checked={Boolean(props[autoControl.key] ?? autoControl.defaultValue)}
                onChange={(event) => update(autoControl.key, event.target.checked)}
              />
              Auto play
            </label>
          ) : hasAnimation ? (
            <button type="button" onClick={() => setPreviewKey((key) => key + 1)}>Play animation</button>
          ) : null}
          <button type="button" className="mr-export" onClick={exportSection}>Export section</button>
        </div>

        {exportStatus ? <p className="mr-status">{exportStatus}</p> : null}

        <Panel activePanel={activePanel} cms={cms} groups={groups} props={props} update={update} />
      </aside>

      <section className="mr-canvas">
        <div className="mr-style-scope">
          <Component key={previewKey} {...props} _editing _onPropChange={update} />
        </div>
      </section>
    </main>
  );
}

function Panel({ activePanel, cms, groups, props, update }) {
  if (!activePanel) {
    return <div className="mr-empty">Select a panel above. Double-click visible section text in the preview to edit it inline.</div>;
  }
  if (activePanel === "cms" && cms) {
    return <CmsPanel cms={cms} value={props[cms.key] ?? []} onChange={(value) => update(cms.key, value)} />;
  }
  const controls = groups[activePanel] ?? [];
  return (
    <div className="mr-control-list">
      {controls.length ? controls.map((control) => (
        <Control key={control.key} control={control} value={props[control.key] ?? control.defaultValue ?? ""} onChange={(value) => update(control.key, value)} />
      )) : <p>No controls in this panel yet.</p>}
    </div>
  );
}

function CmsPanel({ cms, value, onChange }) {
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
    <div className="mr-control-list">
      <div className="mr-panel-row">
        <h2>{cms.label ?? "CMS"}</h2>
        <button type="button" onClick={addRow}>Add item</button>
      </div>
      {rows.map((row, index) => (
        <fieldset key={index} className="mr-cms-row">
          <legend>Item {index + 1}</legend>
          {fields.map((field) => (
            <label key={field.key}>
              <span>{field.label ?? field.key}</span>
              {field.type === "textarea" ? (
                <textarea value={row[field.key] ?? ""} onChange={(event) => updateRow(index, field.key, event.target.value)} />
              ) : (
                <input value={row[field.key] ?? ""} onChange={(event) => updateRow(index, field.key, event.target.value)} />
              )}
            </label>
          ))}
          <button type="button" onClick={() => removeRow(index)}>Remove item</button>
        </fieldset>
      ))}
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
    return (
      <div className="mr-slider">
        <input type="range" min={control.min ?? 0} max={control.max ?? 100} step={control.step ?? 1} value={Number(value ?? control.defaultValue ?? 50)} onChange={(event) => onChange(Number(event.target.value))} />
        <output>{value}</output>
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

function createSectionZip(section) {
  const files = {
    "make-reign-section/section/Section.jsx": section.source,
    "make-reign-section/section/Section.module.css": section.css,
    "make-reign-section/section/section.json": section.json,
    "make-reign-section/section/README.md": section.readme,
  };
  for (const [path, content] of Object.entries(ruleSource)) {
    files[\`make-reign-section/rules/\${path.split("/").pop()}\`] = content;
  }
  const reviewManifest = {
    kind: "make-reign-section-package",
    packageVersion: "0.2.0",
    createdAt: new Date().toISOString(),
    instructions: "Exported from the MakeReign Local Section Builder.",
    files: Object.fromEntries(
      Object.entries(files).map(([path, content]) => [path.replace("make-reign-section/", ""), content])
    ),
  };
  files["make-reign-section/make-reign-section-package.json"] = JSON.stringify(reviewManifest, null, 2);
  return createZip(files);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const [path, rawContent] of Object.entries(files)) {
    const name = encoder.encode(path);
    const content = typeof rawContent === "string" ? encoder.encode(rawContent) : rawContent;
    const checksum = crc32(content);
    const localHeader = new Uint8Array(30);
    const local = new DataView(localHeader.buffer);
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true);
    local.setUint16(8, 0, true);
    local.setUint32(14, checksum, true);
    local.setUint32(18, content.length, true);
    local.setUint32(22, content.length, true);
    local.setUint16(26, name.length, true);
    localParts.push(localHeader, name, content);
    const centralHeader = new Uint8Array(46);
    const central = new DataView(centralHeader.buffer);
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0x0800, true);
    central.setUint32(16, checksum, true);
    central.setUint32(20, content.length, true);
    central.setUint32(24, content.length, true);
    central.setUint16(28, name.length, true);
    central.setUint32(42, offset, true);
    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + content.length;
  }
  const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, Object.keys(files).length, true);
  endView.setUint16(10, Object.keys(files).length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
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
  grid-template-columns: minmax(300px, 380px) 1fr;
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
  border-right: 1px solid var(--chrome-border);
  background: var(--chrome-surface);
  padding: 1rem;
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
.mr-panel-row button:hover,
.mr-cms-row button:hover,
.mr-export {
  background: var(--chrome-fg);
  color: #fff;
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

.mr-control,
.mr-cms-row label {
  display: grid;
  gap: 0.4rem;
  margin-top: 1rem;
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
  grid-template-columns: 1fr 3rem;
  align-items: center;
  gap: 0.5rem;
}

.mr-panel-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.mr-panel-row h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.mr-cms-row {
  display: grid;
  gap: 0.75rem;
  border: 1px solid var(--chrome-border);
  border-radius: 0.25rem;
  padding: 0.75rem;
}

.mr-cms-row legend {
  padding: 0 0.35rem;
  font-weight: 600;
}

.mr-canvas {
  min-width: 0;
  overflow: auto;
}

.mr-style-scope {
  min-height: 100vh;
  background: var(--chrome-ground);
}

.mr-style-scope h1, .mr-style-scope .sg-h1 { font-size: 4.5rem; line-height: 1; font-weight: 600; }
.mr-style-scope h2, .mr-style-scope .sg-h2 { font-size: 3.5rem; line-height: 1.04; font-weight: 600; }
.mr-style-scope h3, .mr-style-scope .sg-h3 { font-size: 2.5rem; line-height: 1.1; font-weight: 600; }
.mr-style-scope p, .mr-style-scope .sg-text-main { font-size: 1rem; line-height: 1.55; }

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
  .mr-panel { position: relative; height: auto; border-right: 0; border-bottom: 1px solid var(--chrome-border); }
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

const SECTION_PACKAGE_FOLDER = "make-reign-section";
const SECTION_PACKAGE_MANIFEST = "make-reign-section-package.json";
const LOCAL_FILE_HEADER = 0x04034b50;
const CENTRAL_DIRECTORY_HEADER = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY = 0x06054b50;

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const [filePath, rawContent] of Object.entries(files)) {
    const name = Buffer.from(filePath, "utf8");
    const content = Buffer.isBuffer(rawContent) ? rawContent : Buffer.from(String(rawContent), "utf8");
    const checksum = crc32(content);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(LOCAL_FILE_HEADER, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localParts.push(localHeader, name, content);
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(CENTRAL_DIRECTORY_HEADER, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + content.length;
  }
  const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
  const end = Buffer.alloc(22);
  const fileCount = Object.keys(files).length;
  end.writeUInt32LE(END_OF_CENTRAL_DIRECTORY, 0);
  end.writeUInt16LE(fileCount, 8);
  end.writeUInt16LE(fileCount, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

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
const zipFiles = Object.fromEntries(
  Object.entries({
    ...files,
    [SECTION_PACKAGE_MANIFEST]: JSON.stringify(reviewManifest, null, 2),
  }).map(([filePath, content]) => [SECTION_PACKAGE_FOLDER + "/" + filePath, content])
);

const outPath = path.resolve(root, "exports", "make-reign-" + manifest.id + ".zip");
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, createZip(zipFiles));
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

Use the local app's \`Export section\` button for the selected section, or run:

\`\`\`bash
npm run export -- section-id
\`\`\`

The exported upload zip must contain:

\`\`\`text
make-reign-section/
  make-reign-section-package.json
  rules/
  section/
    Section.jsx
    Section.module.css
    README.md
    section.json
\`\`\`

Do not upload the whole local builder app. Upload only the exported \`make-reign-<section-id>.zip\`.

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

- \`Update CMS\` appears when \`section.json.cms\` exists.
- \`Update Styles\` is always expected.
- \`Update Animation\` appears when animation controls exist.
- \`Auto play\` appears for automatic animation toggles.
- \`Play animation\` appears when animation exists without auto-play.

## Export

Use the in-app \`Export section\` button for the selected section. It downloads a clean upload zip for that section only.
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
        { key: "headingTypography", type: "typography-token", label: "Heading tag", panel: "styles", group: "typography", defaultValue: "h2" },
        { key: "textColor", type: "color-token", label: "Text color", panel: "styles", group: "color", defaultValue: "dark" },
        { key: "sectionPaddingPct", type: "slider", label: "Section padding", panel: "styles", group: "layout", min: 0, max: 100, step: 5, defaultValue: 50 },
      ],
      cms: {
        key: "items",
        label: "Items",
        defaultValue: [{ heading: "Template item", description: "Replace this with real content." }],
        fields: [
          { key: "heading", type: "text", label: "Heading" },
          { key: "description", type: "textarea", label: "Description" },
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
  { heading: "Template item", description: "Replace this with real content." },
];

function pctToPadding(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return Math.round(32 + (value / 100) * 160);
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

export default function NewSectionTemplate({
  eyebrow = "New section",
  heading = "Build a section with MakeReign.",
  headingTypography = "h2",
  textColor = "dark",
  sectionPaddingPct = 50,
  items = DEFAULT_ITEMS,
  _editing = false,
  _onPropChange,
} = {}) {
  const safeItems = Array.isArray(items) && items.length ? items : DEFAULT_ITEMS;
  const HeadingTag = /^h[1-6]$/.test(headingTypography) ? headingTypography : "h2";
  const persist = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  return (
    <section
      className={styles.root}
      style={{
        "--section-padding": pctToPadding(sectionPaddingPct) + "px",
        "--section-text": colorTokenValue(textColor, "var(--chrome-fg)"),
      }}
    >
      <div className={styles.inner}>
        <EditableText as="p" value={eyebrow} editing={_editing} onChange={(value) => persist("eyebrow", value)} className={styles.eyebrow} placeholder="Eyebrow" />
        <EditableText as={HeadingTag} value={heading} editing={_editing} onChange={(value) => persist("heading", value)} className={styles.heading} placeholder="Heading" />
        <ul className={styles.list}>
          {safeItems.map((item, index) => (
            <li key={index} className={styles.item}>
              <h3>{item.heading}</h3>
              <p>{item.description}</p>
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
  padding: var(--section-padding, 112px) var(--sg-space-sitePadding, 2rem);
  background: var(--chrome-ground);
  color: var(--section-text, var(--chrome-fg));
}

.inner {
  max-width: 1120px;
  margin: 0 auto;
}

.eyebrow {
  margin: 0 0 16px;
  color: color-mix(in srgb, currentColor 70%, transparent);
  font-size: 0.875rem;
  text-transform: uppercase;
}

.heading {
  max-width: 760px;
  margin: 0;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin: 48px 0 0;
  padding: 0;
  list-style: none;
}

.item {
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 0.25rem;
  padding: 24px;
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
