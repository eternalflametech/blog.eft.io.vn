// Logic: Dynamic XML Sitemap generation listing all published posts, categories, and landing routes.
// Input: Published post entries.
// Output: Valid XML Sitemap complying with sitemaps.org standards.

import { NextResponse } from 'next/server';
import { getPosts, getTags } from '@/lib/api';
import { PostListItem, Tag } from '@/lib/types';

export const revalidate = 300;

export async function GET() {
  const siteUrl = 'https://blog.eft.io.vn';
  let posts: PostListItem[] = [];
  let tags: Tag[] = [];

  try {
    const [postsRes, tagsRes] = await Promise.all([
      getPosts({ limit: 100 }),
      getTags(),
    ]);
    posts = postsRes.items || [];
    tags = tagsRes || [];
  } catch {
    // Graceful fallback
  }

  const staticUrls = [
    `<url>
      <loc>${siteUrl}</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>`,
  ];

  const postUrls = posts.map(
    (post) => `<url>
      <loc>${siteUrl}/${post.slug}</loc>
      <lastmod>${new Date(post.published_at || post.created_at).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
  );

  const tagUrls = tags.map(
    (tag) => `<url>
      <loc>${siteUrl}/tag/${tag.slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`
  );

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
