# Eternal Flame Tech Blog (EFT Blog)

[![Docker](https://img.shields.io/badge/Docker-First-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Backend](https://img.shields.io/badge/Backend-Rust%20Axum-DEA584?logo=rust&logoColor=white)](https://github.com/tokio-rs/axum)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015%20(ISR)-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2017-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cache](https://img.shields.io/badge/Cache-Redis%207%20(Bincode)-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

Nền tảng chia sẻ học thuật, tin tức công nghệ và nghiên cứu Trí Tuệ Nhân Tạo & Robotics chính thức của **Câu lạc bộ Eternal Flame Tech (EFT)** — Trường THPT Chuyên Nguyễn Thị Minh Khai, TP. Cần Thơ, Việt Nam.

---

## 1. Tổng Quan Kiến Trúc (Architecture Overview)

EFT Blog vận hành hoàn toàn theo mô hình **Docker-First Architecture** với chính sách cổng đơn (**Single-Port Outport Policy**), chỉ mở cổng `:3000` ra máy chủ bên ngoài:

```
[ Internet / Reverse Proxy / Cloudflare Tunnel ]
                       │
                       ▼ :3000
┌──────────────────────────────────────────────────────────────┐
│                    eft-frontend (Next.js)                    │
│  - Render giao diện phía máy chủ (SSR / ISR)                 │
│  - Phân trang 20 bài viết / trang, tối ưu Core Web Vitals    │
│  - Proxy nội bộ chuyển tiếp /api/v2/* về Backend             │
└──────────────────────────────┬───────────────────────────────┘
                               │ Mạng nội bộ cầu nối Docker (eft-net)
                               ▼ :8080 (Không mở cổng ra ngoài)
┌──────────────────────────────────────────────────────────────┐
│                     eft-backend (Rust Axum)                  │
│  - Runtime bất đồng bộ Tokio siêu nhẹ (< 25MB RAM)          │
│  - Nén dữ liệu đa tầng Tower-HTTP (Brotli / Gzip)            │
│  - Xác thực bảo mật Argon2id & phân quyền 3 cấp (RBAC)       │
└──────────────┬───────────────────────────────┬───────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│    eft-postgres (PostgreSQL) │ │       eft-redis (Redis)     │
│  - Truy vấn compile-time     │ │  - Đệm nhị phân Bincode     │
│    kiểm tra chặt chẽ bởi SQLx│ │    đáp ứng độ trễ < 1ms     │
│  - Chỉ mục tổng hợp tối ưu   │ │  - Tự động xóa đệm khi có   │
│  - Lưu trữ Named Volume      │ │    thay đổi dữ liệu bài viết│
└──────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Tính Năng Nổi Bật (Core Features)

### 2.1. Soạn Thảo Markdown & Công Thức Toán Học LaTeX (KaTeX)
- Hỗ trợ công thức toán học nội dòng `$E = mc^2$` và khối độc lập `$$\dots$$` chuẩn KaTeX quốc tế.
- Trình soạn thảo hai khung song song (Markdown input & synchronized Live Preview) với nút chèn công thức nhanh $\Sigma$.
- Tự động chống tràn (horizontal scrollbar) cho các phương trình dài trên thiết bị di động.

### 2.2. Phân Quyền Tài Khoản Phân Cấp (Role-Based Access Control - RBAC)
- **3 vai trò độc lập:**
  - `admin`: Toàn quyền quản trị hệ thống, cấp phát tài khoản, phân quyền, xem thống kê toàn diện.
  - `editor`: Quản lý, duyệt và xuất bản tất cả bài viết cùng thư viện tài nguyên.
  - `author`: Soạn thảo và biên tập các bài viết nháp của chính mình.
- Bảng quản trị tài khoản tại `/admin/users` với modal thêm/sửa, cơ chế chống tự hạ quyền của chính mình và chống tự xóa tài khoản đang đăng nhập.

### 2.3. Phân Trang Tối Ưu 20 Bài Viết / Trang (High-Performance Pagination)
- Mục *Bài Viết Mới Xuất Bản* phân chia 20 bài viết tối đa mỗi trang.
- Thành phần điều hướng `<Pagination />` hỗ trợ chuyển trang mượt mà (`?page=2#articles`), hiển thị dấu ba chấm (`…`) thông minh và hỗ trợ trọn vẹn SSR cho bot tìm kiếm.
- API `GET /api/v2/posts` trả về đầy đủ siêu dữ liệu `items`, `total`, `page`, `limit: 20`, và `total_pages`.

### 2.4. Tối Ưu Hóa Tối Đa Tốc Độ Truy Xuất (Extreme Performance)
- **Redis Cache-Aside:** Lưu trữ dữ liệu danh sách bài viết dưới dạng nhị phân Bincode với khóa `cache:posts:list:{tag}:{page}:{limit}`. Độ trễ phản hồi đệm đạt **< 1ms**.
- **Cơ Chế Early Return:** Ngắt truy vấn ngay lập tức khi không có bài viết, tiết kiệm 100% tài nguyên CPU & I/O cơ sở dữ liệu.
- **Chỉ Mục Tối Ưu:** Sử dụng chỉ mục phức hợp `idx_posts_status_published_at` (`status, published_at DESC`) và khóa chính `post_tags(post_id)`.

### 2.5. Tối Ưu Hóa SEO & Syndication Feeds
- **Sơ đồ trang động ([`sitemap.xml`](http://localhost:3000/sitemap.xml)):** Tự động quét và cập nhật bài viết mới nhất với cờ `force-dynamic`, tích hợp chuẩn Google Image Sitemap (`xmlns:image`).
- **Dữ liệu cấu trúc:** Nhúng Schema.org `BlogPosting` và `Organization` chuẩn JSON-LD trên mọi bài viết.
- **Thẻ xem trước xã hội:** Tự động tạo thẻ Open Graph và Twitter Cards (`summary_large_image`).
- **Luồng tin RSS 2.0 ([`feed.xml`](http://localhost:3000/feed.xml)):** Cung cấp tin tức tự động cho các trình đọc RSS feed.
- **Chuẩn hóa URL:** Tự động loại bỏ dấu tiếng Việt thành slug chuẩn ASCII an toàn (`slugifyVietnamese`).

### 2.6. Thư Viện Tài Nguyên Thông Minh (Asset Library)
- Tự động khử trùng lặp dữ liệu bằng mã băm **SHA-256**.
- Tự động tối ưu hóa và chuyển đổi định dạng ảnh sang **WebP**.
- Tách biệt hoàn toàn mã độc, kiểm tra magic bytes thực tế, giới hạn 10 MB/tệp.

### 2.7. Giao Diện EFT Precision Dark Theme
- Hệ màu chuẩn xác: Nền chính `zinc-950`, thẻ bài viết `zinc-925`, điểm nhấn `violet-600` và `rose-600`.
- Phông chữ tiếng Việt chuẩn hóa: `Be Vietnam Pro` (văn bản) và `JetBrains Mono` (mã nguồn).
- Thanh điều hướng viên thuốc trượt (Sliding Capsule Navbar) đồng bộ từ cổng chính `eft.io.vn`.
- Trạng thái sạch hoàn toàn: Không chứa bất kỳ dữ liệu mẫu (mock data) hay bài viết giả lập nào khi khởi chạy.

---

## 3. Hướng Dẫn Khởi Chạy Nhanh (Quickstart)

Chỉ cần cài đặt Docker Engine và Docker Compose trên máy chủ (Debian 13 hoặc bất kỳ hệ điều hành nào):

```bash
# 1. Sao chép kho lưu trữ
git clone https://github.com/eternalflametech/blog.eft.io.vn.git
cd blog.eft.io.vn

# 2. Khởi tạo tệp cấu hình môi trường
cp .env.example .env

# 3. Khởi chạy toàn bộ hệ thống bằng Docker Compose
docker compose up -d --build
```

### Các Cổng Dịch Vụ
- **Trang chủ Blog & Cổng ứng dụng:** [`http://localhost:3000`](http://localhost:3000)
- **Trang đăng nhập Quản trị viên:** [`http://localhost:3000/admin/login`](http://localhost:3000/admin/login)
- **API Kiểm tra sức khỏe (Health Check):** [`http://localhost:3000/api/v2/health`](http://localhost:3000/api/v2/health)
- **Sơ đồ trang (Sitemap):** [`http://localhost:3000/sitemap.xml`](http://localhost:3000/sitemap.xml)
- **Luồng tin tức RSS 2.0:** [`http://localhost:3000/feed.xml`](http://localhost:3000/feed.xml)

---

## 4. Tài Khoản Quản Trị Mặc Định (Default Credentials)

Khi cơ sở dữ liệu khởi tạo lần đầu từ trạng thái sạch, hệ thống sẽ tự động tạo tài khoản quản trị viên duy nhất dựa trên cấu hình `.env`:

| Thông tin | Giá trị mặc định |
| :--- | :--- |
| **Email đăng nhập** | `admin@eft.io.vn` |
| **Mật khẩu** | `admin123456_ChangeMeInProd!` |
| **Vai trò** | `admin` (Quản trị viên toàn quyền) |
| **Đường dẫn quản lý tài khoản** | `/admin/users` |

> [!IMPORTANT]
> Hãy đổi mật khẩu này ngay sau khi triển khai hệ thống lên môi trường production tại trang Quản lý tài khoản hoặc thông qua công cụ `eft-cli`.

---

## 5. Danh Mục API v2 (API Reference)

Tất cả các API được bảo vệ yêu cầu cookie phiên `eft_session` hoặc tiêu đề `Authorization: Bearer <token>`:

| Phương thức | Đường dẫn Endpoint | Quyền hạn | Mục đích |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v2/health` | Công khai | Kiểm tra tính khả dụng của API, PostgreSQL và Redis |
| `POST` | `/api/v2/auth/login` | Công khai | Đăng nhập nhận cookie phiên bảo mật HttpOnly |
| `POST` | `/api/v2/auth/logout` | Đăng nhập | Đăng xuất và hủy phiên làm việc trên Redis |
| `GET` | `/api/v2/auth/me` | Đăng nhập | Lấy thông tin tài khoản đang đăng nhập |
| `GET` | `/api/v2/posts` | Công khai | Lấy danh sách bài viết phân trang (mặc định 20 bài) |
| `GET` | `/api/v2/posts/{slug}` | Công khai | Lấy chi tiết bài viết đã xuất bản theo slug |
| `GET` | `/api/v2/tags` | Công khai | Lấy danh sách các chủ đề/tag có bài viết xuất bản |
| `POST` | `/api/v2/assets` | Editor / Admin | Tải lên hình ảnh hoặc tài liệu (tối đa 10 MB) |
| `GET` | `/api/v2/assets/{filename}` | Công khai | Phục vụ tệp tĩnh tải lên |
| `GET` | `/api/v2/admin/stats` | Đăng nhập | Lấy thống kê số lượng bài viết, bản nháp, tài khoản, assets |
| `GET` | `/api/v2/admin/posts` | Author+ | Liệt kê bài viết quản trị (Author chỉ thấy bài của mình) |
| `POST` | `/api/v2/admin/posts` | Author+ | Tạo bài viết mới (Author tạo nháp, Editor/Admin tạo bài xuất bản) |
| `GET` | `/api/v2/admin/posts/{id}` | Author+ | Lấy chi tiết bài viết để chỉnh sửa |
| `PUT` | `/api/v2/admin/posts/{id}` | Author+ | Cập nhật bài viết |
| `DELETE` | `/api/v2/admin/posts/{id}` | Editor / Admin | Xóa bài viết |
| `POST` | `/api/v2/admin/posts/{id}/publish` | Editor / Admin | Duyệt và xuất bản bài viết |
| `GET` | `/api/v2/admin/users` | Admin | Liệt kê tất cả tài khoản trong hệ thống |
| `POST` | `/api/v2/admin/users` | Admin | Cấp phát tài khoản mới với vai trò chỉ định |
| `PUT` | `/api/v2/admin/users/{id}` | Admin | Cập nhật tên, email, vai trò hoặc mật khẩu người dùng |
| `DELETE` | `/api/v2/admin/users/{id}` | Admin | Xóa tài khoản (có bảo vệ chống tự xóa chính mình) |

---

## 6. Công Cụ Quản Trị Dòng Lệnh (`eft-cli`)

Hệ thống cung cấp sẵn tiện ích CLI tích hợp trong container backend để quản trị tài khoản không cần qua web:

```bash
# Tạo hoặc cập nhật tài khoản quản trị viên thông qua CLI
docker compose exec backend eft-cli admin \
  --email "admin@eft.io.vn" \
  --password "MatKhauMoiCucKyBaoMat123!" \
  --name "Quản Trị Viên EFT"
```

---

## 7. Kiểm Thử Hệ Thống (Automated Testing)

Chạy bộ kiểm thử tự động trực tiếp thông qua môi trường container:

```bash
# Chạy bộ kiểm thử hàm tiện ích frontend (Node.js test runner)
docker run --rm -v $(pwd)/frontend:/app -w /app node:22-alpine node --test tests/utils.test.mjs

# Kiểm tra trạng thái sức khỏe các dịch vụ
docker compose ps
```

---

## 8. Cấu Trúc Thư Mục Dự Án (Project Structure)

```
.
├── backend/                   # Ứng dụng Backend viết bằng Rust Axum
│   ├── Cargo.toml             # Khai báo crate dependencies
│   ├── Dockerfile             # Multi-stage Docker build cho binary Rust
│   ├── migrations/            # SQLx database schema migrations
│   └── src/                   # Mã nguồn Rust (routes, models, auth, db, state)
├── frontend/                  # Ứng dụng Frontend viết bằng Next.js 15
│   ├── package.json           # Khai báo npm dependencies (KaTeX, Tailwind, Lucide)
│   ├── Dockerfile             # Multi-stage standalone Next.js runner
│   ├── src/
│   │   ├── app/               # Next.js App Router (trang chủ, bài viết, admin, sitemap, feed)
│   │   ├── components/        # UI components (Header, Footer, Pagination, MarkdownRenderer, Editor)
│   │   └── lib/               # Typed API client, utility functions, type definitions
├── docs/                      # Tài liệu kỹ thuật chi tiết
│   ├── DOCKER.md              # Hướng dẫn chi tiết hạ tầng Docker
│   ├── USER_GUIDE.md          # Sổ tay hướng dẫn người dùng và quản trị viên
│   ├── SECURITY.md            # Tiêu chuẩn an toàn và bảo mật OWASP
│   ├── WORKFLOW.md            # Quy trình phát triển chuẩn 10 bước
│   ├── RULES_REFERENCE.md     # Quy định kiểm thử và kiến trúc agent
│   └── SKILLS_REFERENCE.md    # Hướng dẫn năng lực kỹ năng
├── .agents/                   # Cấu hình quy tắc và kỹ năng cho Antigravity AI
├── .cursor/                   # Cấu hình quy tắc và kỹ năng cho Cursor AI
├── docker-compose.yml         # Thiết lập triển khai Docker Compose toàn cục
├── .env.example               # Mẫu biến môi trường an toàn
└── README.md                  # Tài liệu hướng dẫn sử dụng chính
```

---

## 9. Bản Quyền & Đóng Góp (Attribution & License)

- **Bản quyền:** © 2026 **Eternal Flame Tech (EFT)**. Mọi quyền được bảo lưu.
- **Tác giả:** Đội ngũ phát triển và nghiên cứu AI & Robotics thuộc Trường THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ.
- **Giấy phép:** [MIT License](LICENSE).
