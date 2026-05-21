import { NextRequest } from 'next/server';
import { getSectionComponent } from "../../../library/registry.js";
import { generateCss } from "../../../lib/styleguide-css.js";
import { DEFAULT_TOKENS } from "../../../lib/styleguide-defaults.js";
import { getSiteData as getSiteDataFromApi } from "../../api/sites/publish/route";

// Note: In a real implementation, this would fetch from a database
// For now, we'll use the in-memory storage from the API route
// This won't persist across redeployments - use a database for production
let sitesCache = new Map<string, any>();

// This is a workaround for the serverless environment
// In production, use a proper database (Vercel Postgres, Vercel KV, etc.)
export async function GET(req: NextRequest, { params }: { params: { siteId: string } }) {
  const siteData = sitesCache.get(params.siteId);
  
  if (!siteData) {
    return new Response('Site not found', { status: 404 });
  }

  return new Response(JSON.stringify(siteData), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function PublishedSite({ params }: { params: { siteId: string } }) {
  // Try to get from cache first, then fallback to default
  const siteData = sitesCache.get(params.siteId) || {
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "/",
        sections: [],
      },
    ],
    tokens: DEFAULT_TOKENS,
    styleGuideId: null,
  };

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

// Export a function to update the cache (called from the API route)
export function updateSiteCache(siteId: string, data: any) {
  sitesCache.set(siteId, data);
}
