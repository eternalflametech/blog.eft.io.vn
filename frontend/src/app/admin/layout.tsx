// Logic: Administrator shell layout with navigation controls and session termination.
// Input: Child React nodes and route pathname.
// Output: Protected admin interface shell.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  Image as ImageIcon,
  LogOut,
  PenTool,
  Share2,
  Shield,
  Users,
} from 'lucide-react';
import { authGetMe, logout } from '@/lib/api';
import { User } from '@/lib/types';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    authGetMe().then((user) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        setCurrentUser(user);
      }
    });
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const roleBadge = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'admin') {
      return (
        <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
          Admin
        </span>
      );
    }
    if (currentUser.role === 'editor') {
      return (
        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
          Biên tập viên
        </span>
      );
    }
    return (
      <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
        Tác giả
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Admin Subheader Bar */}
      <div className="border-b border-zinc-800 bg-zinc-925 px-4 sm:px-8 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="font-bold text-sm text-white flex items-center gap-2 shrink-0">
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              EFT Admin Portal
            </span>

            <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs">
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
                Viết bài
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
              {currentUser?.role === 'admin' && (
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === '/admin/users'
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Tài khoản & Phân quyền
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                <Shield className="h-3 w-3 text-violet-400" />
                <span className="text-zinc-300 font-medium">{currentUser.name}</span>
                {roleBadge()}
              </div>
            )}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              Xem blog
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
