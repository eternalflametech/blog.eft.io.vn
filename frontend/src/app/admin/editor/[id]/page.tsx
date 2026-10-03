// Logic: Authoring page for editing existing blog posts.
// Input: Path parameter containing post UUID.
// Output: Hydrated MarkdownEditor with existing post details.

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import { adminGetPost } from '@/lib/api';
import { PostWithDetails } from '@/lib/types';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetPost(id)
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Lỗi tải thông tin bài viết');
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center text-zinc-500 font-mono text-sm">
        Đang nạp bài viết để chỉnh sửa...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center px-4">
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-6 max-w-md">
          <p className="text-sm text-rose-300 mb-4">{error || 'Không tìm thấy bài viết'}</p>
          <button
            onClick={() => router.push('/admin/posts')}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
          >
            ← Quay lại danh sách bài viết
          </button>
        </div>
      </div>
    );
  }

  return <MarkdownEditor initialPost={post} />;
}
