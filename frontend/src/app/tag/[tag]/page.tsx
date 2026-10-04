// Logic: Displays posts filtered by specific topic tag with 20-post pagination and SEO tags.
// Input: Page params containing tag slug and optional searchParams with page.
// Output: Rendered listing of matching articles with pagination.

import type { Metadata } from 'next';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import PostCard from '@/components/PostCard';
import { getPosts, getTags } from '@/lib/api';
import { Tag } from '@/lib/types';

export const revalidate = 60;

interface TagPageProps {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Chủ đề #${tag}`,
    description: `Khám phá các bài viết thuộc chủ đề #${tag} trên Eternal Flame Tech Blog.`,
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  const resolvedParams = searchParams ? await searchParams : {};
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10) || 1);
  const limit = 20;

  let postsData;
  let tags: Tag[] = [];

  try {
    [postsData, tags] = await Promise.all([
      getPosts({ tag, page: currentPage, limit }),
      getTags(),
    ]);
  } catch {
    postsData = { items: [], total: 0, page: currentPage, limit, total_pages: 1 };
  }

  const currentTag = tags.find((t) => t.slug === tag);
  const tagName = currentTag ? currentTag.name : tag;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <div className="mb-10 border-b border-zinc-900 pb-8">
        <Link
          href="/"
          className="text-xs font-mono text-zinc-400 hover:text-white transition-colors mb-4 inline-block"
        >
          ← Xem tất cả bài viết
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Chủ đề: <span className="text-violet-400">#{tagName}</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Tìm thấy {postsData.total} bài viết thuộc chủ đề này
        </p>
      </div>

      {postsData.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-400">
          Chưa có bài viết nào thuộc chủ đề này.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsData.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={postsData.total_pages}
            basePath={`/tag/${tag}`}
          />
        </>
      )}
    </div>
  );
}
