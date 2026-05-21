import Link from "next/link";
import AppShell from "./_components/AppShell.jsx";

const ENTRY_POINTS = [
  {
    href: "/builder/new",
    eyebrow: "Start fresh",
    title: "Blank site",
    body: "Open the editor with an empty canvas. Drop in sections, set tokens as you go.",
  },
  {
    href: "/templates",
    eyebrow: "Start from a preset",
    title: "Template",
    body: "Begin with a curated layout. Edit tokens, swap sections, ship.",
  },
  {
    href: "/library",
    eyebrow: "Browse",
    title: "Section library",
    body: "Inspect every section in the catalog with its props, motion, and curation notes.",
  },
  {
    href: "/styleguide",
    eyebrow: "Set the brand",
    title: "Style guide",
    body: "Fill in surface, foreground, accent, type, spacing, and radii. Saved to the database.",
  },
];

export default function Lander() {
  return (
    <AppShell active="/">
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-12">
        <p className="text-[12px] uppercase tracking-[0.18em] text-(--chrome-fg-subtle)">
          MakeReign · Internal
        </p>
        <h1 className="mt-3 font-[family-name:var(--chrome-font-display)] text-[clamp(40px,6vw,80px)] leading-[1.02] tracking-[-0.01em] text-(--chrome-fg)">
          Make sites the MakeReign way.
        </h1>
        <p className="mt-5 max-w-[640px] text-[15px] text-(--chrome-fg-muted) leading-relaxed">
          The internal builder for every MakeReign project. Pick a starting
          point, drop in sections from the library, set the brand once, and
          publish. Built on top of <code>@mr/canonical-stack</code>.
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-24">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ENTRY_POINTS.map((entry) => (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className="group flex flex-col h-full p-7 rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) hover:border-(--chrome-border-strong) transition-colors"
              >
                <span className="text-[12px] uppercase tracking-[0.12em] text-(--chrome-fg-subtle)">
                  {entry.eyebrow}
                </span>
                <span className="mt-2 font-[family-name:var(--chrome-font-display)] text-[28px] leading-tight text-(--chrome-fg)">
                  {entry.title}
                </span>
                <span className="mt-3 text-[13px] text-(--chrome-fg-muted) leading-relaxed">
                  {entry.body}
                </span>
                <span className="mt-6 inline-flex items-center gap-1 text-[12px] text-(--chrome-fg) group-hover:translate-x-0.5 transition-transform">
                  Open <span aria-hidden>→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
