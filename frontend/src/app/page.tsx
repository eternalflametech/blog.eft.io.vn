// Logic: Public home page rendering club hero banner, recent articles with 20-post pagination, tag filters, and organization schema.
// Input: Server request context and searchParams with page.
// Output: Server-rendered public landing page (ISR revalidate 60s).

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import Pagination from '@/components/Pagination';
import PostCard from '@/components/PostCard';
import { getPosts, getTags } from '@/lib/api';
import { Tag } from '@/lib/types';

export const revalidate = 60;

interface HomePageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10) || 1);
  const limit = 20;

  let postsData;
  let tags: Tag[] = [];

  try {
    [postsData, tags] = await Promise.all([
      getPosts({ page: currentPage, limit }),
      getTags(),
    ]);
  } catch {
    postsData = { items: [], total: 0, page: currentPage, limit, total_pages: 1 };
  }

  const posts = postsData.items;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.eft.io.vn';

  // JSON-LD Organization Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Eternal Flame Tech',
    alternateName: 'EFT Club',
    url: siteUrl,
    logo: `${siteUrl}/logo.jpg`,
    description:
      'Câu lạc bộ Trí Tuệ Nhân Tạo & Robotics chính thức của Trường THPT Chuyên Nguyễn Thị Minh Khai, TP. Cần Thơ.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cần Thơ',
      addressCountry: 'VN',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-900 bg-gradient-to-b from-zinc-950 via-zinc-925 to-zinc-950 py-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/10 px-3.5 py-1 text-xs font-semibold text-violet-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI & Robotics Club • Chuyên Nguyễn Thị Minh Khai
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Thắp Sáng Đam Mê{' '}
            <span className="bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent">
              Trí Tuệ Nhân Tạo
            </span>{' '}
            & Robotics
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-400 mb-8 leading-relaxed">
            Nơi hội tụ những ý tưởng đột phá, các dự án nghiên cứu khoa học kỹ thuật và chia sẻ kinh nghiệm học thuật từ Câu lạc bộ Eternal Flame Tech.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#articles"
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
            >
              Đọc bài viết mới nhất
            </a>
            <a
              href="https://eft.io.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-300 hover:border-violet-500/40 hover:text-white transition-all"
            >
              <span>Ghé thăm Cổng EFT</span>
              <ExternalLink className="h-4 w-4 opacity-70" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div id="articles" className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        {/* Tags filter bar */}
        {tags.filter((t) => (t.post_count ?? 0) > 0).length > 0 && (
          <div className="mb-10 flex flex-wrap items-center gap-2 border-b border-zinc-900 pb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 mr-2">
              Chủ đề:
            </span>
            <Link
              href="/"
              className="rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white transition-colors"
            >
              Tất cả
            </Link>
            {tags
              .filter((t) => (t.post_count ?? 0) > 0)
              .map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="rounded-full border border-zinc-850 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400 hover:border-violet-500/40 hover:text-white transition-colors"
                >
                  #{tag.name} ({tag.post_count})
                </Link>
              ))}
          </div>
        )}

        {/* Posts Grid */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Bài Viết Mới Xuất Bản
          </h2>
          <span className="text-xs font-mono text-zinc-400">
            Tổng cộng: {postsData.total} bài viết
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-400">
            Hiện tại chưa có bài viết nào được xuất bản. Vui lòng quay lại sau!
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={postsData.total_pages}
              basePath="/"
              anchor="articles"
            />
          </>
        )}


      </div>
    </>
  );
}
