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
      "rules/component-contract.md": COMPONENT_CONTRACT_RULES,
      "rules/export.md": SECTION_EXPORT_RULES,
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
    if (control.type === "color-token" && typeof defaultValue === "string" && !ALLOWED_COLOR_TOKENS.has(defaultValue)) {
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
Unzip and read all the files in this folder make-reign-section-package.zip in my downloads folder. Then make this section [URL OR DESCRIPTION] and prep the folder for export, make sure to follow all the rules inside the files of this folder.
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
5. Keep \`AI_TASK.md\`, \`README.md\`, \`rules/\`, and \`make-reign-section-package.json\`.
6. Zip the entire \`make-reign-section/\` folder when done.

## Final output tree

\`\`\`text
make-reign-section/
  AI_TASK.md
  README.md
  make-reign-section-package.json
  rules/
    component-contract.md
    export.md
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
- The final zip is named after the section, for example \`make-reign-klarheit-contact-01.zip\`.
`;
}

function buildReadme() {
  return `# MakeReign Section Package

This folder is a portable section template for local AI-assisted section creation.

## Prompt to give your local AI

\`\`\`
Unzip and read this folder make-reign-section-package.zip. Then make this section [PASTE SECTION URL OR DESCRIPTION HERE] and prep the folder for export.
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
6. Ask it to zip the whole \`make-reign-section\` folder with a clear export name, for example \`make-reign-klarheit-contact-section.zip\`.
7. Upload the edited zip back to the MakeReign library.

## What the AI must create

- A faithful section recreation in \`section/Section.jsx\`.
- Scoped styles in \`section/Section.module.css\`.
- A valid manifest in \`section/section.json\`.
- Inline editable top-level text where relevant.
- CMS setup for repeatable content such as cards, links, people, stats, FAQs, testimonials, or form fields.
- Style controls that auto-link to the MakeReign style guide using typography, color, and button token controls.
- Layout controls for spacing, padding, grid, media sizing, and alignment.
- Animation controls only when animation is actually part of the section.

## Required files

- \`section/section.json\` describes the section and builder panel.
- \`section/Section.jsx\` exports the React section component.
- \`section/Section.module.css\` contains scoped section styles.
- \`section/README.md\` explains the section.
- \`make-reign-section-package.json\` is the review manifest for MakeReign.
- \`AI_TASK.md\` is the direct task contract for local AI tools.
- \`rules/component-contract.md\` explains exactly how \`Section.jsx\` must be written for the app.
- \`rules/export.md\` tells the AI how to package the folder for upload.
- \`rules/section-panel.md\` tells the AI how panel controls must work.
- \`rules/url-reference.md\` tells the AI how to turn a URL or page text into a MakeReign section.
- \`rules/section.schema.json\` is the manifest schema reference.

## Important

The AI should not create a full app, install dependencies, or move the section outside this package. It should only prepare the files in this folder for MakeReign upload.

The upload does not publish the section immediately. It creates a review submission. An admin manually reviews and activates approved sections later.
`;
}

const COMPONENT_CONTRACT_RULES = `# Component Contract

These rules make generated sections compatible with MakeReign.

## Files to edit

Only edit files inside \`section/\` unless updating this package's documentation. Do not create a new app.

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
- Do not create \`src/\`, \`app/\`, \`pages/\`, \`package.json\`, or \`node_modules\`.
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

The zip must keep this folder shape:

\`\`\`
make-reign-section/
  make-reign-section-package.json
  README.md
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
- Keep all paths relative to the folder. Do not add absolute paths.
- Do not include \`node_modules\`, build outputs, screenshots, temp files, or private keys.
- Do not zip a parent folder that contains \`make-reign-section\`; the zip root should contain the \`make-reign-section/\` folder.

## Upload

Upload the completed zip through the MakeReign library \`Upload section\` button.
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
        "--section-text": \`var(--sg-color-\${textColor}, var(--chrome-fg))\`,
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
