// Logic: Auto-generated robots.txt allowing search crawlers while disallowing admin routes.
// Input: None.
// Output: Plaintext robots.txt response.

import { NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api/v2/admin/*

Sitemap: https://blog.eft.io.vn/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
