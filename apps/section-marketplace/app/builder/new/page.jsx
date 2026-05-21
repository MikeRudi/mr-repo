import AppShell from "../../_components/AppShell.jsx";

export const metadata = {
  title: "New site — Builder — MakeReign",
};

export default async function NewBuilderPage({ searchParams }) {
  const params = (await searchParams) ?? {};
  const template = typeof params.template === "string" ? params.template : null;

  return (
    <AppShell active="/builder">
      <section className="mx-auto max-w-[1200px] px-6 pt-12 pb-6">
        <p className="text-[12px] uppercase tracking-[0.18em] text-(--chrome-fg-subtle)">
          New site
        </p>
        <h1 className="mt-2 font-[family-name:var(--chrome-font-display)] text-[40px] leading-tight text-(--chrome-fg)">
          {template ? `Starting from "${template}"` : "Blank canvas"}
        </h1>
        <p className="mt-2 text-[14px] text-(--chrome-fg-muted) max-w-[600px]">
          Phase B will open the three-panel editor here, pre-populated
          {template ? " with the chosen template." : " with no sections."}
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        <div className="grid grid-cols-[260px_1fr_320px] gap-4 h-[560px]">
          <div className="rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-(--chrome-fg-subtle)">
              Library
            </p>
            <p className="mt-2 text-[12px] text-(--chrome-fg-muted)">
              Filter + drag sections onto the canvas.
            </p>
          </div>
          <div className="rounded-(--chrome-radius-card) bg-(--chrome-ground) border border-dashed border-(--chrome-border) grid place-items-center text-(--chrome-fg-disabled)">
            <span className="font-[family-name:var(--chrome-font-mono)] text-xs">
              canvas
            </span>
          </div>
          <div className="rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-(--chrome-fg-subtle)">
              Inspector
            </p>
            <p className="mt-2 text-[12px] text-(--chrome-fg-muted)">
              Per-section props, tokens, motion.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
