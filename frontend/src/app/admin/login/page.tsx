// Logic: Administrator authentication login form.
// Input: Email and password form submissions.
// Output: Session establishment and dashboard redirection.

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { login } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/admin/posts');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-925 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-4 h-16 w-16 overflow-hidden rounded-xl border border-violet-500/30">
            <Image
              src="/logo.jpg"
              alt="Eternal Flame Tech Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Đăng Nhập Quản Trị
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Hệ thống quản trị nội dung Eternal Flame Tech Blog
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Email Quản Trị
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eft.io.vn"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Mật Khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-900 pt-4 text-center text-xs text-zinc-500">
          Chính sách: Tài khoản quản trị chỉ được cấp phát nội bộ qua dòng lệnh hoặc cơ sở dữ liệu.
        </div>
      </div>
    </div>
  );
}
