// Logic: Administrative user account management interface supporting RBAC provisioning, credential updates, and account deactivation.
// Input: User interaction and API responses.
// Output: Interactive RBAC dashboard for system administrators.

'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  KeyRound,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  adminCreateUser,
  adminDeleteUser,
  adminGetUsers,
  adminUpdateUser,
  authGetMe,
} from '@/lib/api';
import { CreateUserData, UpdateUserData, User } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State: Create User
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'author',
  });

  // Modal State: Edit User
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserData>({
    name: '',
    email: '',
    role: 'author',
    password: '',
  });

  // Load users & current logged-in admin
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const [userList, me] = await Promise.all([adminGetUsers(), authGetMe()]);
      setUsers(userList);
      setCurrentUser(me);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await adminCreateUser(createForm);
      setSuccess(`Đã tạo thành công tài khoản: ${createForm.email}`);
      setIsCreateModalOpen(false);
      setCreateForm({ name: '', email: '', password: '', role: 'author' });
      await loadUsers();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Lỗi tạo tài khoản');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);
    try {
      const payload: UpdateUserData = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };
      if (editForm.password && editForm.password.trim().length > 0) {
        payload.password = editForm.password;
      }
      await adminUpdateUser(editingUser.id, payload);
      setSuccess(`Đã cập nhật tài khoản: ${editingUser.email}`);
      setEditingUser(null);
      await loadUsers();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Lỗi cập nhật tài khoản');
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}" (${user.email})? Thao tác này không thể hoàn tác.`);
    if (!confirmed) return;

    try {
      await adminDeleteUser(user.id);
      setSuccess(`Đã xóa tài khoản: ${user.email}`);
      await loadUsers();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Lỗi xóa tài khoản');
    }
  };

  const renderRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-950/60 border border-violet-500/40 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
          <Shield className="h-3 w-3" />
          Quản trị viên
        </span>
      );
    }
    if (role === 'editor') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
          <UserCheck className="h-3 w-3" />
          Biên tập viên
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
        <UserPlus className="h-3 w-3" />
        Tác giả
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-violet-400" />
            Quản Lý Tài Khoản & Phân Quyền
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Khởi tạo, phân quyền vai trò (Admin, Editor, Author) và quản lý tài khoản thành viên trong ban biên tập EFT Blog.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsCreateModalOpen(true);
          }}
          className="btn-primary-gradient flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer shadow-lg shadow-violet-600/20"
        >
          <Plus className="h-4 w-4" />
          Tạo tài khoản mới
        </button>
      </div>

      {/* Notification Banners */}
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs sm:text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs sm:text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Matrix Info Card */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-violet-500/20 bg-zinc-925 p-5">
          <div className="flex items-center gap-2 font-bold text-violet-400 text-sm mb-1.5">
            <Shield className="h-4 w-4" />
            Quản trị viên (Admin)
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Toàn quyền hệ thống: tạo và xóa tài khoản, phân bổ vai trò, phê duyệt và xuất bản mọi bài viết, quản lý toàn bộ tệp tài nguyên.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-zinc-925 p-5">
          <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-1.5">
            <UserCheck className="h-4 w-4" />
            Biên tập viên (Editor)
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Quyền xuất bản: duyệt và đăng bài của mọi tác giả, quản lý tệp media, chỉnh sửa nội dung bài viết. Không quản lý tài khoản người dùng.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-zinc-925 p-5">
          <div className="flex items-center gap-2 font-bold text-amber-400 text-sm mb-1.5">
            <UserPlus className="h-4 w-4" />
            Tác giả (Author)
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Quyền sáng tác: tạo và chỉnh sửa bài viết nháp của chính mình, tải lên ảnh minh họa. Cần Biên tập viên hoặc Admin phê duyệt để xuất bản.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-925 shadow-xl">
        <div className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">
            Danh Sách Tài Khoản ({users.length})
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Bảo mật cơ chế Argon2id & Session Redis
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-zinc-400">Đang tải danh sách tài khoản...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400">Chưa có tài khoản nào được ghi nhận.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-3.5">Họ tên & Email</th>
                  <th className="px-6 py-3.5">Vai trò & Quyền hạn</th>
                  <th className="px-6 py-3.5">Ngày khởi tạo</th>
                  <th className="px-6 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{user.name}</span>
                          {isSelf && (
                            <span className="text-[10px] font-mono text-violet-400 bg-violet-950/50 px-1.5 py-0.5 rounded border border-violet-800/50">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3 opacity-60" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditForm({
                                name: user.name,
                                email: user.email,
                                role: user.role as any,
                                password: '',
                              });
                            }}
                            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:border-violet-500/50 hover:text-white transition-colors"
                          >
                            <UserCog className="h-3.5 w-3.5" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-rose-400 hover:border-rose-500/50 hover:bg-rose-950/30 transition-colors"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-925 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-violet-400" />
                Khởi Tạo Tài Khoản Mới
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Họ và tên:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Địa chỉ Email:
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@eft.io.vn"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Mật khẩu khởi tạo (tối thiểu 8 ký tự):
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Vai trò phân quyền:
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
                >
                  <option value="author">Tác giả (Author) - Chỉ viết nháp</option>
                  <option value="editor">Biên tập viên (Editor) - Viết và xuất bản bài</option>
                  <option value="admin">Quản trị viên (Admin) - Toàn quyền hệ thống</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary-gradient rounded-xl px-5 py-2 text-xs font-semibold"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-925 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCog className="h-5 w-5 text-violet-400" />
                Cập Nhật Quyền & Tài Khoản
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Họ và tên:
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Địa chỉ Email:
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Đặt lại mật khẩu mới (để trống nếu không đổi):
                </label>
                <input
                  type="password"
                  minLength={8}
                  placeholder="••••••••••••"
                  value={editForm.password || ''}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Vai trò phân quyền:
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
                >
                  <option value="author">Tác giả (Author) - Chỉ viết nháp</option>
                  <option value="editor">Biên tập viên (Editor) - Viết và xuất bản bài</option>
                  <option value="admin">Quản trị viên (Admin) - Toàn quyền hệ thống</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary-gradient rounded-xl px-5 py-2 text-xs font-semibold"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
