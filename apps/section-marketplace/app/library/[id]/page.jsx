import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "../../_components/AppShell.jsx";
import Chip from "../../_components/Chip.jsx";
import LifecycleBadge from "../../_components/LifecycleBadge.jsx";
import TrackBadge from "../../_components/TrackBadge.jsx";
import { getAllSections, getSectionById } from "../../../lib/sections.js";
import { hasImplementation } from "../../../library/registry.js";

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
      <dt className="app-eyebrow w-[160px] shrink-0">
        {label}
      </dt>
      <dd className="text-[16px] leading-relaxed text-(--chrome-fg)">{children}</dd>
    </div>
  );
}

export default async function SectionDetailPage({ params }) {
  const { id } = await params;
  const s = getSectionById(id);
  if (!s) notFound();

  return (
    <AppShell active="/library">
      <section className="mx-auto max-w-[1200px] px-8 pb-6 pt-10">
        <p className="app-eyebrow">
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
        <h1 className="app-title mt-3">
          {s.name}
        </h1>
        <p className="app-text mt-3 max-w-[680px]">
          {s.description}
        </p>
        <div className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-[0.25rem] border border-(--chrome-fg) bg-(--chrome-fg) px-4 font-[family-name:var(--chrome-font-mono)] text-[16px] text-(--chrome-fg-inverse)">
          <span className="text-(--chrome-fg-inverse)/60">$</span>
          mr add {s.id}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-8 pb-16 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="overflow-hidden rounded-[0.25rem] border border-(--chrome-border) bg-(--chrome-surface)">
            <div className="flex min-h-12 items-center justify-between border-b border-(--chrome-border) bg-(--chrome-ground) px-4">
              <p className="font-[family-name:var(--chrome-font-mono)] text-[16px] text-(--chrome-fg-subtle)">
                preview · {s.id}
              </p>
              <a
                href={`/sections/${s.id}/preview`}
                target="_blank"
                rel="noreferrer"
                className="text-[16px] text-(--chrome-fg-muted) hover:text-(--chrome-fg)"
              >
                Open in new tab ↗
              </a>
            </div>
            {hasImplementation(s.id) ? (
              <iframe
                src={`/sections/${s.id}/preview`}
                title={`${s.name} preview`}
                loading="lazy"
                className="w-full h-[680px] bg-(--chrome-ground)"
              />
            ) : (
              <div className="aspect-[16/9] grid place-items-center text-center px-6 text-(--chrome-fg-muted)">
                <div>
                  <p className="text-[16px]">Implementation coming soon.</p>
                  <p className="mt-1 text-[16px] text-(--chrome-fg-subtle)">
                    Metadata, curation notes and API are in place.
                  </p>
                </div>
              </div>
            )}
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
              <h2 className="app-subtitle">
                Curation
              </h2>
              <dl className="mt-3">
                <Spec label="Intent">{s.curation.intent}</Spec>
                <Spec label="Pattern">{s.curation.structuralPattern}</Spec>
                <Spec label="Slots">
                  <code className="font-[family-name:var(--chrome-font-mono)] text-[16px]">
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
          <div className="app-panel p-5">
            <h2 className="app-subtitle">
              Specs
            </h2>
            <dl className="mt-2">
              <Spec label="ID">
                <code className="font-[family-name:var(--chrome-font-mono)] text-[16px]">
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
                      className="font-[family-name:var(--chrome-font-mono)] text-[16px] text-(--chrome-fg-muted)"
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
