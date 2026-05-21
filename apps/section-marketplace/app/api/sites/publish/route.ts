import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (won't persist across serverless function invocations)
// In production, use Vercel Postgres, Vercel KV, or another database
const sites = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const siteData = await req.json();
    const { pages, tokens, styleGuideId } = siteData;

    // Generate a unique site ID
    const siteId = Math.random().toString(36).slice(2, 10);

    // Store in memory (note: this won't persist in Vercel serverless environment)
    sites.set(siteId, { pages, tokens, styleGuideId, createdAt: new Date().toISOString() });

    // Generate the URL
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const url = `${baseUrl}/site/${siteId}`;

    return NextResponse.json({
      success: true,
      siteId,
      url,
      note: 'In production, use a database for persistence',
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish site' },
      { status: 500 }
    );
  }
}

// Export the sites map so the view route can access it
export function getSiteData(siteId: string) {
  return sites.get(siteId);
}
