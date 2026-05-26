const PACKAGE_VERSION = "0.1.0";

export async function buildSectionTemplatePackage() {
  return {
    kind: "make-reign-section-package",
    packageVersion: PACKAGE_VERSION,
    createdAt: new Date().toISOString(),
    instructions:
      "Edit the files in this package with your local AI model, then upload this same JSON file back to the MakeReign library.",
    files: {
      "README.md": buildReadme(),
      "rules/section-panel.md": SECTION_PANEL_RULES,
      "rules/section.schema.json": SECTION_SCHEMA_REFERENCE,
      "section/section.json": buildSectionJson(),
      "section/Section.jsx": buildSectionJsx(),
      "section/Section.module.css": buildSectionCss(),
      "section/README.md": buildSectionReadme(),
    },
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

  return {
    ok: true,
    manifest,
    sectionId: id,
    name,
  };
}

function buildReadme() {
  return `# MakeReign Section Package

This is a portable section template for local AI-assisted section creation.

## What to do

1. Give this JSON file to your local AI model.
2. Ask it to edit the files under \`section/\`.
3. Keep the package shape the same.
4. Upload this edited JSON file back to the MakeReign library.

## Required files

- \`section/section.json\` describes the section and builder panel.
- \`section/Section.jsx\` exports the React section component.
- \`section/Section.module.css\` contains scoped section styles.
- \`section/README.md\` explains the section.
- \`rules/section-panel.md\` tells the AI how panel controls must work.
- \`rules/section.schema.json\` is the manifest schema reference.

## Important

The upload does not publish the section immediately. It creates a review submission. An admin manually reviews and activates approved sections later.
`;
}

const SECTION_PANEL_RULES = `# Section Panel Rules

Every MakeReign section must include a clear builder panel contract.

## Required panel shape

- Use a top-level \`cms\` block when the section has repeatable items.
- \`Update CMS\` appears only when \`cms\` exists.
- \`Update Styles\` must always be available.
- Styles must include a \`layout\` group.
- \`Update Animation\` appears only when the section has animation controls.

## Styles

Styles must cover layout gaps, section padding, media sizing, text block spacing, typography choices, color choices, and button/link styles when present.

Use style guide controls instead of hard-coded one-off options:

- \`typography-token\` for text roles.
- \`color-token\` for colors.
- \`button-variant\` for buttons and CTA links.
- \`slider\` for spacing, sizing, timing, and intensity.

## Sliders

Use \`min: 0\`, \`max: 100\`, \`step: 1\` or \`5\`, and \`defaultValue: 50\`. The full \`0..100\` range must work with no dead zones.

## Text

Visible section-level headings, eyebrows, body copy, button labels, and link labels should be editable inline with \`EditableText\`. Do not put them in normal panel controls.

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

## Panel checklist

- Keep visible section-level text inline editable with \`EditableText\`.
- Put repeatable item content in the top-level \`cms\` block.
- Keep \`Update Styles\` available with at least one Layout control.
- Use style guide token controls for typography, color, and buttons.
- Add \`panel: "animation"\` only when the section has real animation controls.
`;
}
