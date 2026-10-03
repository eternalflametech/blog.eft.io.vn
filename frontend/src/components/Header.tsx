// Logic: Public navigation header with club branding and quick navigation links.
// Input: Active path state.
// Output: Semantic JSX header.

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-violet-500/20 group-hover:border-violet-500/50 transition-colors">
            <Image
              src="/logo.png"
              alt="Eternal Flame Tech Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white group-hover:text-violet-400 transition-colors">
              Eternal Flame Tech
            </div>
            <div className="text-xs text-zinc-400 hidden sm:block">
              AI & Robotics • THPT Chuyên Nguyễn Thị Minh Khai
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link
            href="/"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            Trang chủ
          </Link>
          <Link
            href="/#about"
            className="text-zinc-300 hover:text-white transition-colors hidden md:block"
          >
            Về CLB
          </Link>
          <Link
            href="/feed.xml"
            className="text-zinc-400 hover:text-orange-400 transition-colors hidden sm:block"
            title="RSS 2.0 Feed"
          >
            RSS
          </Link>
          <Link
            href="/admin/posts"
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-violet-500/50 hover:text-white transition-all"
          >
            Quản trị
          </Link>
        </nav>
      </div>
    </header>
  );
}
