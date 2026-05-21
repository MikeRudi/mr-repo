import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "../../_components/AppShell.jsx";
import Chip from "../../_components/Chip.jsx";
import LifecycleBadge from "../../_components/LifecycleBadge.jsx";
import TrackBadge from "../../_components/TrackBadge.jsx";
import { getAllSections, getSectionById } from "../../../lib/sections.js";

export async function generateStaticParams() {
  return getAllSections().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const s = getSectionById(id);
  return { title: s ? `${s.name} — Library — MakeReign` : "Section — MakeReign" };
}

function Spec({ label, children }) {
  if (children == null || (Array.isArray(children) && children.length === 0)) return null;
  return (
    <div className="flex items-start gap-4 py-3 border-b border-(--chrome-border)">
      <dt className="w-[160px] shrink-0 text-[12px] uppercase tracking-[0.08em] text-(--chrome-fg-subtle)">
        {label}
      </dt>
      <dd className="text-[13px] text-(--chrome-fg) leading-relaxed">{children}</dd>
    </div>
  );
}

export default async function SectionDetailPage({ params }) {
  const { id } = await params;
  const s = getSectionById(id);
  if (!s) notFound();

  return (
    <AppShell active="/library">
      <section className="mx-auto max-w-[1200px] px-6 pt-10 pb-6">
        <p className="text-[12px] uppercase tracking-[0.08em] text-(--chrome-fg-muted)">
          <Link href="/library" className="hover:text-(--chrome-fg)">Library</Link>
          <span className="mx-2 text-(--chrome-fg-subtle)">/</span>
          <span className="text-(--chrome-fg)">{s.category}</span>
          <span className="mx-2 text-(--chrome-fg-subtle)">/</span>
          <span className="text-(--chrome-fg)">{s.id}</span>
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Chip>{s.category}</Chip>
          <TrackBadge track={s.track} />
          <LifecycleBadge lifecycle={s.lifecycle} />
        </div>
        <h1 className="mt-3 font-[family-name:var(--chrome-font-display)] text-[44px] leading-tight text-(--chrome-fg)">
          {s.name}
        </h1>
        <p className="mt-3 max-w-[680px] text-[14px] text-(--chrome-fg-muted) leading-relaxed">
          {s.description}
        </p>
        <div className="mt-6 inline-flex items-center gap-3 px-4 h-10 rounded-(--chrome-radius-pill) bg-(--chrome-fg) text-(--chrome-fg-inverse) font-[family-name:var(--chrome-font-mono)] text-[12px]">
          <span className="text-(--chrome-fg-inverse)/60">$</span>
          mr add {s.id}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <div className="aspect-[16/9] rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) grid place-items-center text-(--chrome-fg-disabled)">
            <span className="font-[family-name:var(--chrome-font-mono)] text-xs">
              preview · {s.id}
            </span>
          </div>
          {s.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {s.tags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          ) : null}
          {s.curation ? (
            <div className="mt-10">
              <h2 className="text-[12px] uppercase tracking-[0.08em] text-(--chrome-fg-subtle)">
                Curation
              </h2>
              <dl className="mt-3">
                <Spec label="Intent">{s.curation.intent}</Spec>
                <Spec label="Pattern">{s.curation.structuralPattern}</Spec>
                <Spec label="Slots">
                  <code className="font-[family-name:var(--chrome-font-mono)] text-[12px]">
                    {s.curation.structuralSlots?.join(" · ")}
                  </code>
                </Spec>
                <Spec label="Page types">{s.curation.pageTypes?.join(", ")}</Spec>
                <Spec label="Tone">{s.curation.tonalAffordances?.join(", ")}</Spec>
                <Spec label="Density">{s.curation.visualDensity}</Spec>
                <Spec label="Imagery">{s.curation.imageryDependence}</Spec>
                <Spec label="Copy">{s.curation.copyDensity}</Spec>
                <Spec label="Pairs above">
                  {s.curation.composition?.pairsAbove?.join(", ")}
                </Spec>
                <Spec label="Pairs below">
                  {s.curation.composition?.pairsBelow?.join(", ")}
                </Spec>
                <Spec label="Anti pairs">
                  {s.curation.composition?.antiPairs?.join(", ")}
                </Spec>
              </dl>
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-20 self-start">
          <div className="rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) p-5">
            <h2 className="text-[12px] uppercase tracking-[0.08em] text-(--chrome-fg-subtle)">
              Specs
            </h2>
            <dl className="mt-2">
              <Spec label="ID">
                <code className="font-[family-name:var(--chrome-font-mono)] text-[12px]">
                  {s.id}
                </code>
              </Spec>
              <Spec label="Version">v{s.version}</Spec>
              <Spec label="Motion">{s.motionDensity?.join(", ") || "none"}</Spec>
              <Spec label="Responsive">{s.responsive?.profile}</Spec>
              <Spec label="Created">{s.created}</Spec>
              <Spec label="Updated">{s.updated}</Spec>
              <Spec label="Submitted by">{s.submittedBy}</Spec>
              <Spec label="Dependencies">
                <ul className="space-y-1">
                  {(s.dependencies ?? []).map((d) => (
                    <li
                      key={d}
                      className="font-[family-name:var(--chrome-font-mono)] text-[11px] text-(--chrome-fg-muted)"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              </Spec>
            </dl>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
