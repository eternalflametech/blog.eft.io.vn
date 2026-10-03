// Logic: Auto-generates standard RSS 2.0 XML feed for web syndication readers.
// Input: Public published posts from backend.
// Output: XML response with application/xml MIME type.

import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/api';
import { PostListItem } from '@/lib/types';

export const revalidate = 300;

export async function GET() {
  const siteUrl = 'https://blog.eft.io.vn';
  let posts: PostListItem[] = [];

  try {
    const res = await getPosts({ limit: 50 });
    posts = res.items || [];
  } catch {
    posts = [];
  }

  const rssItems = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
      <author><![CDATA[${post.author_name}]]></author>
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Eternal Flame Tech Blog</title>
    <link>${siteUrl}</link>
    <description>Trí Tuệ Nhân Tạo &amp; Robotics - CLB Eternal Flame Tech, THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
