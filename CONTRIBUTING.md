# Contributing to Eternal Flame Tech Blog

Xin chào và cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án **Eternal Flame Tech Blog (EFT Blog)**! Dự án được duy trì và phát triển bởi Câu lạc bộ AI & Robotics THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ.

Tài liệu này hướng dẫn chi tiết quy trình phát triển, quy chuẩn mã nguồn và cách gửi Pull Request an toàn, chuyên nghiệp.

---

## 1. Quy chuẩn Môi trường (Docker-First Mandate)

Dự án tuân thủ triệt để mô hình **Docker-First**:
- Bạn **không cần** cài đặt Rust, Node.js, npm hay PostgreSQL trực tiếp trên máy chủ host.
- Yêu cầu duy nhất đối với máy chủ phát triển là **Docker Engine (v24+)** và **Docker Compose (v2+)**.
- Mọi thao tác build, test và run đều thực hiện thông qua container:
  ```bash
  docker compose up -d --build
  ```

---

## 2. Quy trình Phát triển 10 Bước (10-Step Lifecycle)

Mọi công việc kỹ thuật (dù là AI coding assistant hay lập trình viên) đều phải tuân thủ nghiêm ngặt 10 bước sau:

1. **Làm rõ Yêu cầu (Clarify Intent):** Đặt câu hỏi và thống nhất 100% tiêu chí hoàn thành trước khi bắt đầu.
2. **Thấu hiểu Logic (Deep Logic Comprehension):** Phân tích luồng dữ liệu, schema cơ sở dữ liệu, API contract và các trường hợp biên.
3. **Tra cứu Phiên bản (Search & Discovery):** Tìm kiếm phiên bản stable mới nhất của thư viện và Docker base image.
4. **Lập Kế hoạch Chi tiết (Formulate Plan):** Liệt kê danh sách file cần sửa, migration, endpoint và checklist kiểm thử.
5. **Xác nhận Kế hoạch (Verify with User):** Trình bày kế hoạch và nhận sự đồng thuận trước khi can thiệp mã nguồn.
6. **Tạo Nhánh Tạm (Local Temp Branch):** Tạo nhánh tạm cục bộ `git checkout -b temp/<task-name>`. **Tuyệt đối không bao giờ push nhánh tạm này lên remote.**
7. **Triển khai Mã nguồn (Implement Changes):** Viết code trên nhánh tạm, tuân thủ bảng màu Tailwind EFT Dark Theme và quy chuẩn comment nghiêm ngặt.
8. **Kiểm thử Tự động (Automated Testing):** Chạy và đảm bảo 100% vượt qua kiểm thử (`cargo test`, `npm test`, lints, Docker build/healthchecks).
9. **Xin phép Merge & Push (Authorization):** Báo cáo kết quả và nhận sự đồng ý rõ ràng trước khi merge vào `main`.
10. **Dọn dẹp & Lưu Báo cáo (Cleanup & Report):** Merge vào `main`, ký SSH commit, push lên `origin/main`, xóa nhánh tạm cục bộ và lưu báo cáo thực thi tại `~/reports/{taskid}-{datetime}.md`.

---

## 3. Quy chuẩn Mã nguồn & Thiết kế

### 3.1. Bình luận Mã nguồn (Strict Comments)
- Mọi chú thích trong mã nguồn **CHỈ** được phép mô tả:
  1. `Logic` (luồng thuật toán xử lý)
  2. `Input` (dữ liệu đầu vào, kiểu dữ liệu, ràng buộc)
  3. `Output` (kết quả trả về, định dạng đầu ra, lỗi có thể xảy ra)
- Nghiêm cấm nhận xét mang tính trò chuyện, lời chào, watermark tác giả hoặc mô tả thừa thãi.

### 3.2. Giao diện & Bảng màu (EFT Dark Theme)
- Sử dụng tiện ích utility-first của Tailwind CSS:
  - Nền chính: `zinc-950`
  - Thẻ card / Panel: `zinc-925` (hoặc `zinc-900/50`)
  - Điểm nhấn (Accents): `violet-600` và `rose-600`
  - Font chữ: `Be Vietnam Pro` (văn bản) và `JetBrains Mono` (code & math)
- Thiết kế ưu tiên di động (Mobile-first layout) và không dùng CSS thô không scoped.

### 3.3. Bảo mật Cơ sở Dữ liệu & API
- **SQL Parameterized:** Bắt buộc dùng `sqlx::query!` hoặc `sqlx::query_as!`. Nghiêm cấm cộng chuỗi hoặc nội suy chuỗi SQL thô.
- **RBAC Extractors:** Mọi endpoint quản trị cần được bảo vệ bằng Axum extractor (`RequireAdmin`, `RequireEditor`).
- **XSS & LaTeX:** Công thức KaTeX được parse an toàn (`throwOnError: false`), Markdown được sanitize chặt chẽ.
- **Không hardcode:** Không lưu mật khẩu, secret, API key hay ngày tháng tĩnh trong source code.

---

## 4. Ký số Commit bằng SSH Key (Mandatory Commit Signing)

Tất cả các commit vào repository bắt buộc phải được ký số mật mã học bằng SSH key:
```bash
git config user.name "nmkdeveloper"
git config user.email "nguyenminhkhoi.nmk.dev@gmail.com"
git config user.signingkey ~/.ssh/id_ed25519.pub
git config commit.gpgsign true
git config gpg.format ssh
```

Kiểm tra chữ ký sau khi commit:
```bash
git log -1 --show-signature
```

---

## 5. Gửi Pull Request

1. Fork repository và clone về máy phát triển.
2. Tạo nhánh tính năng từ `main` (`git checkout -b feat/ten-tinh-nang`).
3. Khởi chạy và kiểm tra ứng dụng sạch sẽ bằng Docker: `docker compose up -d --build`.
4. Đảm bảo toàn bộ lint và test vượt qua 100%.
5. Tạo Pull Request và điền đầy đủ các mục trong [PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md).
