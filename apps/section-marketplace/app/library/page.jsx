import AppShell from "../_components/AppShell.jsx";
import FilterPills from "../_components/FilterPills.jsx";
import SectionCard from "../_components/SectionCard.jsx";
import ActivateSubmissionButton from "./ActivateSubmissionButton.jsx";
import BuildModeActions from "./BuildModeActions.jsx";
import {
  filterSections,
  getAllSections,
  listCategories,
  listLifecycles,
  listTracks,
} from "../../lib/sections.js";
import { listActiveSubmittedSections, listSectionSubmissions } from "../../lib/section-submissions.js";

export const metadata = {
  title: "Library — MakeReign",
};

export default async function LibraryPage({ searchParams }) {
  const params = (await searchParams) ?? {};
  const category = typeof params.category === "string" ? params.category : undefined;
  const track = typeof params.track === "string" ? params.track : undefined;
  const lifecycle = typeof params.lifecycle === "string" ? params.lifecycle : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;

  const staticSections = filterSections({ category, track, lifecycle, q });
  const activeSubmittedSections = await listActiveSubmittedSections();
  const submittedSections = filterSubmittedSections(activeSubmittedSections, { category, track, lifecycle, q });
  const sections = mergeSections(staticSections, submittedSections);
  const facets = {
    categories: [...new Set([...listCategories(), ...activeSubmittedSections.map((s) => s.category)])].sort(),
    tracks: [...new Set([...listTracks(), ...activeSubmittedSections.map((s) => s.track)])].sort(),
    lifecycles: [...new Set([...listLifecycles(), ...activeSubmittedSections.map((s) => s.lifecycle)])].sort(),
  };
  const total = mergeSections(getAllSections(), activeSubmittedSections).length;
  const submissions = await listSectionSubmissions();

  return (
    <AppShell active="/library">
      <section className="mx-auto max-w-[1200px] px-8 pt-12 pb-6">
        <div className="flex flex-col items-start gap-5">
          <BuildModeActions />
          <p className="app-eyebrow">
            Browse
          </p>
          <h1 className="app-title">
            Section library
          </h1>
          <p className="app-text">
            {sections.length} of {total} sections
            {category ? ` in ${category}` : ""}
            {track ? ` · ${track}` : ""}
            {lifecycle ? ` · ${lifecycle}` : ""}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] border-y border-(--chrome-border) bg-(--chrome-ground) px-8 py-6">
        <FilterPills facets={facets} />
      </section>

      <section className="mx-auto max-w-[1200px] px-8 py-10">
        {sections.length === 0 ? (
          <p className="app-text">No sections match these filters.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map((s) => (
              <li key={s.id}>
                <SectionCard section={s} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {submissions.length > 0 ? (
        <section className="mx-auto max-w-[1200px] px-8 pb-12">
          <div className="border-t border-[var(--chrome-border)] pt-8">
            <p className="app-eyebrow">Review queue</p>
            <h2 className="mt-2 text-[20px] font-medium text-[var(--chrome-fg)]">
              Submitted sections
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {submissions.map((submission) => (
                <li
                  key={submission.id}
                  className="app-panel flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-medium text-[var(--chrome-fg)]">
                      {submission.name}
                    </p>
                    <p
                      className="mt-1 truncate text-[16px] text-[var(--chrome-fg-muted)]"
                      style={{ textTransform: "none", letterSpacing: "normal" }}
                    >
                      {submission.section_id}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="app-label-button" aria-selected="true">
                      {submission.status}
                    </span>
                    <ActivateSubmissionButton
                      submissionId={submission.id}
                      initialStatus={submission.status}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}

function filterSubmittedSections(sections, { category, track, lifecycle, q } = {}) {
  return sections.filter((s) => {
    if (category && s.category !== category) return false;
    if (track && s.track !== track) return false;
    if (lifecycle && s.lifecycle !== lifecycle) return false;
    if (q) {
      const needle = q.toLowerCase();
      const haystack = [
        s.name,
        s.id,
        s.description ?? "",
        ...(s.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}

function mergeSections(staticSections, submittedSections) {
  const byId = new Map(staticSections.map((section) => [section.id, section]));
  for (const section of submittedSections) {
    byId.set(section.id, section);
  }
  return [...byId.values()];
}
