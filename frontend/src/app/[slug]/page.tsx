// Logic: Server-rendered article details page with full SEO metadata and JSON-LD schema (ISR revalidate 60s).
// Input: Page params containing post slug.
// Output: Structured HTML article with semantic markup.

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { getPostBySlug } from '@/lib/api';
import { estimateReadingTime, formatDate } from '@/lib/utils';

export const revalidate = 60;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// Logic: Generates contextual SEO metadata, Open Graph, and Twitter tags for search engines.
// Input: PostPageProps.
// Output: Next.js Metadata object.
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Bài Viết Không Tồn Tại',
      description: 'Không tìm thấy bài viết được yêu cầu.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.eft.io.vn';
  const canonicalUrl = `${siteUrl}/${post.slug}`;
  const ogImage = post.cover_image || `${siteUrl}/logo.jpg`;
  const tagKeywords = post.tags?.map((t) => t.name) || [];

  return {
    title: post.title,
    description: post.excerpt,
    keywords: tagKeywords,
    category: 'AI & Robotics',
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'article',
      locale: 'vi_VN',
      url: canonicalUrl,
      title: `${post.title} | Eternal Flame Tech`,
      description: post.excerpt,
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      section: 'AI & Robotics',
      tags: tagKeywords,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
      creator: '@eternalflametech',
      site: '@eternalflametech',
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.eft.io.vn';
  const canonicalUrl = `${siteUrl}/${post.slug}`;
  const readingDuration = estimateReadingTime(post.content);
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // JSON-LD Structured Data: BlogPosting & BreadcrumbList
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ? [post.cover_image] : [`${siteUrl}/logo.jpg`],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    inLanguage: 'vi-VN',
    articleSection: 'AI & Robotics',
    keywords: post.tags?.map((t) => t.name).join(', '),
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
    copyrightYear: new Date(post.published_at || post.created_at).getFullYear(),
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Eternal Flame Tech',
    },
    author: {
      '@type': 'Person',
      name: post.author_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Eternal Flame Tech',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.jpg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const jsonLdBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />

      <article className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-zinc-400 truncate max-w-[200px] sm:max-w-md">
            {post.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="mb-10 border-b border-zinc-850 pb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="rounded-full border border-violet-500/20 bg-violet-950/30 px-3 py-1 text-xs font-medium text-violet-300 hover:border-violet-500/50 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-400 font-mono">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-xs">
                {post.author_name.slice(0, 1)}
              </div>
              <span className="text-zinc-200">{post.author_name}</span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <time dateTime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at)}
              </time>
              <span>•</span>
              <span>{readingDuration}</span>
            </div>
          </div>

          {post.cover_image && (
            <div className="relative mt-8 h-[380px] w-full overflow-hidden rounded-2xl border border-zinc-800">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="py-2">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Article Footer & Return Link */}
        <footer className="mt-16 border-t border-zinc-850 pt-8 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          >
            ← Quay lại trang chủ
          </Link>
          <div className="text-xs font-mono text-zinc-400">
            Eternal Flame Tech • THPT Chuyên Nguyễn Thị Minh Khai
          </div>
        </footer>
      </article>
    </>
  );
}
