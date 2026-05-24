import Link from "next/link";
import AppShell from "../_components/AppShell.jsx";
import Chip from "../_components/Chip.jsx";
import { getAllTemplates } from "../../lib/templates.js";

export const metadata = {
  title: "Templates — MakeReign",
};

export default function TemplatesPage() {
  // Only show real templates with a renderable preview route. The "blank"
  // pseudo-template is just an empty builder, not a template — hide it here
  // and surface it from the homepage instead.
  const templates = getAllTemplates().filter((t) => Boolean(t.renderRoute));
  return (
    <AppShell active="/templates">
      <section className="mx-auto max-w-[1200px] px-6 pt-12 pb-6">
        <p className="text-[12px] uppercase tracking-[0.18em] text-(--chrome-fg-subtle)">
          Start from a preset
        </p>
        <h1 className="mt-2 font-[family-name:var(--chrome-font-display)] text-[44px] leading-tight text-(--chrome-fg)">
          Templates
        </h1>
        <p className="mt-2 text-[14px] text-(--chrome-fg-muted) max-w-[600px]">
          Curated full-page starts. Open one to preview, then duplicate it
          into the builder to edit.
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-10">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((t) => {
            const previewable = !!t.renderRoute;
            return (
              <li key={t.slug}>
                <div className="flex flex-col h-full rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) overflow-hidden">
                  <div className="aspect-[16/10] bg-(--chrome-surface-muted) border-b border-(--chrome-border) grid place-items-center text-(--chrome-fg-disabled)">
                    <span className="font-[family-name:var(--chrome-font-mono)] text-xs">
                      {t.slug}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between">
                      <Chip>{t.category}</Chip>
                      <span className="text-[11px] text-(--chrome-fg-subtle) font-[family-name:var(--chrome-font-mono)]">
                        v{t.version}
                      </span>
                    </div>
                    <h2 className="font-[family-name:var(--chrome-font-display)] text-[20px] leading-tight text-(--chrome-fg)">
                      {t.name}
                    </h2>
                    <p className="text-[13px] text-(--chrome-fg-muted) leading-relaxed">
                      {t.summary}
                    </p>
                    <div className="mt-auto pt-3 flex items-center gap-2">
                      {previewable ? (
                        <Link
                          href={t.renderRoute}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-chrome"
                        >
                          Preview live
                        </Link>
                      ) : null}
                      {/* Use template is gated on item 4.5 — disabled for now. */}
                      <span
                        aria-disabled="true"
                        title="Coming soon"
                        className="btn-chrome btn-chrome--ghost"
                      >
                        Use template
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
