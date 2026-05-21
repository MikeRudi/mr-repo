import { getSectionComponent } from "../../../library/registry.js";
import { generateCss } from "../../../lib/styleguide-css.js";
import { DEFAULT_TOKENS } from "../../../lib/styleguide-defaults.js";
import fs from "fs";
import path from "path";

async function getSiteData(siteId: string) {
  try {
    const siteDataPath = path.join(process.cwd(), "public", "sites", `${siteId}.json`);
    if (fs.existsSync(siteDataPath)) {
      const data = fs.readFileSync(siteDataPath, "utf-8");
      return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
}

export default async function PublishedSite({ params }: { params: { siteId: string } }) {
  const siteData = await getSiteData(params.siteId);

  if (!siteData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <p>Site not found</p>
      </div>
    );
  }

  const activePage = siteData.pages[0];
  const canvasCss = generateCss(siteData.tokens);

  const isNav = (sectionId: string) => sectionId.includes("navigation");

  const navSections = activePage.sections.filter((s) => isNav(s.sectionId));
  const contentSections = activePage.sections.filter((s) => !isNav(s.sectionId));

  return (
    <div className="min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: canvasCss }} />
      <style>{`
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>

      {/* Nav sections */}
      {navSections.map((inst) => {
        const Component = getSectionComponent(inst.sectionId);
        return Component ? (
          <Component key={inst.id} {...inst.props} />
        ) : null;
      })}

      {/* Content sections */}
      {contentSections.map((inst) => {
        const Component = getSectionComponent(inst.sectionId);
        return Component ? (
          <Component key={inst.id} {...inst.props} />
        ) : null;
      })}

      {activePage.sections.length === 0 && (
        <div className="flex items-center justify-center min-h-screen text-gray-500">
          <p>This site has no content yet</p>
        </div>
      )}
    </div>
  );
}
