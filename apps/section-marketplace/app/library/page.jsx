import AppShell from "../_components/AppShell.jsx";
import FilterPills from "../_components/FilterPills.jsx";
import SectionCard from "../_components/SectionCard.jsx";
import {
  filterSections,
  getAllSections,
  listCategories,
  listLifecycles,
  listTracks,
} from "../../lib/sections.js";

export const metadata = {
  title: "Library — MakeReign",
};

export default async function LibraryPage({ searchParams }) {
  const params = (await searchParams) ?? {};
  const category = typeof params.category === "string" ? params.category : undefined;
  const track = typeof params.track === "string" ? params.track : undefined;
  const lifecycle = typeof params.lifecycle === "string" ? params.lifecycle : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;

  const sections = filterSections({ category, track, lifecycle, q });
  const facets = {
    categories: listCategories(),
    tracks: listTracks(),
    lifecycles: listLifecycles(),
  };
  const total = getAllSections().length;

  return (
    <AppShell active="/library">
      <section className="mx-auto max-w-[1200px] px-8 pt-12 pb-6">
        <p className="app-eyebrow">
          Browse
        </p>
        <h1 className="app-title mt-2">
          Section library
        </h1>
        <p className="app-text mt-2">
          {sections.length} of {total} sections
          {category ? ` in ${category}` : ""}
          {track ? ` · ${track}` : ""}
          {lifecycle ? ` · ${lifecycle}` : ""}
        </p>
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
    </AppShell>
  );
}
