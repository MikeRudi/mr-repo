const PACKAGE_VERSION = "0.1.0";
const ALLOWED_COLOR_TOKENS = new Set(["light", "dark", "brand"]);
const ALLOWED_TYPOGRAPHY_TOKENS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "textLarge", "textMain", "textSmall"]);
const ALLOWED_BUTTON_VARIANTS = new Set(["primary", "secondary", "ghost"]);
export const SECTION_PACKAGE_FOLDER = "make-reign-section";
export const SECTION_PACKAGE_MANIFEST = "make-reign-section-package.json";

export async function buildSectionTemplatePackage() {
  return {
    kind: "make-reign-section-package",
    packageVersion: PACKAGE_VERSION,
    createdAt: new Date().toISOString(),
    instructions:
      "Unzip this folder, give the folder and a target section reference to your local AI model, ask it to rebuild the section inside section/, then zip the completed folder and upload it back to the MakeReign library.",
    files: {
      "AI_TASK.md": buildAiTask(),
      "README.md": buildReadme(),
      "package.json": buildPreviewPackageJson(),
      "index.html": buildPreviewIndexHtml(),
      "vite.config.js": buildPreviewViteConfig(),
      "scripts/export-package.mjs": buildExportPackageScript(),
      "_shared/EditableText.jsx": buildSharedEditableText(),
      "_shared/styleguide-defaults.js": buildSharedStyleguideDefaults(),
      "preview/PreviewApp.jsx": buildPreviewApp(),
      "preview/main.jsx": buildPreviewMain(),
      "preview/preview.css": buildPreviewCss(),
      "rules/component-contract.md": COMPONENT_CONTRACT_RULES,
      "rules/export.md": SECTION_EXPORT_RULES,
      "rules/local-preview.md": LOCAL_PREVIEW_RULES,
      "rules/section-panel.md": SECTION_PANEL_RULES,
      "rules/url-reference.md": URL_REFERENCE_RULES,
      "rules/section.schema.json": SECTION_SCHEMA_REFERENCE,
      "section/section.json": buildSectionJson(),
      "section/Section.jsx": buildSectionJsx(),
      "section/Section.module.css": buildSectionCss(),
      "section/README.md": buildSectionReadme(),
    },
  };
}

export function buildSectionPackageFolderFiles(packageData) {
  const files = {};

  for (const [path, content] of Object.entries(packageData.files ?? {})) {
    files[`${SECTION_PACKAGE_FOLDER}/${path}`] = content;
  }

  files[`${SECTION_PACKAGE_FOLDER}/${SECTION_PACKAGE_MANIFEST}`] = JSON.stringify(packageData, null, 2);
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
    instructions:
      "This package was rebuilt from an uploaded MakeReign section folder.",
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

  return {
    ok: true,
    manifest,
    sectionId: id,
    name,
  };
}

function buildAiTask() {
  return `# AI Task: Build One MakeReign Section

You are editing a downloaded MakeReign section package. Complete the user's requested section inside this folder.

## If the user gives this prompt

\`\`\`
Unzip and read all the files in this folder make-reign-section-package.zip in my downloads folder. Then make this section [URL OR DESCRIPTION] and open the section so we can view and edit it on a localhost.
\`\`\`

You must do the task without asking the user to explain the folder. Read this file, \`README.md\`, and every file in \`rules/\` before editing.

## Required workflow

1. Locate and unzip \`make-reign-section-package.zip\`.
2. Work inside the unzipped \`make-reign-section/\` folder only.
3. Inspect the target URL or description. If you cannot access the URL, infer a high-quality matching section from the URL slug and visible context, then continue.
4. Replace the starter section files:
   - \`section/Section.jsx\`
   - \`section/Section.module.css\`
   - \`section/section.json\`
   - \`section/README.md\`
5. Run the bundled local preview:
   - \`npm install\`
   - \`npm run dev\`
   - open the printed localhost URL
6. Use the preview panel to test Update CMS, Update Styles, Update Animation, and Auto play / Play animation behavior.
7. Keep \`AI_TASK.md\`, \`README.md\`, \`rules/\`, \`preview/\`, \`_shared/\`, \`package.json\`, \`index.html\`, \`vite.config.js\`, and \`make-reign-section-package.json\`.
8. Run \`npm run export\` when done. This creates the upload zip while excluding \`node_modules\` and build output.

## Final output tree

\`\`\`text
make-reign-section/
  AI_TASK.md
  README.md
  package.json
  index.html
  vite.config.js
  scripts/
    export-package.mjs
  make-reign-section-package.json
  _shared/
    EditableText.jsx
    styleguide-defaults.js
  preview/
    PreviewApp.jsx
    main.jsx
    preview.css
  rules/
    component-contract.md
    export.md
    local-preview.md
    section-panel.md
    url-reference.md
    section.schema.json
  section/
    Section.jsx
    Section.module.css
    README.md
    section.json
\`\`\`

## Definition of done

- The component renders with zero props.
- The component exports one default React component.
- The component uses only relative imports shown in \`rules/component-contract.md\`.
- The manifest id is unique kebab-case and matches the section being built.
- The manifest has \`controls\` with at least one \`panel: "styles"\` and one \`group: "layout"\`.
- Repeatable content is in a top-level \`cms\` block.
- The local preview runs on localhost and the section renders there.
- \`npm run export\` creates the final zip named after the section, for example \`make-reign-klarheit-contact-01.zip\`.
`;
}

function buildReadme() {
  return `# MakeReign Section Package

This folder is a portable section template for local AI-assisted section creation.

## Prompt to give your local AI

\`\`\`
Unzip and read all the files in this folder make-reign-section-package.zip in my downloads folder. Then make this section [PASTE SECTION URL OR DESCRIPTION HERE] and open the section so we can view and edit it on a localhost.
\`\`\`

The AI must treat this folder as the source of truth for the required MakeReign section shape. If a section URL is provided, inspect the page visually and structurally, then recreate the section as a MakeReign-ready React section.

## First file to read

Read \`AI_TASK.md\` first. It contains the no-context workflow that local AI tools should follow. Then read every file in \`rules/\`.

## What to do

1. Unzip the downloaded folder.
2. Give the unzipped \`make-reign-section\` folder to your local AI model.
3. Give the AI the prompt above with the target section URL or a clear section description.
4. Ask it to replace the starter files under \`section/\` with the finished section.
5. Ask it to update \`section/section.json\` so the builder panel, CMS fields, categories, tags, and style-guide controls match the finished section.
6. Ask it to run the bundled local preview with \`npm install\` and \`npm run dev\`, then open the localhost URL.
7. Use the preview to tune the section and panel before export.
8. Ask it to run \`npm run export\` to create the upload zip.
9. Upload the edited zip back to the MakeReign library.

## What the AI must create

- A faithful section recreation in \`section/Section.jsx\`.
- Scoped styles in \`section/Section.module.css\`.
- A valid manifest in \`section/section.json\`.
- Inline editable top-level text where relevant.
- CMS setup for repeatable content such as cards, links, people, stats, FAQs, testimonials, or form fields.
- Style controls that auto-link to the MakeReign style guide using typography, color, and button token controls.
- Layout controls for spacing, padding, grid, media sizing, and alignment.
- Animation controls only when animation is actually part of the section.
- A working localhost preview using the bundled preview app and generated panel.

## Required files

- \`section/section.json\` describes the section and builder panel.
- \`section/Section.jsx\` exports the React section component.
- \`section/Section.module.css\` contains scoped section styles.
- \`section/README.md\` explains the section.
- \`make-reign-section-package.json\` is the review manifest for MakeReign.
- \`package.json\`, \`index.html\`, \`vite.config.js\`, \`preview/\`, and \`_shared/\` power the local preview.
- \`scripts/export-package.mjs\` creates the clean upload zip.
- \`AI_TASK.md\` is the direct task contract for local AI tools.
- \`rules/component-contract.md\` explains exactly how \`Section.jsx\` must be written for the app.
- \`rules/export.md\` tells the AI how to package the folder for upload.
- \`rules/local-preview.md\` tells the AI how to run and use localhost preview.
- \`rules/section-panel.md\` tells the AI how panel controls must work.
- \`rules/url-reference.md\` tells the AI how to turn a URL or page text into a MakeReign section.
- \`rules/section.schema.json\` is the manifest schema reference.

## Important

The AI should not create a different app or move the section outside this package. It should use the bundled preview app when it needs localhost.

The upload does not publish the section immediately. It creates a review submission. An admin manually reviews and activates approved sections later.
`;
}

function buildPreviewPackageJson() {
  return JSON.stringify(
    {
      name: "make-reign-section-preview",
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vite --host 127.0.0.1",
        build: "vite build",
        preview: "vite preview --host 127.0.0.1",
        export: "node scripts/export-package.mjs",
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

function buildPreviewIndexHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MakeReign Section Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/preview/main.jsx"></script>
  </body>
</html>
`;
}

function buildPreviewViteConfig() {
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

function buildExportPackageScript() {
  return `import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FOLDER_NAME = path.basename(ROOT);
const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".git", ".vite"]);
const EXCLUDED_FILES = new Set(["package-lock.json", ".DS_Store"]);
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

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function walk(dir, prefix = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) continue;
    if (entry.isFile() && EXCLUDED_FILES.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute, relative));
    else if (entry.isFile()) files.push({ absolute, relative: path.posix.join(FOLDER_NAME, relative) });
  }
  return files;
}

async function syncReviewManifest() {
  const files = await walk(ROOT);
  const packageFiles = {};
  for (const file of files) {
    if (file.relative === path.posix.join(FOLDER_NAME, "make-reign-section-package.json")) continue;
    const packagePath = file.relative.slice(FOLDER_NAME.length + 1);
    packageFiles[packagePath] = await fs.readFile(file.absolute, "utf8");
  }
  const reviewManifest = {
    kind: "make-reign-section-package",
    packageVersion: "0.1.0",
    createdAt: new Date().toISOString(),
    instructions: "Built with the MakeReign local preview package. Upload this zip through the MakeReign library.",
    files: packageFiles,
  };
  await fs.writeFile(
    path.join(ROOT, "make-reign-section-package.json"),
    JSON.stringify(reviewManifest, null, 2) + "\\n",
    "utf8"
  );
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.relative, "utf8");
    const content = entry.content;
    const checksum = crc32(content);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(LOCAL_FILE_HEADER, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(CENTRAL_DIRECTORY_HEADER, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + content.length;
  }

  const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(END_OF_CENTRAL_DIRECTORY, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

const manifest = await readJson(path.join(ROOT, "section", "section.json"));
const id = manifest.id || "section";
await syncReviewManifest();
const files = await walk(ROOT);
const entries = await Promise.all(files.map(async (file) => ({
  relative: file.relative,
  content: await fs.readFile(file.absolute),
})));
const outPath = path.resolve(ROOT, "..", \`make-reign-\${id}.zip\`);
await fs.writeFile(outPath, createZip(entries));
console.log(\`Created \${outPath}\`);
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
    if (ref.current.innerText !== (value ?? "")) {
      ref.current.innerText = value ?? "";
    }
    lastValueRef.current = value;
  }, [value]);

  if (!editing) {
    return (
      <Tag className={className} {...rest}>
        {value || placeholder}
      </Tag>
    );
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
      className={\`\${className} editable-text\`}
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
  return variant === "primary" ? "sg-button" : \`sg-button-\${variant}\`;
}
`;
}

function buildPreviewMain() {
  return `import React from "react";
import { createRoot } from "react-dom/client";
import PreviewApp from "./PreviewApp.jsx";
import "./preview.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PreviewApp />
  </React.StrictMode>
);
`;
}

function buildPreviewApp() {
  return `import { useMemo, useState } from "react";
import Section from "../section/Section.jsx";
import manifest from "../section/section.json";

const COLOR_OPTIONS = [
  ["light", "Light"],
  ["dark", "Dark"],
  ["brand", "Brand"],
  ["transparent", "Transparent"],
  ["light/70", "Light 70%"],
  ["dark/70", "Dark 70%"],
  ["brand/70", "Brand 70%"],
  ["light/40", "Light 40%"],
  ["dark/40", "Dark 40%"],
  ["brand/40", "Brand 40%"],
];

const TYPOGRAPHY_OPTIONS = [
  ["h1", "H1"],
  ["h2", "H2"],
  ["h3", "H3"],
  ["h4", "H4"],
  ["h5", "H5"],
  ["h6", "H6"],
  ["textLarge", "Text large"],
  ["textMain", "Text main"],
  ["textSmall", "Text small"],
];

const BUTTON_OPTIONS = [
  ["primary", "Primary"],
  ["secondary", "Secondary"],
  ["ghost", "Ghost"],
];

function defaultPropsFromManifest() {
  const props = {};
  for (const control of manifest.controls ?? []) {
    if (control.defaultValue !== undefined) props[control.key] = control.defaultValue;
  }
  if (manifest.cms?.key) props[manifest.cms.key] = manifest.cms.defaultValue ?? [];
  return props;
}

function groupedControls() {
  const groups = { styles: [], animation: [], other: [] };
  for (const control of manifest.controls ?? []) {
    const panel = control.panel;
    if (panel && groups[panel]) groups[panel].push(control);
    else groups.other.push(control);
  }
  return groups;
}

export default function PreviewApp() {
  const [props, setProps] = useState(defaultPropsFromManifest);
  const [activePanel, setActivePanel] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const groups = useMemo(groupedControls, []);
  const cms = manifest.cms;
  const hasAnimation = groups.animation.length > 0;
  const autoControl = (manifest.controls ?? []).find(
    (control) => control.type === "toggle" && /auto/i.test(control.key + control.label)
  );

  function update(key, value) {
    setProps((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="mr-preview">
      <aside className="mr-panel">
        <div className="mr-panel__header">
          <p className="mr-eyebrow">MakeReign preview</p>
          <h1>{manifest.name}</h1>
          <p>{manifest.id}</p>
        </div>

        <div className="mr-actions">
          {cms ? (
            <button type="button" onClick={() => setActivePanel(activePanel === "cms" ? null : "cms")}>
              Update CMS
            </button>
          ) : null}
          <button type="button" onClick={() => setActivePanel(activePanel === "styles" ? null : "styles")}>
            Update Styles
          </button>
          {hasAnimation ? (
            <button type="button" onClick={() => setActivePanel(activePanel === "animation" ? null : "animation")}>
              Update Animation
            </button>
          ) : null}
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
            <button type="button" onClick={() => setPreviewKey((key) => key + 1)}>
              Play animation
            </button>
          ) : null}
        </div>

        <Panel
          activePanel={activePanel}
          cms={cms}
          groups={groups}
          props={props}
          update={update}
        />
      </aside>

      <section className="mr-canvas">
        <div className="mr-style-scope">
          <Section
            key={previewKey}
            {...props}
            _editing
            _onPropChange={update}
          />
        </div>
      </section>
    </main>
  );
}

function Panel({ activePanel, cms, groups, props, update }) {
  if (!activePanel) {
    return (
      <div className="mr-empty">
        Select a panel above. Double-click visible section text in the preview to edit it inline.
      </div>
    );
  }

  if (activePanel === "cms" && cms) {
    return <CmsPanel cms={cms} value={props[cms.key] ?? []} onChange={(value) => update(cms.key, value)} />;
  }

  const controls = groups[activePanel] ?? [];
  return (
    <div className="mr-control-list">
      {controls.length ? controls.map((control) => (
        <Control
          key={control.key}
          control={control}
          value={props[control.key] ?? control.defaultValue ?? ""}
          onChange={(value) => update(control.key, value)}
        />
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
        <input
          type="range"
          min={control.min ?? 0}
          max={control.max ?? 100}
          step={control.step ?? 1}
          value={Number(value ?? control.defaultValue ?? 50)}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <output>{value}</output>
      </div>
    );
  }
  if (control.type === "toggle") {
    return <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />;
  }
  if (control.type === "select") {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {(control.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>{option.label ?? option.value}</option>
        ))}
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
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>{label}</option>
      ))}
    </select>
  );
}
`;
}

function buildPreviewCss() {
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

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input,
select,
textarea {
  font: inherit;
}

.mr-preview {
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  min-height: 100vh;
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

.mr-panel__header p {
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
.mr-cms-row button:hover {
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

.mr-style-scope h1,
.mr-style-scope .sg-h1 {
  font-size: 4.5rem;
  line-height: 1;
  font-weight: 600;
}

.mr-style-scope h2,
.mr-style-scope .sg-h2 {
  font-size: 3.5rem;
  line-height: 1.04;
  font-weight: 600;
}

.mr-style-scope h3,
.mr-style-scope .sg-h3 {
  font-size: 2.5rem;
  line-height: 1.1;
  font-weight: 600;
}

.mr-style-scope p,
.mr-style-scope .sg-text-main {
  font-size: 1rem;
  line-height: 1.55;
}

.sg-button,
.sg-button-secondary,
.sg-button-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  border: 1px solid var(--sg-color-dark);
  padding: 1em 1.75em;
  text-decoration: none;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
}

.sg-button {
  background: var(--sg-color-dark);
  color: var(--sg-color-light);
}

.sg-button-secondary,
.sg-button-ghost {
  background: transparent;
  color: var(--sg-color-dark);
}

.sg-button:hover,
.sg-button-secondary:hover,
.sg-button-ghost:hover {
  background: var(--sg-color-brand);
  border-color: var(--sg-color-brand);
  color: var(--sg-color-light);
}

.editable-text {
  outline: 2px dashed rgba(44, 138, 90, 0.45);
  outline-offset: 0.2rem;
}

@media (max-width: 900px) {
  .mr-preview {
    grid-template-columns: 1fr;
  }

  .mr-panel {
    position: relative;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--chrome-border);
  }
}
`;
}

const COMPONENT_CONTRACT_RULES = `# Component Contract

These rules make generated sections compatible with MakeReign.

## Files to edit

Edit \`section/\` to build the section. The folder already includes a local preview app; use it, but do not replace it with a different framework or move the section outside this package.

## Required Section.jsx shape

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

## Allowed imports

- \`import styles from "./Section.module.css";\`
- \`import EditableText from "../../_shared/EditableText.jsx";\`
- Optional React hooks from \`react\` only if needed.
- Optional \`buttonClass\` from \`../../../../lib/styleguide-defaults.js\` only when a button variant is rendered.

Do not import from external packages, remote URLs, app routes, or absolute local paths.

## Style guide tokens

Use these token ids as defaults:

- Colors: \`light\`, \`dark\`, \`brand\`
- Transparent/faded color selections may arrive as \`transparent\` or \`dark/70\`, \`brand/40\`, etc. Parse the slash value and apply it with \`color-mix(... transparent)\`.
- Typography: \`h1\`, \`h2\`, \`h3\`, \`h4\`, \`h5\`, \`h6\`, \`textLarge\`, \`textMain\`, \`textSmall\`
- Button variants: \`primary\`, \`secondary\`, \`ghost\`

Do not invent token ids. For body text, use \`textMain\` or \`textLarge\`; never use \`body\`. For accent-like colors, use \`brand\`; never use \`accent\` unless a future style guide explicitly adds it.

Apply style values through CSS variables in the component:

\`\`\`jsx
style={{
  "--section-bg": \`var(--sg-color-\${backgroundColor}, var(--chrome-ground))\`,
  "--section-text": \`var(--sg-color-\${textColor}, var(--chrome-fg))\`,
}}
\`\`\`

## Inline editable text

Top-level visible copy uses \`EditableText\` and props:

- eyebrow
- heading
- body
- ctaLabel

Do not put these as \`text\` controls in \`section.json\`.

## CMS repeatable content

Repeated cards, links, contact methods, locations, form fields, team members, stats, FAQs, logos, and testimonials must use \`cms\` in \`section.json\`.

The \`cms.key\` must match the component prop name. Example:

\`\`\`json
{
  "cms": {
    "key": "contactMethods",
    "label": "Contact methods",
    "defaultValue": [
      {
        "label": "Email us",
        "value": "hello@example.com",
        "description": "Send us a message."
      }
    ],
    "fields": [
      { "key": "label", "type": "text", "label": "Label" },
      { "key": "value", "type": "text", "label": "Value" },
      { "key": "description", "type": "textarea", "label": "Description" }
    ]
  }
}
\`\`\`

## Form sections

If the referenced section has a form, render a static visual form using semantic \`form\`, \`label\`, \`input\`, \`textarea\`, and \`button\` elements. Do not add submission logic, APIs, validation libraries, or external scripts.

## Common failure checklist

- Do not leave the starter \`NewSectionTemplate\` name.
- Do not leave \`new-section-template\` as the id.
- Do not create \`src/\`, \`app/\`, \`pages/\`, or a second app.
- Do not commit or zip \`node_modules\` or \`dist\`.
- Do not remove \`make-reign-section-package.json\`.
- Do not zip only \`section/\`; zip the whole \`make-reign-section/\` folder.
`;

const SECTION_EXPORT_RULES = `# Export Rules

These rules apply when the section is complete and ready to upload to MakeReign.

## Required Export

Zip the entire \`make-reign-section\` folder for export. Do not upload loose files.

Use a descriptive zip filename based on the created section, for example:

\`\`\`
make-reign-klarheit-contact-section.zip
\`\`\`

Preferred command:

\`\`\`bash
npm run export
\`\`\`

This creates a clean zip next to the \`make-reign-section/\` folder and excludes \`node_modules\`, \`dist\`, and local build artifacts.

The zip must keep this folder shape:

\`\`\`
make-reign-section/
  AI_TASK.md
  package.json
  index.html
  vite.config.js
  scripts/
  make-reign-section-package.json
  README.md
  _shared/
  preview/
  rules/
  section/
\`\`\`

## Before Zipping

- Keep \`make-reign-section-package.json\` inside the folder.
- Update the files under \`section/\` with the completed section code and metadata.
- Ensure \`section/section.json\` has a unique kebab-case \`id\`, a clear \`name\`, the best matching \`category\`, and \`version: "0.1.0"\`.
- Ensure \`section/Section.jsx\` exports one default React component.
- Ensure \`section/Section.module.css\` contains all section-specific styling.
- Ensure all builder controls in \`section/section.json\` map to props used by the component.
- Ensure repeatable content lives in the top-level \`cms\` block and has matching default values.
- Run \`npm install\` and \`npm run dev\` to verify the local preview before export.
- Run \`npm run export\` to create the final upload zip.
- Keep all paths relative to the folder. Do not add absolute paths.
- Do not include \`node_modules\`, \`dist\`, build outputs, screenshots, temp files, or private keys.
- Do not zip a parent folder that contains \`make-reign-section\`; the zip root should contain the \`make-reign-section/\` folder.

## Upload

Upload the completed zip from \`npm run export\` through the MakeReign library \`Upload section\` button.
`;

const URL_REFERENCE_RULES = `# URL Reference Rules

These rules apply when the user's prompt contains a URL such as a Flowbase component URL.

## Goal

Turn the referenced section into a MakeReign-compatible section. Do not copy a whole website, app, collection page, footer, nav, pricing table, or unrelated content. Build one section only.

## URL workflow

1. Open or inspect the URL if your environment supports web access.
2. Find the target component name from the URL slug, page title, heading, or component modal.
3. Extract the section category from the component name, page labels, or visible purpose.
4. Extract the visible section copy, CTA labels, hrefs, contact details, form fields, cards, links, images, and repeated rows.
5. Recreate the likely layout and visual hierarchy using React and scoped CSS.
6. If you cannot view screenshots or exact CSS, build a high-quality approximation from the accessible text and component name. Do not stop or ask the user for more context.

## Flowbase component URLs

For URLs like:

\`\`\`text
https://www.flowbase.co/components?component=klarheit-contact-01&modal=component
\`\`\`

Use the \`component\` query value or page title as the section id/name source:

- \`klarheit-contact-01\` becomes \`id: "klarheit-contact-01"\`
- \`Klarheit Contact 01\` becomes \`name: "Klarheit Contact 01"\`
- \`contact\` implies \`category: "forms"\` when the section has a form, otherwise \`category: "cta"\` or \`category: "intro"\` if it is mainly contact copy

If accessible page text includes:

- Heading: \`We're here to help, have a question for us or need some help?\`
- Body: \`Please get in touch with our team.\`
- CTA: \`View Help Center\`
- CTA href: \`https://www.flowbase.co/support\`

Use those as component defaults unless a screenshot clearly shows different text.

## Section fidelity priorities

Prioritize in this order:

1. Correct MakeReign file structure and upload compatibility.
2. Section purpose, heading, body, CTA, forms, links, and repeatable content.
3. Responsive layout and visual hierarchy.
4. Visual approximation of spacing, color, cards, typography, borders, and alignment.
5. Optional micro-interactions or animation only if visible and simple.

## Contact section defaults

For a contact section, include whichever are visible or implied:

- Inline editable \`eyebrow\`, \`heading\`, \`body\`, and \`ctaLabel\`.
- A \`ctaHref\` prop as a non-visible control only if needed.
- A \`contactMethods\` CMS array for email, phone, address, links, or support options.
- A static visual form if the reference clearly contains form fields.
- No submit API, validation library, remote scripts, or tracking.

## Required output

Always finish by writing these files:

- \`section/Section.jsx\`
- \`section/Section.module.css\`
- \`section/section.json\`
- \`section/README.md\`

Then zip the whole \`make-reign-section/\` folder.
`;

const LOCAL_PREVIEW_RULES = `# Local Preview Rules

The downloaded package includes a local preview app so the section can be viewed and tuned before upload.

## Run Preview

From inside the unzipped \`make-reign-section/\` folder:

\`\`\`bash
npm install
npm run dev
\`\`\`

Open the localhost URL printed by Vite.

## What The Preview Shows

- The section rendered from \`section/Section.jsx\`.
- Inline editing for top-level visible text through \`EditableText\`.
- A generated prop panel with:
  - \`Update CMS\` when \`section.json.cms\` exists.
  - \`Update Styles\` for controls with \`panel: "styles"\`.
  - \`Update Animation\` for controls with \`panel: "animation"\`.
  - \`Auto play\` when an auto toggle exists.
  - \`Play animation\` when animation controls exist but no auto toggle exists.

## Preview App Contract

The preview app exists only to test the package locally. Keep it working, but do not make it the source of truth. The source of truth remains:

- \`section/Section.jsx\`
- \`section/Section.module.css\`
- \`section/section.json\`
- \`section/README.md\`

## Import Compatibility

The preview app aliases MakeReign library imports so the same \`Section.jsx\` can run locally and later be promoted into the real app:

- \`../../_shared/EditableText.jsx\`
- \`../../../../lib/styleguide-defaults.js\`

Do not change those imports unless the app rules change.

## Before Export

Run the preview, test the panel controls, fix obvious rendering issues, then zip the whole \`make-reign-section/\` folder. Do not include \`node_modules\` or \`dist\`.

Preferred export command:

\`\`\`bash
npm run export
\`\`\`
`;

const SECTION_PANEL_RULES = `# Section Panel Rules

Every MakeReign section must include a clear builder panel contract.

## Required panel shape

- Use a top-level \`cms\` block when the section has repeatable items.
- \`Update CMS\` appears only when \`cms\` exists.
- \`Update Styles\` must always be available.
- Styles must include a \`layout\` group.
- \`Update Animation\` appears only when the section has animation controls.
- Every control key must match a prop consumed by \`Section.jsx\`.
- Every control should have a sensible \`defaultValue\` that matches the starter visual state.

## Styles

Styles must cover layout gaps, section padding, media sizing, text block spacing, typography choices, color choices, and button/link styles when present.

Use style guide controls instead of hard-coded one-off options:

- \`typography-token\` for text roles.
- \`color-token\` for colors.
- \`button-variant\` for buttons and CTA links.
- \`slider\` for spacing, sizing, timing, and intensity.
- \`select\` for alignment, layout mode, media position, form layout, or card style choices.

Style-guide-linked props should be applied through CSS variables where possible, for example colors, typography roles, spacing, and button variants. Avoid hard-coded brand colors when a style token can represent the choice.

## CMS

Use \`cms\` when content can repeat or change length. Examples include contact methods, office locations, team members, feature cards, pricing rows, form fields, social links, stats, FAQs, logos, testimonials, and navigation links.

The \`cms.key\` must match the array prop consumed by \`Section.jsx\`. The \`cms.defaultValue\` must show a complete, realistic version of the section without needing external data.

## Sliders

Use \`min: 0\`, \`max: 100\`, \`step: 1\` or \`5\`, and \`defaultValue: 50\`. The full \`0..100\` range must work with no dead zones.

## Text

Visible section-level headings, eyebrows, body copy, button labels, and link labels should be editable inline with \`EditableText\`. Do not put them in normal panel controls.

Repeatable item text should live in CMS fields instead of standalone style controls.

## Animation

If animation is automatic, expose an \`Auto play\` toggle. If animation is manual or scroll-triggered, expose a \`Play animation\` action instead. Changing animation style must restart the preview.
`;

const SECTION_SCHEMA_REFERENCE = JSON.stringify(
  {
    required: ["id", "name", "category", "version", "controls"],
    controlTypes: [
      "slider",
      "select",
      "image",
      "array-object",
      "button-variant",
      "color-token",
      "typography-token",
      "toggle",
      "number",
      "text",
      "textarea",
    ],
    styleGroups: ["typography", "layout", "color", "spacing"],
    panels: ["styles", "animation"],
    cmsFieldTypes: ["text", "textarea", "image", "number"],
    aiBuildChecklist: [
      "Read README.md first.",
      "Read rules/export.md and rules/section-panel.md.",
      "Replace section/section.json, section/Section.jsx, and section/Section.module.css with the finished section.",
      "Keep the same folder shape.",
      "Zip the make-reign-section folder when complete.",
    ],
    categories: [
      "hero",
      "intro",
      "carousel",
      "testimonials",
      "gallery",
      "features",
      "forms",
      "cta",
      "footer",
      "navigation",
      "accordion",
    ],
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
      description: "A starter section created from the MakeReign Build Mode template.",
      dependencies: [],
      tags: ["starter"],
      controls: [
        {
          key: "headingTypography",
          type: "typography-token",
          label: "Heading tag",
          panel: "styles",
          group: "typography",
          defaultValue: "h2",
        },
        {
          key: "textColor",
          type: "color-token",
          label: "Text color",
          panel: "styles",
          group: "color",
          defaultValue: "dark",
        },
        {
          key: "sectionPaddingPct",
          type: "slider",
          label: "Section padding",
          panel: "styles",
          group: "layout",
          min: 0,
          max: 100,
          step: 5,
          defaultValue: 50,
        },
      ],
      cms: {
        key: "items",
        label: "Items",
        defaultValue: [
          {
            heading: "Template item",
            description: "Replace this with real content.",
          },
        ],
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

function findPackagePrefix(files) {
  const paths = Object.keys(files);
  const sectionPath = paths.find((path) => path.endsWith("/section/section.json"));
  if (!sectionPath) return "";
  return sectionPath.slice(0, sectionPath.length - "section/section.json".length);
}

function buildSectionJsx() {
  return `"use client";

import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";

const DEFAULT_ITEMS = [
  {
    heading: "Template item",
    description: "Replace this with real content.",
  },
];

function pctToPadding(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return Math.round(32 + (value / 100) * 160);
}

function colorTokenValue(token, fallback) {
  if (!token) return fallback;
  if (token === "transparent") return "transparent";
  const [base, alpha] = String(token).split("/");
  const color = \`var(--sg-color-\${base}, \${fallback})\`;
  if (!alpha) return color;
  const amount = Number(alpha);
  return \`color-mix(in srgb, \${color} \${Number.isFinite(amount) ? amount : 100}%, transparent)\`;
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
  const HeadingTag = headingTypography?.startsWith("h") ? headingTypography : "h2";

  const persist = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  return (
    <section
      className={styles.root}
      style={{
        "--section-padding": \`\${pctToPadding(sectionPaddingPct)}px\`,
        "--section-text": colorTokenValue(textColor, "var(--chrome-fg)"),
      }}
    >
      <div className={styles.inner}>
        <EditableText
          as="p"
          value={eyebrow}
          editing={_editing}
          onChange={(value) => persist("eyebrow", value)}
          className={styles.eyebrow}
          placeholder="Eyebrow"
        />
        <EditableText
          as={HeadingTag}
          value={heading}
          editing={_editing}
          onChange={(value) => persist("heading", value)}
          className={styles.heading}
          placeholder="Heading"
        />
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

## Local AI build brief

When a user asks an AI to make a section from a URL or reference image, the AI should:

1. Understand the target section layout, content hierarchy, spacing, responsive behavior, and visual style.
2. Recreate only that section, not the full source website.
3. Build the section as a standalone React component in \`Section.jsx\`.
4. Keep all styles scoped in \`Section.module.css\`.
5. Update \`section.json\` so MakeReign can generate the builder panels automatically.
6. Prepare the folder for export by following \`../rules/export.md\`.

## Component checklist

- Export one default component.
- Accept props for all editable style and CMS values.
- Include \`_editing\` and \`_onPropChange\` support for inline editable top-level text.
- Use safe defaults so the section renders immediately.
- Do not rely on remote scripts, app routes, global CSS files, or package installs.
- Use semantic HTML for headings, links, forms, lists, addresses, and buttons.
- Make the section responsive for mobile, tablet, and desktop.

## Panel checklist

- Keep visible section-level text inline editable with \`EditableText\`.
- Put repeatable item content in the top-level \`cms\` block.
- Keep \`Update Styles\` available with at least one Layout control.
- Use style guide token controls for typography, color, and buttons.
- Add \`panel: "animation"\` only when the section has real animation controls.

## Export checklist

- \`section/section.json\` is valid JSON.
- \`section/section.json.id\` is unique kebab-case.
- \`section/section.json.controls\` includes at least one \`panel: "styles"\` control.
- \`section/section.json.controls\` includes at least one Styles/Layout control.
- The final zip contains the \`make-reign-section/\` folder at the root.
`;
}
