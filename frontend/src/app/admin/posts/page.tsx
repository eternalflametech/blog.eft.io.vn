// Logic: Administrator post management table displaying drafts and published articles.
// Input: API queries for administrator posts.
// Output: Interactive table with publish, edit, and delete triggers.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Plus, Send, Trash2 } from 'lucide-react';
import { adminDeletePost, adminGetPosts, adminPublishPost } from '@/lib/api';
import { PostListItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const data = await adminGetPosts();
      setPosts(data);
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePublish = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xuất bản bài viết này ngay lập tức?')) return;
    try {
      await adminPublishPost(id);
      await loadPosts();
    } catch (err: any) {
      alert(`Lỗi xuất bản: ${err.message || err}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bài viết "${title}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      await adminDeletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(`Lỗi xóa bài viết: ${err.message || err}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản Lý Bài Viết</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tổng cộng: {posts.length} bài viết (bao gồm bản nháp và bài đã xuất bản)
          </p>
        </div>

        <Link
          href="/admin/editor"
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/20"
        >
          <Plus className="h-4 w-4" />
          Viết bài mới
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500 text-sm">
          Đang tải dữ liệu bài viết...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-400">
          Chưa có bài viết nào. Hãy tạo bài viết đầu tiên ngay!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-925 shadow-xl">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-xs font-mono uppercase text-zinc-400">
              <tr>
                <th className="px-6 py-4">Tiêu đề bài viết</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Tác giả</th>
                <th className="px-6 py-4">Ngày cập nhật</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-white max-w-md">
                    <div className="truncate">{post.title}</div>
                    <div className="text-xs font-mono text-zinc-500 mt-0.5 truncate">
                      /{post.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.status === 'published' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        ● Xuất bản
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                        ○ Bản nháp
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                    {post.author_name}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                    {formatDate(post.published_at || post.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === 'published' && (
                        <Link
                          href={`/${post.slug}`}
                          target="_blank"
                          title="Xem trên trang chủ"
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                      {post.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(post.id)}
                          title="Xuất bản ngay"
                          className="p-1.5 rounded-lg border border-violet-800/50 bg-violet-950/40 text-violet-300 hover:bg-violet-900/60 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      <Link
                        href={`/admin/editor/${post.id}`}
                        title="Chỉnh sửa bài viết"
                        className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        title="Xóa bài viết"
                        className="p-1.5 rounded-lg border border-rose-900/40 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
