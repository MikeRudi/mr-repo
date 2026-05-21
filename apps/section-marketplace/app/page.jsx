import Link from "next/link";
import AppShell from "./_components/AppShell.jsx";
import StartTile from "./_components/StartTile.jsx";

const BROWSE = [
  {
    href: "/library",
    title: "View library",
    body: "Every section in the catalog with live preview, props, motion, and curation notes.",
  },
  {
    href: "/templates",
    title: "View templates",
    body: "Curated full-page starts. Open one to preview, then duplicate it into the builder.",
  },
];

const START = [
  {
    href: "/builder/new",
    title: "Blank site",
    body: "Open the editor with an empty canvas. Drop in sections, set tokens as you go.",
  },
  {
    href: "/builder/new?from=template",
    title: "From a library template",
    body: "Begin with a curated layout, then edit tokens and swap sections to taste.",
  },
  {
    href: "/start/screenshot",
    title: "From a screenshot",
    body: "Drop a reference image. We propose matching sections from the library.",
    comingSoon: true,
  },
  {
    href: "/start/figma",
    title: "From a Figma design",
    body: "Paste a Figma file. We map frames to sections and tokens to the style guide.",
    comingSoon: true,
  },
  {
    href: "/start/url",
    title: "From a URL reference",
    body: "Paste a site you like. We pull its layout signals and propose a composition.",
    comingSoon: true,
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
          The internal builder for every MakeReign project. Browse the library,
          pick a starting point, drop in sections, set the brand once, and
          publish.
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[12px] uppercase tracking-[0.16em] text-(--chrome-fg-subtle)">
            Browse
          </h2>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BROWSE.map((b) => (
            <li key={b.href}>
              <Link
                href={b.href}
                className="group flex flex-col h-full p-7 rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) hover:border-(--chrome-border-strong) transition-colors"
              >
                <span className="font-[family-name:var(--chrome-font-display)] text-[28px] leading-tight text-(--chrome-fg)">
                  {b.title}
                </span>
                <span className="mt-3 text-[13px] text-(--chrome-fg-muted) leading-relaxed">
                  {b.body}
                </span>
                <span className="mt-6 inline-flex items-center gap-1 text-[12px] text-(--chrome-fg) group-hover:translate-x-0.5 transition-transform">
                  Open <span aria-hidden>→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-24">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[12px] uppercase tracking-[0.16em] text-(--chrome-fg-subtle)">
            Start a site
          </h2>
          <p className="text-[11px] text-(--chrome-fg-subtle)">
            5 ways in, more arriving
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {START.map((s) => (
            <li key={s.href}>
              <StartTile
                href={s.href}
                title={s.title}
                body={s.body}
                comingSoon={s.comingSoon}
              />
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
