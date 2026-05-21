import BuilderShell from "./_components/BuilderShell.jsx";
import { getAllSections } from "../../../lib/sections.js";

export default async function NewBuilderPage({ searchParams }) {
  const params = (await searchParams) ?? {};
  const template = typeof params.template === "string" ? params.template : null;

  return (
    <BuilderShell
      initialSections={getAllSections()}
      initialTemplate={template}
    />
  );
}
