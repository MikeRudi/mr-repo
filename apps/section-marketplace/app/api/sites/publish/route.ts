import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const siteData = await req.json();
    const { pages, tokens, styleGuideId } = siteData;

    // Generate a unique site ID
    const siteId = Math.random().toString(36).slice(2, 10);

    // Store the site data to a JSON file
    const siteDataPath = path.join(process.cwd(), 'public', 'sites', `${siteId}.json`);
    
    // Ensure directory exists
    const siteDir = path.join(process.cwd(), 'public', 'sites');
    if (!fs.existsSync(siteDir)) {
      fs.mkdirSync(siteDir, { recursive: true });
    }
    
    // Write site data to file
    fs.writeFileSync(siteDataPath, JSON.stringify({ pages, tokens, styleGuideId }, null, 2));

    // Generate the URL
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const url = `${baseUrl}/site/${siteId}`;

    return NextResponse.json({
      success: true,
      siteId,
      url,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish site' },
      { status: 500 }
    );
  }
}
