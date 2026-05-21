import { notFound } from "next/navigation";
import { getSectionById, getAllSections } from "../../../../lib/sections.js";
import { getSectionComponent } from "../../../../library/registry.js";

export async function generateStaticParams() {
  return getAllSections().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const s = getSectionById(id);
  return {
    title: s ? `${s.name} — Preview` : "Section preview",
    robots: { index: false, follow: false },
  };
}

export default async function SectionPreviewPage({ params }) {
  const { id } = await params;
  const meta = getSectionById(id);
  if (!meta) notFound();

  const Component = getSectionComponent(id);

  if (!Component) {
    return (
      <div className="min-h-dvh grid place-items-center px-6 py-20 text-center">
        <div className="max-w-[420px]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-(--chrome-fg-subtle)">
            {meta.category}
          </p>
          <h1 className="mt-3 font-[family-name:var(--chrome-font-display)] text-[28px] leading-tight text-(--chrome-fg)">
            {meta.name}
          </h1>
          <p className="mt-3 text-[13px] text-(--chrome-fg-muted)">
            Implementation coming soon. The metadata, curation notes, and API
            shape are in place — only the component itself is pending.
          </p>
          <p className="mt-6 font-[family-name:var(--chrome-font-mono)] text-[11px] text-(--chrome-fg-subtle)">
            {meta.id}
          </p>
        </div>
      </div>
    );
  }

  return <Component />;
}
