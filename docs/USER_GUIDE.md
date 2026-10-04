# Sổ Tay Hướng Dẫn Sử Dụng EFT Blog

## 1. Giới Thiệu Chung
Hệ thống EFT Blog (Eternal Flame Tech Blog) là nền tảng tin tức, bài viết công nghệ và nghiên cứu học thuật của **Câu lạc bộ Trí Tuệ Nhân Tạo & Robotics Eternal Flame Tech** trực thuộc Trường THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ. Tài liệu này cung cấp hướng dẫn đầy đủ về cách sử dụng, quản lý tài khoản, soạn thảo bài viết với công thức toán học LaTeX, quản lý tài nguyên và phân quyền quản trị.

---

## 2. Truy Cập Hệ Thống & Phân Quyền Tài Khoản (RBAC)

### 2.1. Cấu Trúc Phân Quyền 3 Cấp Độ (Role-Based Access Control)
Hệ thống áp dụng cơ chế phân quyền nghiêm ngặt nhằm đảm bảo an toàn nội dung:

| Vai trò | Ký hiệu | Quyền hạn chi tiết |
| :--- | :--- | :--- |
| **Quản trị viên** (`admin`) | Huy hiệu Tím | Toàn quyền kiểm soát hệ thống, cấp phát tài khoản người dùng, đổi quyền, xem thống kê toàn cục, quản lý mọi bài viết và tài nguyên. |
| **Biên tập viên** (`editor`) | Huy hiệu Xanh | Duyệt và xuất bản bài viết của các tác giả, quản lý toàn bộ bài viết và thư viện tài nguyên tải lên. |
| **Tác giả** (`author`) | Huy hiệu Vàng | Tạo bài viết mới dưới dạng nháp, chỉnh sửa và quản lý các bài viết của chính mình (không thể tự duyệt xuất bản). |

### 2.2. Đăng Nhập & Bảo Mật Phiên
- **Đường dẫn đăng nhập:** [`/admin/login`](http://localhost:3000/admin/login).
- **Tài khoản khởi tạo ban đầu:** Email `admin@eft.io.vn` / Mật khẩu khởi tạo ban đầu `admin` (không đặt trong `.env` để bảo đảm an toàn).
- **Bắt buộc đổi mật khẩu khi vừa đăng nhập:** Ngay sau khi đăng nhập bằng mật khẩu mặc định `admin`, hệ thống sẽ kích hoạt bảng modal bắt buộc thay đổi mật khẩu. Quản trị viên chỉ có thể tiếp tục sử dụng hệ thống sau khi đã thiết lập mật khẩu mới (tối thiểu 6 ký tự).
- **Cơ chế phiên:** Phiên làm việc duy trì qua cookie bảo mật `HttpOnly`, `SameSite=Strict`, tự động mã hóa và hủy ngay lập tức trên Redis khi đăng xuất.
- **Chính sách đăng ký:** Tính năng tự đăng ký công khai bị khóa mặc định để ngăn chặn tài khoản giả mạo.

### 2.3. Quản Lý Tài Khoản Người Dùng (`/admin/users`)
Quản trị viên (`admin`) truy cập mục **Tài khoản & Phân quyền** trên thanh menu quản trị để:
- **Tạo tài khoản mới:** Nhấn **"Thêm tài khoản"**, điền Họ tên, Email, Mật khẩu (tối thiểu 8 ký tự) và chọn Vai trò (`admin`, `editor`, `author`). Mật khẩu được mã hóa tự động bằng thuật toán bảo mật Argon2id.
- **Chỉnh sửa thông tin:** Cập nhật họ tên, email hoặc đổi mật khẩu mới cho người dùng.
- **Cơ chế an toàn (Safety Guards):**
  - Quản trị viên không thể tự hạ quyền của chính mình nhằm tránh trường hợp hệ thống bị mất quyền quản trị cao nhất.
  - Quản trị viên không thể tự xóa tài khoản đang đăng nhập của bản thân.

---

## 3. Trình Soạn Thảo Markdown & Công Thức Toán Học LaTeX

Trình soạn thảo hỗ trợ giao diện hai khung song song: khung nhập liệu cú pháp Markdown bên trái và khung xem trước kết quả trực tiếp (Live Preview) bên phải.

### 3.1. Hỗ Trợ Công Thức Toán Học LaTeX (KaTeX)
EFT Blog tích hợp sẵn công cụ render toán học KaTeX tốc độ cao:
- **Công thức nội dòng (Inline Math):** Đặt công thức giữa hai dấu đô la đơn `$formula$`.
  - Ví dụ: Phương trình năng lượng Einstein `$E = mc^2$` sẽ hiển thị dạng $E = mc^2$.
- **Khối công thức hiển thị riêng (Block / Display Math):** Đặt công thức giữa hai cặp dấu đô la kép `$$formula$$`.
  - Ví dụ:
    ```markdown
    $$
    f(x) = \frac{1}{\sigma \sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}
    $$
    ```
- **Nút chèn nhanh $\Sigma$:** Trên thanh công cụ soạn thảo, bấm vào biểu tượng $\Sigma$ để chèn mẫu công thức toán học một cách nhanh chóng.
- **Chống tràn màn hình:** Các công thức toán học ma trận hoặc phương trình dài tự động kích hoạt thanh cuộn ngang mượt mà, không làm vỡ bố cục trên điện thoại.

### 3.2. Các Thao Tác Định Dạng Nhanh
- **In đậm:** `Ctrl + B` hoặc biểu tượng **B** (`**nội dung**`).
- **In nghiêng:** `Ctrl + I` hoặc biểu tượng *I* (`*nội dung*`).
- **Tiêu đề phân cấp:** Sử dụng `#` cho Tiêu đề 1, `##` cho Tiêu đề 2, `###` cho Tiêu đề 3.
- **Danh sách:** Danh sách dấu chấm (`- `), danh sách số (`1. `), danh sách công việc (`- [ ] `).
- **Trích dẫn:** Đặt ký tự `> ` ở đầu đoạn văn bản.
- **Chèn liên kết:** `Ctrl + K` hoặc sử dụng cú pháp `[Tên liên kết](URL)`.

### 3.3. Khối Mã Nguồn (Code Blocks)
Soạn thảo khối mã nguồn kèm định danh ngôn ngữ để kích hoạt tính năng tô màu cú pháp theo chuẩn bảng màu EFT Dark Theme:
````markdown
```rust
// Khối mã nguồn minh họa
fn main() {
    println!("Eternal Flame Tech");
}
```
````

### 3.4. Bảng Biểu & Chú Thích Chân Trang
- Bảng biểu được tạo bằng các thanh đứng `|` và đường phân cách ngang `---`.
- Chú thích chân trang sử dụng cú pháp `[^1]` trong bài viết và định nghĩa ở cuối bài `[^1]: Nội dung chú thích`.

---

## 4. Quản Lý Thông Tin Bài Viết (Frontmatter & SEO)

Mỗi bài viết bao gồm các trường thông tin cấu trúc sau:
- **Tiêu đề (Title):** Tên bài viết bằng tiếng Việt rõ ràng, cô đọng.
- **Đường dẫn (Slug):** Hệ thống tự động tạo slug chuẩn hóa từ tiêu đề tiếng Việt (bỏ dấu tiếng Việt, chuyển chữ thường, thay khoảng trắng bằng dấu gạch ngang, ví dụ: `giai-thuat-computer-vision-yolov8`). Bạn có thể tùy chỉnh slug thủ công.
- **Ảnh bìa (Cover Image):** Đường dẫn ảnh đại diện bài viết từ Thư viện tài nguyên hoặc URL ngoài.
- **Mô tả ngắn (Excerpt):** Đoạn tóm tắt từ 140 - 160 ký tự, dùng cho thẻ hiển thị mạng xã hội (Open Graph, Twitter Card) và kết quả tìm kiếm Google.
- **Thẻ phân loại (Tags):** Các từ khóa chuyên môn phân cách bằng dấu phẩy (ví dụ: `Trí Tuệ Nhân Tạo, Robotics, Computer Vision`). Hệ thống tự động lưu trữ và tạo danh mục cho các thẻ này.

---

## 5. Tải Lên & Quản Lý Tài Nguyên (Asset Library)

Thư viện tài nguyên cho phép tải lên hình ảnh và tài liệu minh họa phục vụ bài viết.

### 5.1. Quy Trình Tải Lên
- **Kéo & Thả:** Bạn có thể kéo tệp ảnh trực tiếp từ máy tính thả vào khung soạn thảo hoặc dán ảnh trực tiếp từ bộ nhớ tạm (Clipboard `Ctrl + V`).
- **Định Dạng Hỗ Trợ:** Hình ảnh (`.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif`) và tài liệu (`.pdf`).
- **Dung Lượng Tối Đa:** Mỗi tệp không vượt quá 10 MB.

### 5.2. Tối Ưu Hóa Tự Động & Chống Trùng Lặp
- **Khử Trùng Lặp Dữ Liệu:** Hệ thống tính toán mã băm SHA-256 của tệp. Nếu tệp tương tự đã tồn tại, hệ thống sẽ tái sử dụng tệp cũ nhằm tiết kiệm tài nguyên lưu trữ.
- **Chuyển Đổi WebP:** Các định dạng ảnh thông thường tự động được nén và chuyển đổi sang WebP để tối ưu tốc độ tải trang cho người đọc.
- **Đường Dẫn Cố Định:** Tệp tải lên trả về đường dẫn cố định dạng `/api/v2/assets/{hash}.webp` để nhúng vào bài viết.

---

## 6. Lưu Nháp & Xuất Bản Bài Viết

- **Tự Động Lưu Nháp (Autosave):** Nội dung đang soạn thảo tự động được lưu vào bộ nhớ trình duyệt và đồng bộ về máy chủ.
- **Trạng Thái Bài Viết:**
  - `Bản nháp (Draft)`: Bài viết chỉ hiển thị với các thành viên trong trang quản lý. Tác giả (`author`) chỉ tạo được bài nháp.
  - `Đã xuất bản (Published)`: Bài viết hiển thị công khai trên trang chủ, trang chủ đề, sơ đồ trang `sitemap.xml` và luồng cấp tin `feed.xml`.
- **Duyệt & Xuất Bản:** Biên tập viên (`editor`) hoặc Quản trị viên (`admin`) có thể duyệt và xuất bản bài viết ngay từ bảng danh sách hoặc trong trang soạn thảo.

---

## 7. Phân Trang 20 Bài Viết & Duyệt Nội Dung Công Khai

### 7.1. Phân Trang Tối Ưu (Pagination)
- Mục *Bài Viết Mới Xuất Bản* trên trang chủ và các trang theo chủ đề (`/tag/{slug}`) tự động chia trang với **tối đa 20 bài viết mỗi trang**.
- Dưới danh sách bài viết hiển thị thanh phân trang trực quan:
  - Nút **"Trang trước"** / **"Trang sau"**.
  - Các ô số trang với đánh dấu trang hiện tại và dấu ba chấm (`…`) khi có nhiều trang.
  - Neo chuyển hướng `#articles` đưa màn hình cuộn mượt mà ngay vào danh sách bài viết khi sang trang mới.
  - Đường dẫn URL thân thiện `?page=2#articles` tương thích hoàn hảo với SEO và trình duyệt.

### 7.2. Lọc Theo Chủ Đề (Topic Filter)
- Thanh lọc chủ đề phía trên danh sách bài viết chỉ hiển thị các thẻ tag có chứa ít nhất 1 bài viết đã xuất bản.
- Nhấp vào từng chủ đề để xem danh sách bài viết chuyên biệt theo chủ đề đó.

---

## 8. Vận Hành Mạng & Kết Nối Cloudflare Tunnel

Hệ thống hỗ trợ xuất bản an toàn ra Internet qua Cloudflare Zero Trust Tunnel mà không cần mở cổng modem mạng (Port Forwarding):
1. **Lấy Token:** Tạo Tunnel trên Cloudflare Zero Trust Dashboard và sao chép chuỗi mã hóa Tunnel Token.
2. **Cấu hình trên máy chủ:** Mở tệp `.env`, kích hoạt `COMPOSE_PROFILES=tunnel` và dán mã token vào biến `CLOUDFLARE_TUNNEL_TOKEN`.
3. **Định tuyến máy chủ:** Trên Cloudflare Dashboard, cấu hình Public Hostname trỏ tới URL dịch vụ nội bộ `http://frontend:3000`.
4. **Khởi chạy:** Chạy lệnh `docker compose up -d` (hoặc `docker compose --profile tunnel up -d`). Dịch vụ `cloudflared` sẽ tự động kết nối và mã hóa toàn bộ dữ liệu truyền nhận.
