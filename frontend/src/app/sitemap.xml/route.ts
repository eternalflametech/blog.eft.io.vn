// Logic: Dynamic XML Sitemap generation complying with sitemaps.org and Google Image Sitemap standards.
// Input: Published post entries and tag records.
// Output: Valid XML Sitemap with lastmod, changefreq, priority, and image metadata.

import { NextResponse } from 'next/server';
import { getPosts, getTags } from '@/lib/api';
import { PostListItem, Tag } from '@/lib/types';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.eft.io.vn';
  const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://backend:8080';
  let posts: PostListItem[] = [];
  let tags: Tag[] = [];

  try {
    const [postsRes, tagsRes] = await Promise.all([
      fetch(`${backendUrl}/api/v2/posts?limit=1000`, {
        cache: 'no-store',
      }).then((r) => (r.ok ? r.json() : { items: [] })),
      getTags(),
    ]);
    posts = postsRes.items || [];
    tags = tagsRes || [];
  } catch {
    // Graceful fallback on network glitch
  }

  const staticUrls = [
    `<url>
      <loc>${siteUrl}/</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>`,
  ];

  const postUrls = posts.map((post) => {
    const lastModDate = new Date(post.published_at || post.created_at).toISOString();
    let imageXml = '';
    if (post.cover_image) {
      const imgUrl = post.cover_image.startsWith('http')
        ? post.cover_image
        : `${siteUrl}${post.cover_image}`;
      imageXml = `
      <image:image>
        <image:loc>${escapeXml(imgUrl)}</image:loc>
        <image:title>${escapeXml(post.title)}</image:title>
      </image:image>`;
    }

    return `<url>
      <loc>${siteUrl}/${escapeXml(post.slug)}</loc>
      <lastmod>${lastModDate}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>${imageXml}
    </url>`;
  });

  const tagUrls = tags.map(
    (tag) => `<url>
      <loc>${siteUrl}/tag/${escapeXml(tag.slug)}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`
  );

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticUrls.join('\n  ')}
  ${postUrls.join('\n  ')}
  ${tagUrls.join('\n  ')}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
