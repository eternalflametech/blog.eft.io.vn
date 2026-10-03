// Logic: Administrator shell layout with navigation controls and session termination.
// Input: Child React nodes and route pathname.
// Output: Protected admin interface shell.

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, Image as ImageIcon, LogOut, PenTool, Share2 } from 'lucide-react';
import { logout } from '@/lib/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Admin Subheader Bar */}
      <div className="border-b border-zinc-800 bg-zinc-925 px-4 sm:px-8 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              EFT Admin Portal
            </span>

            <nav className="flex items-center gap-1 sm:gap-2 text-xs">
              <Link
                href="/admin/posts"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/admin/posts'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Bài viết
              </Link>
              <Link
                href="/admin/editor"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/admin/editor'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <PenTool className="h-3.5 w-3.5" />
                Viết bài mới
              </Link>
              <Link
                href="/admin/assets"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/admin/assets'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Tài nguyên
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              Xem trang chủ
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}
