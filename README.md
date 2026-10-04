# Eternal Flame Tech Blog (EFT Blog)

<div align="center">

[![Docker](https://img.shields.io/badge/Docker-First_Architecture-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Backend](https://img.shields.io/badge/Backend-Rust_Axum_%2B_Tokio-DEA584?logo=rust&logoColor=white)](https://github.com/tokio-rs/axum)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js_15_(ISR)-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_17-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cache](https://img.shields.io/badge/Cache-Redis_7_(Bincode)-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![CI](https://img.shields.io/badge/GitHub_Actions-Passing-brightgreen?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)

**Nền tảng xuất bản học thuật, tin tức công nghệ và tài liệu nghiên cứu Trí Tuệ Nhân Tạo & Robotics chính thức**  
*Câu lạc bộ Eternal Flame Tech (EFT) — Trường THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ, Việt Nam*

[Trang Chủ Blog](http://localhost:3000) • [Cổng Thông Tin EFT](https://eft.io.vn) • [Sơ Đồ Trang (Sitemap)](http://localhost:3000/sitemap.xml) • [Luồng RSS Feed](http://localhost:3000/feed.xml)

</div>

---

## 📑 Mục Lục (Table of Contents)

- [1. Giới Thiệu Chung](#1-giới-thiệu-chung)
- [2. Cẩm Nang Dành Cho Độc Giả (Reader & Visitor Guide)](#2-cẩm-nang-dành-cho-độc-giả-reader--visitor-guide)
  - [2.1. Duyệt bài viết và Phân trang (Pagination)](#21-duyệt-bài-viết-và-phân-trang-pagination)
  - [2.2. Trải nghiệm đọc Công thức Toán học LaTeX (KaTeX)](#22-trải-nghiệm-đọc-công-thức-toán-học-latex-katex)
  - [2.3. Lọc bài viết theo Chủ đề (Tags)](#23-lọc-bài-viết-theo-chủ-đề-tags)
  - [2.4. Đăng ký nhận tin tức qua RSS Feed & Sitemap](#24-đăng-ký-nhận-tin-tức-qua-rss-feed--sitemap)
  - [2.5. Giao diện EFT Precision Dark Theme](#25-giao-diện-eft-precision-dark-theme)
- [3. Cẩm Nang Dành Cho Tác Giả & Biên Tập Viên (Author & Editor Guide)](#3-cẩm-nang-dành-cho-tác-giả--biên-tập-viên-author--editor-guide)
  - [3.1. Đăng nhập hệ thống biên tập](#31-đăng-nhập-hệ-thống-biên-tập)
  - [3.2. Trình soạn thảo Markdown song song (Split-Pane Live Preview)](#32-trình-soạn-thảo-markdown-song-song-split-pane-live-preview)
  - [3.3. Soạn thảo Công thức Toán học KaTeX](#33-soạn-thảo-công-thức-toán-học-katex)
  - [3.4. Quản lý Thư viện Hình ảnh & Tối ưu WebP](#34-quản-lý-thư-viện-hình-ảnh--tối-ưu-webp)
  - [3.5. Lưu nháp tự động và Xuất bản bài viết](#35-lưu-nháp-tự-động-và-xuất-bản-bài-viết)
- [4. Cẩm Nang Dành Cho Quản Trị Viên (Administrator Guide)](#4-cẩm-nang-dành-cho-quản-trị-viên-administrator-guide)
  - [4.1. Hệ thống Phân quyền Tài khoản 3 Cấp (RBAC)](#41-hệ-thống-phân-quyền-tài-khoản-3-cấp-rbac)
  - [4.2. Giao diện Quản lý Người dùng (`/admin/users`)](#42-giao-diện-quản-lý-người-dùng-adminusers)
  - [4.3. Quản trị qua dòng lệnh với `eft-cli`](#43-quản-trị-qua-dòng-lệnh-với-eft-cli)
  - [4.4. Kiểm soát chính sách Đăng ký công khai](#44-kiểm-soát-chính-sách-đăng-ký-công-khai)
- [5. Cẩm Nang Kỹ Thuật & Vận Hành (Developer & DevOps Guide)](#5-cẩm-nang-kỹ-thuật--vận-hành-developer--devops-guide)
  - [5.1. Kiến trúc Hệ thống Docker-First](#51-kiến-trúc-hệ-thống-docker-first)
  - [5.2. Khởi chạy nhanh trong 3 bước (Quickstart)](#52-khởi-chạy-nhanh-trong-3-bước-quickstart)
  - [5.3. Cấu hình Biến môi trường (`.env`)](#53-cấu-hình-biến-môi-trường-env)
  - [5.4. Tài khoản Quản trị Mặc định ban đầu](#54-tài-khoản-quản-trị-mặc-định-ban-đầu)
  - [5.5. Danh mục REST API v2](#55-danh-mục-rest-api-v2)
  - [5.6. Hiệu năng & Tối ưu hóa Bộ nhớ đệm (Cache-Aside)](#56-hiệu-năng--tối-ưu-hóa-bộ-nhớ-đệm-cache-aside)
  - [5.7. Bảo mật & Kiểm soát Rủi ro (Security Baseline)](#57-bảo-mật--kiểm-soát-rủi-ro-security-baseline)
  - [5.8. Kiểm thử Tự động (Automated Testing)](#58-kiểm-thử-tự-động-automated-testing)
- [6. Cấu Trúc Thư Mục Dự Án (Project Structure)](#6-cấu-trúc-thư-mục-dự-án-project-structure)
- [7. Đóng Góp & Phát Triển (Contributing)](#7-đóng-góp--phát-triển-contributing)
- [8. Bản Quyền & Giấy Phép (License)](#8-bản-quyền--giấy-phép-license)

---

## 1. Giới Thiệu Chung

**Eternal Flame Tech Blog (EFT Blog)** là cổng xuất bản học thuật và tin tức chuyên sâu về Trí Tuệ Nhân Tạo (AI), Học Máy (Machine Learning), Hệ thống Nhúng (Embedded Systems), Robot học (Robotics) và Công nghệ Phần mềm. 

Nền tảng được phát triển với tinh thần kỹ thuật cao độ:
- **Tốc độ phản hồi cực nhanh:** Ứng dụng công nghệ Rust Axum kết hợp Redis Cache-Aside, thời gian phản hồi API đạt dưới **1 miligiây**.
- **Hiển thị toán học chuẩn mực:** Tích hợp KaTeX xử lý các phương trình toán học phức tạp một cách trực quan, mượt mà trên cả máy tính lẫn điện thoại.
- **Mô hình Docker-First:** Đóng gói 100% trong Docker container, máy chủ không cần cài đặt sẵn môi trường Rust, Node.js hay PostgreSQL.
- **Trạng thái khởi đầu trong sạch:** Không chứa bài viết mẫu giả lập (mock data); hệ thống sẵn sàng vận hành sản phẩm thực tế ngay từ lần khởi chạy đầu tiên.

---

## 2. Cẩm Nang Dành Cho Độc Giả (Reader & Visitor Guide)

### 2.1. Duyệt bài viết và Phân trang (Pagination)
- **Trang chủ (`/`):** Hiển thị danh sách các bài viết mới xuất bản nhất với ảnh bìa độ phân giải cao, tiêu đề, ngày xuất bản và tóm tắt nội dung.
- **Cơ chế phân trang 20 bài viết / trang:** Mỗi trang hiển thị tối đa 20 bài viết để tối ưu thời gian tải trang và tiết kiệm dữ liệu di động.
- **Thanh điều hướng trang:** Nằm ở cuối danh sách bài viết, cho phép bạn chuyển tới trang kế tiếp, trang trước hoặc nhấp trực tiếp vào số trang mong muốn. Đường dẫn tự động đồng bộ theo tham số `?page=2#articles`.

### 2.2. Trải nghiệm đọc Công thức Toán học LaTeX (KaTeX)
EFT Blog hỗ trợ hiển thị phương trình toán học và ký hiệu khoa học với độ phân giải vector sắc nét:
- **Công thức nội dòng (Inline):** Nằm gọn gàng giữa dòng văn bản, ví dụ: $f(x) = \sigma(W x + b)$ hay $E = mc^2$.
- **Khối công thức độc lập (Block Math):** Hiển thị nổi bật ở giữa khung đọc, ví dụ:
  $$\mathcal{L}_{BCE} = -\frac{1}{N} \sum_{i=1}^N \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right]$$
- **Hỗ trợ thiết bị di động:** Các khối phương trình dài có thanh cuộn ngang tự động, đảm bảo không bao giờ bị vỡ giao diện trên điện thoại thông minh.

### 2.3. Lọc bài viết theo Chủ đề (Tags)
- Nhấp vào bất kỳ thẻ chủ đề nào (ví dụ: `AI`, `Robotics`, `Deep Learning`, `Rust`, `Next.js`) để xem toàn bộ bài viết liên quan tại đường dẫn `/tag/{ten-the}`.
- Trang thẻ chủ đề cũng hỗ trợ phân trang 20 bài viết / trang tương tự như trang chủ.

### 2.4. Đăng ký nhận tin tức qua RSS Feed & Sitemap
- **Luồng tin RSS 2.0:** Bạn có thể đăng ký theo dõi bài viết mới bằng các ứng dụng đọc tin (Feedly, NetNewsWire, Inoreader, v.v.) qua đường dẫn:  
  `https://blog.eft.io.vn/feed.xml`
- **Sơ đồ trang web (Sitemap):** Tìm kiếm và tra cứu toàn bộ bài viết, chuyên mục phục vụ công cụ tìm kiếm tại:  
  `https://blog.eft.io.vn/sitemap.xml`

### 2.5. Giao diện EFT Precision Dark Theme
- **Bảo vệ thị giác:** Sử dụng bảng màu tối chọn lọc (`zinc-950` và `zinc-925`) giúp giảm mỏi mắt khi đọc các bài nghiên cứu kỹ thuật dài.
- **Phông chữ tiếng Việt chuẩn mực:** Sử dụng phông `Be Vietnam Pro` cho nội dung văn bản và `JetBrains Mono` cho các đoạn mã nguồn và công thức toán.

---

## 3. Cẩm Nang Dành Cho Tác Giả & Biên Tập Viên (Author & Editor Guide)

### 3.1. Đăng nhập hệ thống biên tập
1. Truy cập vào trang quản trị: [`/admin/login`](http://localhost:3000/admin/login).
2. Nhập Email và Mật khẩu được cấp phát bởi Quản trị viên.
3. Sau khi xác thực thành công, hệ thống sẽ tự động chuyển hướng bạn đến Bảng điều khiển quản trị [`/admin/posts`](http://localhost:3000/admin/posts).

### 3.2. Trình soạn thảo Markdown song song (Split-Pane Live Preview)
- **Khung bên trái:** Nơi nhập nội dung định dạng Markdown với đầy đủ thanh công cụ định dạng (In đậm, In nghiêng, Tiêu đề H1-H4, Danh sách, Bảng biểu, Trích dẫn, Chèn liên kết, Chèn khối mã nguồn).
- **Khung bên phải:** Trình xem trước thời gian thực (Live Preview) hiển thị chính xác bài viết sẽ trông như thế nào sau khi xuất bản.
- **Cuộn đồng bộ (Synchronized Scroll):** Khi bạn cuộn chuột ở khung soạn thảo, khung xem trước sẽ tự động cuộn tương ứng.

### 3.3. Soạn thảo Công thức Toán học KaTeX
Để chèn công thức toán, bạn chỉ cần gõ ký hiệu `$` hoặc nhấn nút **$\Sigma$ Math** trên thanh công cụ:

| Nhu cầu | Cú pháp Markdown | Kết quả hiển thị |
| :--- | :--- | :--- |
| **Nội dòng** | `$E = mc^2$` | $E = mc^2$ |
| **Chỉ số & Số mũ** | `$x_i^2 + y_i^2 = r^2$` | $x_i^2 + y_i^2 = r^2$ |
| **Phân số & Căn bậc hai** | `$\frac{a + b}{\sqrt{c}}$` | $\frac{a + b}{\sqrt{c}}$ |
| **Tích phân & Tổng** | `$$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$` | Hiển thị khối tích phân lớn ở giữa trang |
| **Ma trận** | `$$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$$` | Khối ma trận toán học 2x2 |

### 3.4. Quản lý Thư viện Hình ảnh & Tối ưu WebP
- **Kéo & Thả trực tiếp:** Kéo tệp ảnh từ máy tính thả trực tiếp vào khung soạn thảo hoặc dán từ clipboard (`Ctrl + V`).
- **Tự động tối ưu hóa WebP:** Hệ thống backend sẽ tự động nén và chuyển đổi ảnh sang định dạng WebP hiện đại, giúp giảm 70% dung lượng mà vẫn giữ nguyên độ sắc nét.
- **Khử trùng lặp (SHA-256):** Tải lên các ảnh trùng lặp sẽ tự động trỏ về cùng một tệp lưu trữ, không làm lãng phí dung lượng máy chủ.

### 3.5. Lưu nháp tự động và Xuất bản bài viết
- **Lưu nháp tự động (Autosave):** Bản thảo của bạn được tự động lưu sau mỗi 30 giây vào trình duyệt và cơ sở dữ liệu.
- **Quy trình Xuất bản:**
  - Tác giả (`author`): Soạn thảo và lưu bản nháp (`draft`).
  - Biên tập viên (`editor`) hoặc Quản trị viên (`admin`): Nhấn **Xuất bản (Publish)** để đưa bài viết lên trang chủ cho độc giả xem.

---

## 4. Cẩm Nang Dành Cho Quản Trị Viên (Administrator Guide)

### 4.1. Hệ thống Phân quyền Tài khoản 3 Cấp (RBAC)

Hệ thống thiết lập 3 vai trò tài khoản với quyền hạn phân định rõ ràng:

```
┌─────────────────────────────────────────────────────────────────┐
│                    👑 admin (Quản trị viên)                     │
│  - Toàn quyền hệ thống: Quản lý thành viên, phân quyền, cấu hình│
│  - Xem toàn bộ thống kê (Analytics)                            │
│  - Đăng bài, duyệt bài, xuất bản và xóa bài của mọi tác giả    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ✏️ editor (Biên tập viên)                    │
│  - Duyệt, chỉnh sửa và xuất bản bài viết của mọi thành viên     │
│  - Quản lý thư viện hình ảnh và tài nguyên                      │
│  - Không thể quản lý người dùng hoặc thay đổi quyền hạn        │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ✍️ author (Tác giả bài viết)                 │
│  - Soạn thảo và chỉnh sửa các bài viết của chính mình          │
│  - Lưu nháp bài viết (Drafts)                                  │
│  - Tải lên hình ảnh minh họa cho bài viết của mình             │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2. Giao diện Quản lý Người dùng (`/admin/users`)
Quản trị viên có thể truy cập trang Quản lý thành viên tại [`/admin/users`](http://localhost:3000/admin/users):
- **Xem danh sách thành viên:** Hiển thị tên, email, ngày tạo và huy hiệu vai trò tương ứng (`admin`, `editor`, `author`).
- **Thêm thành viên mới:** Nhấp vào nút **Thêm tài khoản**, điền Tên, Email, Mật khẩu ban đầu và chọn Vai trò phù hợp.
- **Chỉnh sửa & Đổi mật khẩu:** Cập nhật thông tin thành viên hoặc đặt lại mật khẩu mới cho người dùng.
- **Xóa tài khoản an toàn:** Tích hợp cơ chế bảo vệ máy chủ: chống tự hạ quyền của tài khoản hiện tại và chống tự xóa tài khoản đang đăng nhập.

### 4.3. Quản trị qua dòng lệnh với `eft-cli`
Trong trường hợp máy chủ chưa có tài khoản admin hoặc quản trị viên quên mật khẩu, có thể tạo hoặc cập nhật tài khoản trực tiếp qua container backend:

```bash
# Tạo hoặc cập nhật tài khoản quản trị viên thông qua CLI
docker compose exec backend eft-cli admin \
  --email "admin@eft.io.vn" \
  --password "MatKhauMoiCucKyBaoMat123!" \
  --name "Quản Trị Viên EFT"
```

### 4.4. Kiểm soát chính sách Đăng ký công khai
Để ngăn chặn tình trạng người lạ tự ý đăng ký tài khoản trên hệ thống, tính năng đăng ký công khai bị khóa mặc định:
- Cấu hình trong `.env`: `ENABLE_PUBLIC_REGISTRATION=false`.
- Khi biến này mang giá trị `false`, mọi yêu cầu gửi tới `/api/v2/auth/register` đều bị máy chủ từ chối với mã lỗi `403 Forbidden`.

---

## 5. Cẩm Nang Kỹ Thuật & Vận Hành (Developer & DevOps Guide)

### 5.1. Kiến trúc Hệ thống Docker-First

Toàn bộ giải pháp vận hành theo chính sách cổng đơn (**Single-Port Outport Policy**), chỉ công khai duy nhất cổng `:3000` của Next.js Gateway ra ngoài môi trường Internet:

```
[ Internet / Khách truy cập / Cloudflare Tunnel ]
                       │
                       ▼ :3000
┌──────────────────────────────────────────────────────────────┐
│                    frontend (Next.js 15)                     │
│  - Render HTML phía máy chủ (SSR / ISR)                      │
│  - Phân trang 20 bài viết / trang, tối ưu Core Web Vitals    │
│  - Proxy nội bộ chuyển tiếp /api/v2/* về Backend             │
└──────────────────────────────┬───────────────────────────────┘
                               │ Docker Internal Network (eft-net)
                               ▼ :8080 (Không mở cổng ra ngoài)
┌──────────────────────────────────────────────────────────────┐
│                    backend (Rust Axum)                       │
│  - Runtime bất đồng bộ Tokio siêu nhẹ (< 25MB RAM)          │
│  - Nén dữ liệu đa tầng Tower-HTTP (Brotli / Gzip)            │
│  - Xác thực bảo mật Argon2id & phân quyền 3 cấp (RBAC)       │
└──────────────┬───────────────────────────────┬───────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│       postgres (PostgreSQL)  │ │          redis (Redis)      │
│  - Truy vấn compile-time     │ │  - Đệm nhị phân Bincode     │
│    kiểm tra chặt chẽ bởi SQLx│ │    đáp ứng độ trễ < 1ms     │
│  - Chỉ mục tổng hợp tối ưu   │ │  - Tự động xóa đệm khi có   │
│  - Lưu trữ Named Volume      │ │    thay đổi dữ liệu bài viết│
└──────────────────────────────┘ └─────────────────────────────┘
```

### 5.2. Khởi chạy nhanh trong 3 bước (Quickstart)

Yêu cầu duy nhất trên máy chủ là **Docker Engine (v24+)** và **Docker Compose (v2+)**:

```bash
# Bước 1: Sao chép kho lưu trữ
git clone https://github.com/eternalflametech/blog.eft.io.vn.git
cd blog.eft.io.vn

# Bước 2: Khởi tạo tệp cấu hình môi trường từ mẫu
cp .env.example .env

# Bước 3: Khởi chạy toàn bộ hệ thống
docker compose up -d --build
```

Kiểm tra trạng thái sẵn sàng của cả 4 container:
```bash
docker compose ps
```

### 5.3. Cấu hình Biến môi trường (`.env`)

Tệp `.env` quản lý toàn bộ các thông số nhạy cảm và kết nối giữa các dịch vụ:

```ini
# Cấu hình Cổng máy chủ và Tải tệp
PORT=8080
INTERNAL_BACKEND_URL=http://backend:8080
ASSETS_DIR=/data/assets
MAX_UPLOAD_SIZE_BYTES=10485760

# Cơ sở dữ liệu PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_secure_pass
POSTGRES_DB=eft_blog
DATABASE_URL=postgres://postgres:postgres_secure_pass@postgres:5432/eft_blog

# Bộ nhớ đệm Redis
REDIS_URL=redis://redis:6379

# Bảo mật và Phiên làm việc
SESSION_SECRET=change_me_to_a_random_32_byte_string_for_production
ENABLE_PUBLIC_REGISTRATION=false

# Default Initial Administrator Seed (Applied on initial DB migration)
ADMIN_DEFAULT_EMAIL=admin@eft.io.vn
ADMIN_DEFAULT_NAME=Quản Trị Viên EFT

# Frontend Public Metadata
NEXT_PUBLIC_SITE_NAME="Eternal Flame Tech Blog"
NEXT_PUBLIC_SITE_DESCRIPTION="Trí Tuệ Nhân Tạo & Robotics - CLB Eternal Flame Tech, THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ"
```

### 5.4. Tài khoản Quản trị Mặc định ban đầu & Cơ chế Bắt buộc Đổi Mật khẩu

Khi triển khai lần đầu tiên từ cơ sở dữ liệu trống, hệ thống tự động khởi tạo tài khoản quản trị viên gốc với mật khẩu ban đầu là `admin`. Mật khẩu này **không** đặt trong `.env` để bảo đảm an toàn:

| Thông tin | Giá trị khởi tạo |
| :--- | :--- |
| **Email đăng nhập** | `admin@eft.io.vn` |
| **Mật khẩu khởi tạo ban đầu** | `admin` |
| **Vai trò** | `admin` (Quản trị viên toàn quyền) |
| **Trang đăng nhập** | [`http://localhost:3000/admin/login`](http://localhost:3000/admin/login) |

> [!IMPORTANT]
> **Cơ chế Bắt buộc Đổi Mật khẩu (Force Password Change):**  
> Ngay sau khi Quản trị viên đăng nhập bằng mật khẩu khởi tạo ban đầu (`admin`), hệ thống sẽ lập tức hiển thị bảng modal bắt buộc thay đổi mật khẩu (không thể bỏ qua). Quản trị viên chỉ có thể tiếp tục sử dụng hệ thống sau khi đã nhập mật khẩu hiện tại (`admin`) và thiết lập mật khẩu mới an toàn (tối thiểu 6 ký tự).

### 5.5. Danh mục REST API v2

Mọi yêu cầu gọi API có quyền hạn đều cần gửi kèm cookie `eft_session` hoặc tiêu đề `Authorization: Bearer <token>`:

| Phương thức | Endpoint | Quyền hạn | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v2/health` | Công khai | Kiểm tra sức khỏe của API, PostgreSQL và Redis |
| `POST` | `/api/v2/auth/login` | Công khai | Đăng nhập nhận cookie bảo mật `HttpOnly` |
| `POST` | `/api/v2/auth/logout` | Đã đăng nhập | Đăng xuất và hủy phiên làm việc trên Redis |
| `GET` | `/api/v2/auth/me` | Đã đăng nhập | Lấy thông tin tài khoản hiện đang đăng nhập |
| `POST` | `/api/v2/auth/change-password` | Đã đăng nhập | Đổi mật khẩu tài khoản và xóa cờ bắt buộc đổi |
| `GET` | `/api/v2/posts` | Công khai | Lấy danh sách bài viết phân trang (mặc định 20 bài) |
| `GET` | `/api/v2/posts/{slug}` | Công khai | Lấy chi tiết bài viết đã xuất bản theo đường dẫn slug |
| `GET` | `/api/v2/tags` | Công khai | Lấy danh sách thẻ bài viết kèm số lượng |
| `POST` | `/api/v2/assets` | Editor / Admin | Tải lên hình ảnh hoặc tài liệu (tối đa 10 MB) |
| `GET` | `/api/v2/assets/{filename}` | Công khai | Truy xuất tệp tĩnh trong thư viện |
| `GET` | `/api/v2/admin/stats` | Đã đăng nhập | Lấy số liệu thống kê bài viết, bản nháp, thành viên |
| `GET` | `/api/v2/admin/posts` | Author+ | Liệt kê danh sách bài viết quản trị |
| `POST` | `/api/v2/admin/posts` | Author+ | Tạo bài viết mới (Author tạo nháp, Editor/Admin tạo bài xuất bản) |
| `GET` | `/api/v2/admin/posts/{id}` | Author+ | Lấy nội dung chi tiết bài viết để chỉnh sửa |
| `PUT` | `/api/v2/admin/posts/{id}` | Author+ | Cập nhật nội dung bài viết |
| `DELETE` | `/api/v2/admin/posts/{id}` | Editor / Admin | Xóa bài viết khỏi cơ sở dữ liệu |
| `POST` | `/api/v2/admin/posts/{id}/publish` | Editor / Admin | Duyệt và chuyển trạng thái bài viết thành xuất bản |
| `GET` | `/api/v2/admin/users` | Admin | Liệt kê tất cả tài khoản trong hệ thống |
| `POST` | `/api/v2/admin/users` | Admin | Tạo tài khoản mới với vai trò chỉ định |
| `PUT` | `/api/v2/admin/users/{id}` | Admin | Cập nhật thông tin, vai trò hoặc mật khẩu thành viên |
| `DELETE` | `/api/v2/admin/users/{id}` | Admin | Xóa tài khoản thành viên (có bảo vệ chống tự xóa) |

### 5.6. Hiệu năng & Tối ưu hóa Bộ nhớ đệm (Cache-Aside)
- **Đệm nhị phân Bincode:** Sử dụng thư viện `bincode` tuần tự hóa các danh sách bài viết và lưu vào Redis theo khóa động `cache:posts:list:{tag}:{page}:{limit}` với thời gian sống TTL 180 giây. Thời gian trích xuất đệm đạt dưới **0.2 ms**.
- **Cơ chế Early-Return:** Khi đếm tổng số bài viết trả về `0`, hệ thống ngắt truy vấn lập tức và trả về mảng rỗng `[]`, tiết kiệm 100% tài nguyên CPU & I/O cơ sở dữ liệu.
- **Xóa đệm tự động:** Bất kỳ thao tác thêm, sửa, đổi trạng thái hoặc xóa bài viết nào đều tự động kích hoạt lệnh quét và xóa mẫu khóa đệm `cache:posts:*` trên Redis.
- **Nén dữ liệu đa tầng:** Sử dụng Tower-HTTP `CompressionLayer` tự động nén các phản hồi HTTP vượt quá 1 KB bằng thuật toán Brotli hoặc Gzip.

### 5.7. Bảo mật & Kiểm soát Rủi ro (Security Baseline)
- **Compile-time SQL Parameterization:** 100% câu lệnh SQL đều sử dụng macro `sqlx::query!` hoặc `sqlx::query_as!`, loại bỏ hoàn toàn nguy cơ SQL Injection.
- **Băm mật khẩu Argon2id:** Sử dụng thuật toán băm Argon2id với muối ngẫu nhiên chống tấn công brute-force.
- **Chống XSS & Khử độc Markdown:** Sử dụng bộ lọc HTML nghiêm ngặt, chặn các thẻ thực thi mã `<script>`, `<iframe>` và các sự kiện nội dòng `onclick`.
- **An toàn tải lên tệp:** Kiểm tra magic bytes thực tế của tệp, giới hạn dung lượng 10 MB và loại bỏ sạch sẽ siêu dữ liệu EXIF/định vị GPS của ảnh chụp.
- **Cô lập mạng lưới:** Cổng nội bộ 8080 của Axum và các cổng của cơ sở dữ liệu nằm hoàn toàn trong mạng Docker bridge `eft-net`, không mở ra ngoài Internet.

### 5.8. Kiểm thử Tự động (Automated Testing)

Chạy bộ kiểm thử tự động trực tiếp thông qua môi trường container:

```bash
# Kiểm thử tiện ích Frontend (Node.js test runner)
docker run --rm -v $(pwd)/frontend:/app -w /app node:22-alpine node --test tests/utils.test.mjs

# Kiểm tra cú pháp và tính nhất quán của Docker Compose
docker compose config --quiet

# Kiểm tra phản hồi API trực tiếp
curl -s http://localhost:3000/api/v2/health
curl -s http://localhost:3000/api/v2/posts
```

---

## 6. Cấu Trúc Thư Mục Dự Án (Project Structure)

```
.
├── .github/                   # Cấu hình GitHub Community, CI/CD & Issue Templates
│   ├── workflows/ci.yml       # Quy trình CI tự động kiểm tra Docker, Rust và Next.js
│   ├── ISSUE_TEMPLATE/        # Mẫu báo lỗi và đề xuất tính năng
│   ├── PULL_REQUEST_TEMPLATE  # Mẫu kiểm tra chất lượng Pull Request
│   ├── dependabot.yml         # Tự động cập nhật phiên bản dependencies an toàn
│   └── CODEOWNERS             # Phân công quyền sở hữu mã nguồn
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
├── docs/                      # Bộ tài liệu kỹ thuật chi tiết
│   ├── DOCKER.md              # Sổ tay kiến trúc và vận hành Docker
│   ├── USER_GUIDE.md          # Hướng dẫn sử dụng cho tác giả và độc giả
│   ├── SECURITY.md            # Tiêu chuẩn an toàn và bảo mật OWASP
│   ├── WORKFLOW.md            # Quy trình phát triển chuẩn 10 bước
│   ├── RULES_REFERENCE.md     # Quy chuẩn kỹ thuật tham chiếu
│   └── SKILLS_REFERENCE.md    # Hướng dẫn năng lực kỹ năng
├── .agents/                   # Cấu hình quy tắc và kỹ năng cho Antigravity AI
├── .cursor/                   # Cấu hình quy tắc và kỹ năng cho Cursor AI
├── CONTRIBUTING.md            # Hướng dẫn đóng góp mã nguồn
├── CODE_OF_CONDUCT.md         # Quy tắc ứng xử cộng đồng
├── SECURITY.md                # Chính sách công bố lỗ hổng bảo mật
├── LICENSE                    # Giấy phép mã nguồn mở MIT
├── docker-compose.yml         # Thiết lập triển khai Docker Compose toàn cục
├── .env.example               # Mẫu biến môi trường an toàn
└── README.md                  # Tài liệu hướng dẫn sử dụng chính
```

---

## 7. Đóng Góp & Phát Triển (Contributing)

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng học thuật và lập trình viên! Vui lòng đọc kỹ tài liệu [CONTRIBUTING.md](CONTRIBUTING.md) trước khi gửi Pull Request:
- Mọi nhánh tính năng tạm thời phải tạo theo định dạng `temp/<ten-nhanh>` và không được push lên remote.
- Tất cả commit bắt buộc phải được **ký số bằng SSH key**:
  ```bash
  git log -1 --show-signature
  ```
- Tuân thủ quy chuẩn bình luận mã nguồn nghiêm ngặt: chỉ mô tả (a) logic, (b) input, và (c) output.

---

## 8. Bản Quyền & Giấy Phép (License)

- **Bản quyền:** © 2026 trở về sau **Eternal Flame Tech (EFT)**. Mọi quyền được bảo lưu.
- **Tổ chức:** Câu lạc bộ AI & Robotics Trường THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ, Việt Nam.
- **Giấy phép:** Mã nguồn được phát hành theo giấy phép [MIT License](LICENSE).
