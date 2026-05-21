import seed from "../library/sections-seed.json";

const SECTIONS = Object.freeze(seed.sections.slice());

export function getAllSections() {
  return SECTIONS;
}

export function getSectionById(id) {
  return SECTIONS.find((s) => s.id === id) ?? null;
}

export function listCategories() {
  return [...new Set(SECTIONS.map((s) => s.category))].sort();
}

export function listTracks() {
  return [...new Set(SECTIONS.map((s) => s.track))].sort();
}

export function listLifecycles() {
  return [...new Set(SECTIONS.map((s) => s.lifecycle))].sort();
}

export function filterSections({ category, track, lifecycle, q } = {}) {
  return SECTIONS.filter((s) => {
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
        s.curation?.intent ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}
