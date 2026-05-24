import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve("docs/app-summary/makereign-app-summary.pdf");

const images = {
  home: "/private/tmp/mr-app-summary-screenshots/home.png",
  library: "/private/tmp/mr-app-summary-screenshots/library.png",
  builder: "/private/tmp/mr-app-summary-screenshots/builder-with-section.png",
  styleguide: "/private/tmp/mr-app-summary-screenshots/styleguide.png",
};

const page = {
  width: 842,
  height: 595,
  margin: 46,
};

const font = {
  regular: "F1",
  bold: "F2",
  mono: "F3",
};

function esc(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[→✓]/g, "-");
}

function wrapText(text, size, maxWidth) {
  const avg = size * 0.49;
  const maxChars = Math.max(10, Math.floor(maxWidth / avg));
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

class PdfPage {
  constructor() {
    this.ops = [];
  }

  text(value, x, y, options = {}) {
    const {
      size = 12,
      leading = size * 1.3,
      fontName = font.regular,
      color = "0 0 0",
      width,
    } = options;
    const lines = width ? wrapText(value, size, width) : [value];
    this.ops.push("BT");
    this.ops.push(`/${fontName} ${size} Tf`);
    this.ops.push(`${color} rg`);
    this.ops.push(`${leading} TL`);
    this.ops.push(`1 0 0 1 ${x} ${y} Tm`);
    lines.forEach((line, index) => {
      if (index > 0) this.ops.push("T*");
      this.ops.push(`(${esc(line)}) Tj`);
    });
    this.ops.push("ET");
    return y - leading * lines.length;
  }

  rule(x, y, w, color = "0.86 0.86 0.86") {
    this.ops.push(`${color} RG`);
    this.ops.push("0.75 w");
    this.ops.push(`${x} ${y} m ${x + w} ${y} l S`);
  }

  rect(x, y, w, h, options = {}) {
    const { fill = "0.97 0.97 0.96", stroke = "0.86 0.86 0.84" } = options;
    this.ops.push(`${fill} rg`);
    this.ops.push(`${stroke} RG`);
    this.ops.push("0.8 w");
    this.ops.push(`${x} ${y} ${w} ${h} re B`);
  }

  image(name, x, y, w, h) {
    this.ops.push("q");
    this.ops.push(`${w} 0 0 ${h} ${x} ${y} cm`);
    this.ops.push(`/${name} Do`);
    this.ops.push("Q");
  }

  contents() {
    return `${this.ops.join("\n")}\n`;
  }
}

function sectionTitle(p, title, x, y) {
  return p.text(title, x, y, {
    size: 18,
    fontName: font.bold,
  });
}

function bulletList(p, items, x, y, width, options = {}) {
  let cursor = y;
  const size = options.size ?? 10.5;
  for (const item of items) {
    p.text("•", x, cursor, { size, fontName: font.bold });
    cursor = p.text(item, x + 14, cursor, {
      size,
      width,
      color: options.color ?? "0.18 0.18 0.18",
    }) - 3;
  }
  return cursor;
}

function table(p, rows, x, y, widths) {
  let cursor = y;
  rows.forEach((row, index) => {
    const h = index === 0 ? 30 : 40;
    p.rect(x, cursor - h + 8, widths[0] + widths[1], h, {
      fill: index === 0 ? "0.08 0.08 0.08" : "0.98 0.98 0.97",
      stroke: "0.86 0.86 0.84",
    });
    p.text(row[0], x + 12, cursor - 10, {
      size: index === 0 ? 10.5 : 10,
      fontName: font.bold,
      color: index === 0 ? "1 1 1" : "0.05 0.05 0.05",
      width: widths[0] - 20,
    });
    p.text(row[1], x + widths[0] + 12, cursor - 10, {
      size: 10,
      color: index === 0 ? "1 1 1" : "0.24 0.24 0.24",
      width: widths[1] - 20,
    });
    cursor -= h;
  });
  return cursor;
}

function codeBox(p, lines, x, y, w, h) {
  p.rect(x, y - h, w, h, { fill: "0.96 0.96 0.95", stroke: "0.82 0.82 0.8" });
  let cursor = y - 18;
  for (const line of lines) {
    p.text(line, x + 14, cursor, {
      size: 9,
      fontName: font.mono,
      color: "0.1 0.1 0.1",
      width: w - 28,
    });
    cursor -= 14;
  }
}

const pages = [];

{
  const p = new PdfPage();
  p.text("MakeReign App Summary", page.margin, 535, {
    size: 34,
    fontName: font.bold,
  });
  p.text("Internal section marketplace, style guide, and website builder", page.margin, 504, {
    size: 15,
    color: "0.34 0.34 0.34",
  });
  p.rule(page.margin, 486, page.width - page.margin * 2);
  p.text(
    "This app helps the MakeReign team browse reusable website sections, choose curated templates, define brand styling once, assemble pages visually, and publish/share generated sites.",
    page.margin,
    462,
    { size: 12.5, width: 420, color: "0.2 0.2 0.2" }
  );
  p.image("ImHome", 462, 285, 326, 183);
  p.text("Home screen: clear entry points for library, templates, style guide, and builder.", 462, 266, {
    size: 9.5,
    color: "0.42 0.42 0.42",
    width: 326,
  });

  p.rect(page.margin, 264, 374, 150);
  p.text("Plain-English Product Shape", page.margin + 18, 390, {
    size: 16,
    fontName: font.bold,
  });
  bulletList(
    p,
    [
      "A reusable section catalogue for consistent MakeReign builds.",
      "A token-based style guide so brand rules apply across every section.",
      "A visual builder for composing pages without starting from code.",
      "A publishing path that saves page data and renders a shareable URL.",
    ],
    page.margin + 18,
    364,
    326
  );
  pages.push(p);
}

{
  const p = new PdfPage();
  sectionTitle(p, "What The App Includes", page.margin, 535);
  p.text("The product is organised around four main user-facing areas.", page.margin, 511, {
    size: 11,
    color: "0.35 0.35 0.35",
  });
  table(
    p,
    [
      ["Area", "Purpose"],
      ["Home", "Starting point for browsing sections/templates or opening the site builder."],
      ["Section Library", "Catalogue of reusable website sections with filters, lifecycle status, metadata, and previews."],
      ["Templates", "Full-page starting points, including Excellence Awards and Blank Site."],
      ["Style Guide", "Brand token editor for colours, type, spacing, radii, cards, buttons, links, and scaling."],
      ["Builder", "Canvas where users add sections, manage pages, edit content/styles, and save/publish."],
      ["Published Site", "Renders saved builder output as a shareable /site/[siteId] page."],
    ],
    page.margin,
    482,
    [150, 590]
  );
  p.image("ImLibrary", page.margin, 58, 352, 198);
  p.image("ImStyle", 442, 58, 352, 198);
  p.text("Library and style guide screens: browsing structure on the left, brand controls on the right.", page.margin, 38, {
    size: 9.5,
    color: "0.42 0.42 0.42",
    width: 720,
  });
  pages.push(p);
}

{
  const p = new PdfPage();
  sectionTitle(p, "Architecture And Structure", page.margin, 535);
  p.text(
    "This is a small monorepo. The main product lives in apps/section-marketplace, with shared UI and section primitives in packages.",
    page.margin,
    511,
    { size: 11, width: 720, color: "0.35 0.35 0.35" }
  );
  codeBox(
    p,
    [
      "MakeReign Monorepo",
      "├── apps/section-marketplace",
      "│   ├── app/        Next.js routes and screens",
      "│   ├── app/api/    sections, templates, style guides, publishing",
      "│   ├── library/    source data for sections and templates",
      "│   ├── lib/        DB, filtering, token CSS helpers",
      "│   └── db/         Neon/Postgres migrations",
      "└── packages",
      "    ├── canonical-stack      section wrapper + motion runtime base",
      "    └── section-library-ui   shared marketplace/builder UI",
    ],
    page.margin,
    474,
    740,
    184
  );

  sectionTitle(p, "Core Flow", page.margin, 252);
  codeBox(
    p,
    [
      "Start → Browse library/template → Open builder",
      "      → Add sections → Apply style guide tokens",
      "      → Edit content/styles → Save site → Share /site/[siteId]",
    ],
    page.margin,
    222,
    360,
    72
  );

  sectionTitle(p, "Section System", 450, 252);
  p.text("15 sections are registered in seed data. 10 currently have live React implementations.", 450, 224, {
    size: 10.5,
    width: 330,
    color: "0.25 0.25 0.25",
  });
  bulletList(
    p,
    [
      "Categories: hero, intro, carousel, testimonials, features, gallery, forms, CTA, footer, navigation.",
      "Tracks: stable and experimental.",
      "Lifecycle: Approved and Submitted.",
      "Unimplemented sections show as coming soon placeholders.",
    ],
    450,
    187,
    330,
    { size: 10 }
  );
  pages.push(p);
}

{
  const p = new PdfPage();
  sectionTitle(p, "Builder Experience", page.margin, 535);
  p.text(
    "The builder is the central production surface. It has a section picker, page manager, style guide selector, live canvas, and inspector panel.",
    page.margin,
    511,
    { size: 11, width: 720, color: "0.35 0.35 0.35" }
  );
  p.image("ImBuilder", page.margin, 232, 740, 416);
  p.text("Builder with one hero section added to the canvas.", page.margin, 212, {
    size: 9.5,
    color: "0.42 0.42 0.42",
  });
  table(
    p,
    [
      ["Builder Part", "What it does"],
      ["Left Sidebar", "Searches and adds sections, manages pages, and chooses saved style guides."],
      ["Canvas", "Shows the live page composition using real section components."],
      ["Inspector", "Moves, removes, and edits the selected section or element."],
      ["Save", "Sends pages, tokens, and styleGuideId to the publish API."],
    ],
    page.margin,
    180,
    [150, 590]
  );
  pages.push(p);
}

{
  const p = new PdfPage();
  sectionTitle(p, "Data, APIs, And Current Notes", page.margin, 535);
  p.text("The app combines local catalogue data with database-backed saved work.", page.margin, 511, {
    size: 11,
    color: "0.35 0.35 0.35",
  });
  table(
    p,
    [
      ["Data Type", "Source"],
      ["Sections/templates", "Local JSON seed files and section/template folders inside library/."],
      ["Style guides", "Neon/Postgres table: style_guides."],
      ["Published sites", "Neon/Postgres table: sites, storing page/tokens JSON."],
    ],
    page.margin,
    482,
    [160, 580]
  );
  codeBox(
    p,
    [
      "GET  /api/sections          GET /api/templates",
      "GET  /api/sections/[id]     GET /api/templates/[slug]",
      "GET  /api/styleguides       POST /api/styleguides",
      "GET  /api/styleguides/[id]  PUT/DELETE /api/styleguides/[id]",
      "POST /api/sites/publish     GET /site/[siteId]",
    ],
    page.margin,
    326,
    740,
    112
  );
  p.rect(page.margin, 108, 740, 146, { fill: "0.98 0.98 0.97", stroke: "0.84 0.84 0.82" });
  p.text("Current Notes", page.margin + 18, 226, { size: 16, fontName: font.bold });
  bulletList(
    p,
    [
      "The frontend loads and the main screens render locally.",
      "Database-backed style guide and publish routes require DATABASE_URL.",
      "The app already demonstrates the intended library → style guide → builder → published site workflow.",
      "The next practical work is hardening database setup and completing remaining section implementations.",
    ],
    page.margin + 18,
    198,
    690
  );
  pages.push(p);
}

function makePdf() {
  const objects = [];
  const add = (body) => {
    objects.push(body);
    return objects.length;
  };

  const fontRegular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const fontMono = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");

  const imageObjects = {};
  for (const [key, file] of Object.entries(images)) {
    if (!fs.existsSync(file)) continue;
    const data = fs.readFileSync(file);
    const name = key === "home" ? "ImHome" : key === "library" ? "ImLibrary" : key === "builder" ? "ImBuilder" : "ImStyle";
    imageObjects[name] = add({
      stream: data,
      dict: `<< /Type /XObject /Subtype /Image /Width 1280 /Height 720 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>`,
    });
  }

  const pageObjects = [];
  const contentObjects = [];
  for (const p of pages) {
    const content = Buffer.from(p.contents(), "utf8");
    contentObjects.push(add({
      stream: content,
      dict: `<< /Length ${content.length} >>`,
    }));
    pageObjects.push(add(null));
  }

  const pagesObject = add(null);

  pageObjects.forEach((objNum, index) => {
    const xObjects = Object.entries(imageObjects)
      .map(([name, id]) => `/${name} ${id} 0 R`)
      .join(" ");
    objects[objNum - 1] =
      `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${page.width} ${page.height}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R /F3 ${fontMono} 0 R >> /XObject << ${xObjects} >> >> /Contents ${contentObjects[index]} 0 R >>`;
  });

  objects[pagesObject - 1] =
    `<< /Type /Pages /Count ${pageObjects.length} /Kids [${pageObjects.map((n) => `${n} 0 R`).join(" ")}] >>`;

  const catalog = add(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);

  const parts = ["%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"];
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(parts.join(""), "binary"));
    parts.push(`${index + 1} 0 obj\n`);
    if (typeof body === "string") {
      parts.push(body);
      parts.push("\nendobj\n");
    } else {
      parts.push(`${body.dict}\nstream\n`);
      parts.push(body.stream);
      parts.push("\nendstream\nendobj\n");
    }
  });

  const xrefOffset = Buffer.byteLength(parts.join(""), "binary");
  parts.push(`xref\n0 ${objects.length + 1}\n`);
  parts.push("0000000000 65535 f \n");
  for (let i = 1; i < offsets.length; i += 1) {
    parts.push(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  }
  parts.push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\n`);
  parts.push(`startxref\n${xrefOffset}\n%%EOF\n`);

  return Buffer.concat(parts.map((part) => (Buffer.isBuffer(part) ? part : Buffer.from(part, "binary"))));
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, makePdf());
console.log(outputPath);
