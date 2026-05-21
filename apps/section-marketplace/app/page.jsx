import Link from "next/link";

const templates = [
  {
    slug: "excellence-awards",
    name: "Priority Pass · Excellence Awards 2026",
    summary: "Full-page Webflow-exported campaign, ported to React/JSX.",
    category: "Campaign",
  },
];

const sectionCategories = [
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
];

export default function MarketplaceHome() {
  return (
    <main className="min-h-screen bg-(--mr-surface) text-(--mr-fg) px-8 py-12">
      <header className="max-w-6xl mx-auto mb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-(--mr-fg-muted)">MakeReign</p>
        <h1 className="text-4xl font-semibold mt-2">Section Marketplace</h1>
        <p className="mt-3 max-w-2xl text-(--mr-fg-muted)">
          A Git-backed library of reusable, design-system-adaptive React sections
          and full page templates. Consumed by <code>mr-web-builder</code> and any
          MakeReign project.
        </p>
      </header>

      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-xl font-medium mb-4">Templates</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/templates/${t.slug}`}
                className="block rounded-lg border border-(--mr-border) p-5 hover:border-(--mr-accent) transition-colors"
              >
                <p className="text-xs uppercase tracking-wider text-(--mr-fg-muted)">{t.category}</p>
                <p className="text-lg font-medium mt-1">{t.name}</p>
                <p className="text-sm text-(--mr-fg-muted) mt-2">{t.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-6xl mx-auto">
        <h2 className="text-xl font-medium mb-4">Section Categories</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {sectionCategories.map((c) => (
            <li
              key={c}
              className="rounded-lg border border-(--mr-border) px-4 py-3 text-sm capitalize text-(--mr-fg-muted)"
            >
              {c}
            </li>
          ))}
        </ul>
        <p className="text-xs text-(--mr-fg-muted) mt-4">
          Empty for now. Sections will be added under
          <code className="ml-1">library/sections/&lt;category&gt;/&lt;slug&gt;/</code>.
        </p>
      </section>
    </main>
  );
}
