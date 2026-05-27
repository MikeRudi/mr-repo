import BuilderShell from "./_components/BuilderShell.jsx";
import { getAllSections } from "../../../lib/sections.js";
import { listActiveSubmittedSections } from "../../../lib/section-submissions.js";

export default async function NewBuilderPage({ searchParams }) {
  const params = (await searchParams) ?? {};
  const template = typeof params.template === "string" ? params.template : null;
  const submittedSections = await listActiveSubmittedSections();
  const sections = mergeSections(getAllSections(), submittedSections);

  return (
    <BuilderShell
      initialSections={sections}
      initialTemplate={template}
    />
  );
}

function mergeSections(staticSections, submittedSections) {
  const byId = new Map(staticSections.map((section) => [section.id, section]));
  for (const section of submittedSections) {
    byId.set(section.id, section);
  }
  return [...byId.values()];
}
