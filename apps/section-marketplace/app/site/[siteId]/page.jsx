import { notFound } from "next/navigation";
import { getSectionComponent } from "../../../library/registry.js";
import { generateCss } from "../../../lib/styleguide-css.js";
import { sql } from "../../../lib/db.js";

export const dynamic = "force-dynamic";

async function loadSite(siteId) {
  try {
    const rows = await sql`SELECT data FROM sites WHERE id = ${siteId} LIMIT 1`;
    if (!rows || rows.length === 0) return null;
    return rows[0].data;
  } catch (err) {
    console.error("Failed to load site:", err);
    return null;
  }
}

function isNav(sectionId) {
  return typeof sectionId === "string" && sectionId.includes("navigation");
}

export default async function PublishedSite({ params }) {
  const { siteId } = await params;
  const site = await loadSite(siteId);

  if (!site) notFound();

  const activePage = site.pages?.[0];
  if (!activePage) notFound();

  const canvasCss = generateCss(site.tokens ?? {});
  const sections = activePage.sections ?? [];
  const navSections = sections.filter((s) => isNav(s.sectionId));
  const contentSections = sections.filter((s) => !isNav(s.sectionId));

  return (
    <div className="min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: canvasCss }} />
      {navSections.map((inst) => {
        const Component = getSectionComponent(inst.sectionId);
        return Component ? <Component key={inst.id} {...inst.props} /> : null;
      })}
      {contentSections.map((inst) => {
        const Component = getSectionComponent(inst.sectionId);
        return Component ? <Component key={inst.id} {...inst.props} /> : null;
      })}
      {sections.length === 0 && (
        <div className="flex items-center justify-center min-h-screen text-gray-500">
          <p>This site has no content yet</p>
        </div>
      )}
    </div>
  );
}
