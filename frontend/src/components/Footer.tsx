// Logic: Public site footer displaying club credentials, attribution, and syndication feeds.
// Input: None.
// Output: Semantic JSX footer.

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-12 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-white font-bold text-base mb-2">
              Eternal Flame Tech (EFT)
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Câu lạc bộ Trí Tuệ Nhân Tạo & Robotics chính thức của Trường THPT Chuyên Nguyễn Thị Minh Khai, TP. Cần Thơ.
            </p>
          </div>
          <div>
            <div className="text-white font-semibold text-sm mb-3">Liên kết nhanh</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-violet-400 transition-colors">
                  Trang chủ bài viết
                </Link>
              </li>
              <li>
                <Link href="/feed.xml" className="hover:text-violet-400 transition-colors">
                  Luồng tin RSS 2.0
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-violet-400 transition-colors">
                  Sơ đồ trang (Sitemap)
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-violet-400 transition-colors">
                  Đăng nhập quản trị viên
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold text-sm mb-3">Quy chuẩn kỹ thuật</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Nền tảng vận hành trên kiến trúc Docker-First, backend Rust Axum tốc độ cao, Redis Cache-Aside nhị phân và giao diện Next.js tối ưu chuẩn Core Web Vitals.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-900 pt-6 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} Eternal Flame Tech. Mọi quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
