// Logic: Public home page rendering club hero banner, recent articles, tag filters, and organization schema.
// Input: Server request context.
// Output: Server-rendered public landing page (ISR revalidate 60s).

import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getPosts, getTags } from '@/lib/api';
import { Tag } from '@/lib/types';

export const revalidate = 60;

export default async function HomePage() {
  let postsData;
  let tags: Tag[] = [];

  try {
    [postsData, tags] = await Promise.all([
      getPosts({ page: 1, limit: 9 }),
      getTags(),
    ]);
  } catch (err) {
    postsData = { items: [], total: 0, page: 1, limit: 9, total_pages: 1 };
  }

  const posts = postsData.items;

  // JSON-LD Organization Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Eternal Flame Tech',
    alternateName: 'EFT Club',
    url: 'https://blog.eft.io.vn',
    logo: 'https://blog.eft.io.vn/logo.png',
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
              href="#about"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-all"
            >
              Về Câu lạc bộ EFT
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div id="articles" className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        {/* Tags filter bar */}
        {tags.length > 0 && (
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
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="rounded-full border border-zinc-850 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400 hover:border-violet-500/40 hover:text-white transition-colors"
              >
                #{tag.name} {tag.post_count ? `(${tag.post_count})` : ''}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* About Club Section */}
        <section id="about" className="mt-24 rounded-3xl border border-zinc-800 bg-zinc-925 p-8 sm:p-12">
          <div className="max-w-3xl">
            <div className="text-xs font-mono uppercase tracking-wider text-violet-400 mb-2">
              Giới Thiệu
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
              Câu Lạc Bộ Eternal Flame Tech (EFT)
            </h2>
            <p className="text-zinc-300 leading-relaxed mb-6">
              Được thành lập bởi các học sinh đam mê công nghệ tại Trường THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ, Eternal Flame Tech hướng tới việc xây dựng một môi trường học tập, nghiên cứu và sáng tạo chất lượng cao trong lĩnh vực Trí Tuệ Nhân Tạo và Tự Động Hóa.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80">
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-4">
                <div className="font-semibold text-white text-sm mb-1">Trí Tuệ Nhân Tạo</div>
                <div className="text-xs text-zinc-400">Machine Learning, Deep Learning, Computer Vision.</div>
              </div>
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-4">
                <div className="font-semibold text-white text-sm mb-1">Robotics & IoT</div>
                <div className="text-xs text-zinc-400">Thiết kế phần cứng, lập trình vi điều khiển, cơ điện tử.</div>
              </div>
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-4">
                <div className="font-semibold text-white text-sm mb-1">Thi Đấu Học Thuật</div>
                <div className="text-xs text-zinc-400">Hội thi Tin học trẻ, Robocon, Sáng tạo Khoa học Kỹ thuật.</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
