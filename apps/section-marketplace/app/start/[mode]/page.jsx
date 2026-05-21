import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "../../_components/AppShell.jsx";

const MODES = {
  screenshot: {
    title: "Start from a screenshot",
    body: "Drop a reference image of a site you like. We'll detect layout signals — section types, density, imagery use — and propose matching components from the library.",
    plan: [
      "Drag-and-drop image upload to a temporary store",
      "Vision call to label structural sections (hero, features, gallery, CTA, footer, etc.)",
      "Match to library by category + tonal affordance + visual density",
      "Open the builder with a proposed composition you can refine",
    ],
  },
  figma: {
    title: "Start from a Figma design",
    body: "Paste a Figma file URL. We'll map top-level frames to library sections, and pull the design tokens (colour, type, spacing, radii) into the style guide.",
    plan: [
      "OAuth with Figma + read-only access to the file",
      "Frame-to-section heuristics with manual override",
      "Pull paint styles + text styles into the style guide",
      "Open the builder with the imported composition",
    ],
  },
  url: {
    title: "Start from a URL reference",
    body: "Paste a live URL. We'll fetch a static rendering, sample its DOM and CSS, and propose a composition of library sections that lands in the same neighbourhood.",
    plan: [
      "Headless render to a stable snapshot",
      "DOM region detection → structural section labels",
      "Sampled palette + type stack → style guide proposal",
      "Open the builder with the proposed composition",
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(MODES).map((mode) => ({ mode }));
}

export async function generateMetadata({ params }) {
  const { mode } = await params;
  const m = MODES[mode];
  return { title: m ? `${m.title} — Coming soon — MakeReign` : "MakeReign" };
}

export default async function StartModePage({ params }) {
  const { mode } = await params;
  const m = MODES[mode];
  if (!m) notFound();

  return (
    <AppShell active="/">
      <section className="mx-auto max-w-[860px] px-6 pt-16 pb-24">
        <div className="inline-flex items-center h-7 px-3 rounded-(--chrome-radius-pill) bg-(--chrome-surface) border border-(--chrome-border) text-[11px] uppercase tracking-[0.16em] text-(--chrome-fg-muted)">
          Coming soon
        </div>
        <h1 className="mt-5 font-[family-name:var(--chrome-font-display)] text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.01em] text-(--chrome-fg)">
          {m.title}
        </h1>
        <p className="mt-5 text-[15px] text-(--chrome-fg-muted) leading-relaxed max-w-[640px]">
          {m.body}
        </p>

        <div className="mt-12">
          <h2 className="text-[12px] uppercase tracking-[0.16em] text-(--chrome-fg-subtle)">
            Plan
          </h2>
          <ol className="mt-4 space-y-3">
            {m.plan.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-4 p-4 bg-(--chrome-surface) border border-(--chrome-border) rounded-(--chrome-radius-card)"
              >
                <span
                  aria-hidden
                  className="shrink-0 grid place-items-center size-7 rounded-full bg-(--chrome-fg) text-(--chrome-fg-inverse) text-[12px] font-[family-name:var(--chrome-font-mono)]"
                >
                  {i + 1}
                </span>
                <p className="text-[14px] text-(--chrome-fg) leading-relaxed">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 flex items-center gap-3">
          <Link
            href="/builder/new"
            className="inline-flex items-center h-10 px-5 rounded-(--chrome-radius-pill) bg-(--chrome-fg) text-(--chrome-fg-inverse) text-[13px]"
          >
            Start with a blank site instead
          </Link>
          <Link
            href="/"
            className="inline-flex items-center h-10 px-5 rounded-(--chrome-radius-pill) border border-(--chrome-border) text-(--chrome-fg) text-[13px] hover:border-(--chrome-border-strong)"
          >
            Back home
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
