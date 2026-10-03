// Logic: Article preview card component for listing views.
// Input: PostListItem object.
// Output: Semantic article JSX card complying with EFT dark theme tokens.

import Image from 'next/image';
import Link from 'next/link';
import { PostListItem } from '@/lib/types';
import { estimateReadingTime, formatDate } from '@/lib/utils';

export default function PostCard({ post }: { post: PostListItem }) {
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-zinc-850 bg-zinc-925 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-950/20">
      <div>
        {post.cover_image ? (
          <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl border border-zinc-800">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="relative mb-4 flex h-36 w-full items-center justify-between rounded-xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
            <div className="text-xs font-mono uppercase tracking-wider text-violet-400">
              EFT Article
            </div>
            <div className="h-8 w-8 rounded-full border border-violet-500/30 bg-violet-600/10 flex items-center justify-center text-xs font-bold text-violet-400">
              AI
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="rounded-full border border-violet-500/20 bg-violet-950/30 px-2.5 py-0.5 text-xs font-medium text-violet-300 hover:border-violet-500/50 transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors line-clamp-2">
          <Link href={`/${post.slug}`}>{post.title}</Link>
        </h2>

        <p className="mt-2.5 text-sm text-zinc-400 line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-850 pt-4 text-xs text-zinc-400 font-mono">
        <div>{post.author_name}</div>
        <div className="flex items-center gap-2">
          <time dateTime={post.published_at || post.created_at}>
            {formatDate(post.published_at || post.created_at)}
          </time>
          <span>•</span>
          <span>{estimateReadingTime(post.excerpt)}</span>
        </div>
      </div>
    </article>
  );
}
