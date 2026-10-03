// Logic: Comprehensive administrator post management dashboard with search, status filtering, aggregate statistics, and publication controls.
// Input: Posts and aggregate system metrics.
// Output: Full-featured interactive post management UI.

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileCheck2,
  FileEdit,
  FileText,
  Filter,
  Image as ImageIcon,
  Plus,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import {
  adminDeletePost,
  adminGetPosts,
  adminGetStats,
  adminPublishPost,
} from '@/lib/api';
import { AdminStats, PostListItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [postsData, statsData] = await Promise.all([
        adminGetPosts(),
        adminGetStats().catch(() => null),
      ]);
      setPosts(postsData);
      setStats(statsData);
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xuất bản bài viết "${title}" ngay lập tức?`)) return;
    try {
      await adminPublishPost(id);
      setActionFeedback(`Đã xuất bản bài viết: ${title}`);
      await loadData();
      setTimeout(() => setActionFeedback(null), 3000);
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
      setActionFeedback(`Đã xóa bài viết: ${title}`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(`Lỗi xóa bài viết: ${err.message || err}`);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, searchQuery, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-violet-400" />
            Quản Lý Bài Viết
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Tổng quan, lọc trạng thái, tìm kiếm và phân phối xuất bản các bài viết trên EFT Blog.
          </p>
        </div>

        <Link
          href="/admin/editor"
          className="btn-primary-gradient flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-lg shadow-violet-600/20"
        >
          <Plus className="h-4 w-4" />
          Viết bài mới
        </Link>
      </div>

      {/* Aggregate Stats Cards */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-925 p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Tổng bài viết</span>
              <FileText className="h-4 w-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.total_posts}</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-925 p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Đã xuất bản</span>
              <FileCheck2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{stats.published_posts}</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-925 p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Bản nháp</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">{stats.draft_posts}</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-925 p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Tài nguyên media</span>
              <ImageIcon className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.total_assets}</div>
          </div>
        </div>
      )}

      {/* Action Feedback */}
      {actionFeedback && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs sm:text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-925 p-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết theo tiêu đề, tác giả, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              statusFilter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Tất cả ({posts.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              statusFilter === 'published'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Đã xuất bản ({posts.filter((p) => p.status === 'published').length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              statusFilter === 'draft'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Bản nháp ({posts.filter((p) => p.status === 'draft').length})
          </button>
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 text-sm">
          Đang tải dữ liệu bài viết...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-400">
          Không tìm thấy bài viết nào phù hợp với điều kiện tìm kiếm.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-925 shadow-xl">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900/60 border-b border-zinc-800 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-6 py-4">Tiêu đề bài viết</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Tác giả</th>
                <th className="px-6 py-4">Ngày cập nhật</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-white max-w-md">
                    <div className="truncate text-sm font-semibold">{post.title}</div>
                    <div className="text-xs font-mono text-zinc-500 mt-0.5 truncate">
                      /{post.slug}
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {post.tags.map((t) => (
                          <span
                            key={t.id}
                            className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800"
                          >
                            #{t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {post.status === 'published' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        ● Xuất bản
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                        ○ Bản nháp
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-zinc-300">
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
                          title="Xem trên blog"
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                      {post.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(post.id, post.title)}
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
