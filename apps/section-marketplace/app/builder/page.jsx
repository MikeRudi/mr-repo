import Link from "next/link";
import AppShell from "../_components/AppShell.jsx";

export const metadata = {
  title: "Builder — MakeReign",
};

export default function BuilderHome() {
  return (
    <AppShell active="/builder">
      <section className="mx-auto max-w-[1200px] px-6 pt-12 pb-6">
        <p className="text-[12px] uppercase tracking-[0.18em] text-(--chrome-fg-subtle)">
          Compose
        </p>
        <h1 className="mt-2 font-[family-name:var(--chrome-font-display)] text-[44px] leading-tight text-(--chrome-fg)">
          Builder
        </h1>
        <p className="mt-2 text-[14px] text-(--chrome-fg-muted) max-w-[600px]">
          Phase B will introduce the full editor — library panel on the left,
          canvas in the middle, inspector on the right. Below is a preview of
          the entry points.
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            href: "/builder/new",
            title: "New blank site",
            body: "Open the canvas with no sections yet. Add from the library panel.",
          },
          {
            href: "/templates",
            title: "From template",
            body: "Pick a curated start. The builder loads it pre-composed.",
          },
          {
            href: "/styleguide",
            title: "Edit style guide",
            body: "Set tokens before composing so every section adapts on insert.",
          },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) hover:border-(--chrome-border-strong) p-5 transition-colors"
          >
            <h3 className="font-[family-name:var(--chrome-font-display)] text-[18px] text-(--chrome-fg)">
              {c.title}
            </h3>
            <p className="mt-2 text-[13px] text-(--chrome-fg-muted)">{c.body}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        <div className="rounded-(--chrome-radius-card) border border-dashed border-(--chrome-border) p-8 text-center">
          <p className="font-[family-name:var(--chrome-font-display)] text-[20px] text-(--chrome-fg)">
            Editor — Phase B
          </p>
          <p className="mt-2 text-[13px] text-(--chrome-fg-muted) max-w-[520px] mx-auto">
            Three-panel layout (library / canvas / inspector), drag-and-drop
            section insertion, per-section props + motion controls, autosaved
            project state in Postgres.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
