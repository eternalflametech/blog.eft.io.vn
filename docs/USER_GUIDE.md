# Sổ Tay Hướng Dẫn Sử Dụng EFT Blog

## 1. Giới Thiệu Chung
Hệ thống EFT Blog (Eternal Flame Tech Blog) là nền tảng tin tức, bài viết công nghệ và nghiên cứu học thuật của Câu lạc bộ Eternal Flame Tech trực thuộc Trường THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ. Tài liệu này hướng dẫn quản trị viên cách tạo bài viết, quản lý tài nguyên số và xuất bản nội dung.

## 2. Truy Cập Hệ Thống & Bảo Mật Tài Khoản
- **Đăng Nhập Quản Trị:** Quản trị viên truy cập trang quản trị nội bộ qua đường dẫn `/admin/login`.
- **Chính Sách Đăng Ký:** Tính năng đăng ký tài khoản công khai bị vô hiệu hóa mặc định trên máy chủ. Mọi tài khoản quản trị viên được cấp phát thông qua công cụ dòng lệnh (CLI) nội bộ hoặc cơ sở dữ liệu khởi tạo.
- **Bảo Mật Phiên Làm Việc:** Phiên đăng nhập được duy trì bằng mã phiên bảo mật lưu trong cookie an toàn (`HttpOnly`, `SameSite=Strict`, `Secure`). Khi đăng xuất, mã phiên sẽ lập tức bị hủy bỏ trên máy chủ và hệ thống bộ nhớ đệm Redis.

## 3. Trình Soạn Thảo Bài Viết Markdown
Trình soạn thảo hỗ trợ giao diện hai khung song song: khung nhập liệu cú pháp Markdown bên trái và khung xem trước kết quả trực tiếp (Live Preview) bên phải.

### 3.1. Các Thao Tác Định Dạng Nhanh
- **In đậm:** Bôi đen văn bản và nhấn `Ctrl + B` hoặc chọn biểu tượng **B** (Cú pháp: `**nội dung**`).
- **In nghiêng:** Nhấn `Ctrl + I` hoặc biểu tượng *I* (Cú pháp: `*nội dung*`).
- **Tiêu đề phân cấp:** Sử dụng `#` cho Tiêu đề 1, `##` cho Tiêu đề 2, `###` cho Tiêu đề 3.
- **Danh sách:** Danh sách dấu chấm (`- `), danh sách số (`1. `), danh sách công việc (`- [ ] `).
- **Trích dẫn:** Đặt ký tự `> ` ở đầu đoạn văn bản.
- **Chèn liên kết:** Nhấn `Ctrl + K` hoặc sử dụng cú pháp `[Tên liên kết](URL)`.

### 3.2. Khối Mã Nguồn (Code Blocks)
Soạn thảo khối mã nguồn kèm định danh ngôn ngữ để kích hoạt tính năng tô màu cú pháp theo chuẩn bảng màu EFT Dark Theme:
````markdown
```rust
// Khối mã nguồn minh họa
fn main() {
    println!("Eternal Flame Tech");
}
```
````

### 3.3. Bảng Biểu & Chú Thích Chân Trang
- Bảng biểu được tạo bằng các thanh đứng `|` và đường phân cách ngang `---`.
- Chú thích chân trang sử dụng cú pháp `[^1]` trong bài viết và định nghĩa ở cuối bài `[^1]: Nội dung chú thích`.

## 4. Quản Lý Thông Tin Bài Viết (Frontmatter)
Mỗi bài viết bao gồm các trường thông tin cấu trúc sau:
- **Tiêu đề (Title):** Tên bài viết bằng tiếng Việt rõ ràng, cô đọng.
- **Đường dẫn (Slug):** Hệ thống tự động tạo slug chuẩn hóa từ tiêu đề tiếng Việt (bỏ dấu cách, chuyển chữ thường, loại bỏ dấu phụ, ví dụ: `gioi-thieu-eft-blog`). Quản trị viên có thể tinh chỉnh thủ công khi cần.
- **Ảnh bìa (Cover Image):** Đường dẫn ảnh đại diện bài viết từ Thư viện tài nguyên.
- **Mô tả ngắn (Excerpt):** Đoạn tóm tắt từ 140 - 160 ký tự, dùng cho thẻ hiển thị mạng xã hội và kết quả tìm kiếm.
- **Thẻ phân loại (Tags):** Các từ khóa chuyên môn phân cách bằng dấu phẩy.

## 5. Tải Lên & Quản Lý Tài Nguyên (Asset Library)
Thư viện tài nguyên cho phép quản trị viên tải lên hình ảnh và tài liệu minh họa phục vụ bài viết.

### 5.1. Quy Trình Tải Lên
- **Kéo & Thả:** Quản trị viên có thể kéo tệp ảnh trực tiếp từ máy tính thả vào khung soạn thảo hoặc dán ảnh trực tiếp từ bộ nhớ tạm (Clipboard).
- **Định Dạng Hỗ Trợ:** Hình ảnh (`.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif`) và tài liệu (`.pdf`).
- **Dung Lượng Tối Đa:** Mỗi tệp không vượt quá 10 MB.

### 5.2. Tối Ưu Hóa Tự Động & Chống Trùng Lặp
- **Khử Trùng Lặp Dữ Liệu:** Hệ thống tính toán mã băm SHA-256 của tệp. Nếu tệp tương tự đã tồn tại, hệ thống sẽ tái sử dụng tệp cũ nhằm tiết kiệm tài nguyên lưu trữ.
- **Chuyển Đổi WebP:** Các định dạng ảnh thông thường tự động được nén và chuyển đổi sang WebP để tối ưu tốc độ tải trang cho người đọc.
- **Đường Dẫn Cố Định:** Tệp tải lên trả về đường dẫn cố định dạng `/api/v2/assets/{hash}.webp` để chèn vào bài viết.

## 6. Lưu Nháp & Xuất Bản Bài Viết
- **Tự Động Lưu Nháp (Autosave):** Nội dung đang soạn thảo tự động được lưu vào bộ nhớ trình duyệt và đồng bộ về bản nháp máy chủ sau mỗi 30 giây không hoạt động.
- **Trạng Thái Bài Viết:**
  - `Nháp (Draft)`: Bài viết chỉ hiển thị với quản trị viên trong trang quản lý.
  - `Đã xuất bản (Published)`: Bài viết hiển thị công khai trên trang chủ, danh mục và luồng cấp tin RSS.
- **Thao Tác Xuất Bản:** Nhấn nút "Xuất bản" (Publish) trên thanh công cụ và xác nhận để đưa bài viết lên môi trường chính thức.
