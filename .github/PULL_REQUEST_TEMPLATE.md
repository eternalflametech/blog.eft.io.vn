## Mô tả thay đổi / Description of Changes
<!-- Tóm tắt ngắn gọn mục tiêu và những thay đổi trong Pull Request này. / Brief summary of changes. -->

## Loại thay đổi / Type of Change
- [ ] 🐛 Bug fix (sửa lỗi không gây xung đột)
- [ ] ✨ New feature (tính năng mới)
- [ ] ♻️ Refactoring (tái cấu trúc mã nguồn)
- [ ] ⚡ Performance (tối ưu hóa hiệu năng)
- [ ] 📝 Documentation (cập nhật tài liệu)
- [ ] 🔒 Security (nâng cấp an ninh bảo mật)

## Checklist Tiêu chuẩn Kỹ thuật / Engineering Checklist
- [ ] **Docker-First:** Toàn bộ ứng dụng build và chạy sạch sẽ trong Docker Compose mà không yêu cầu runtime trên host máy chủ.
- [ ] **Kiểm thử tự động:** Đã chạy và vượt qua 100% test suite (`docker compose run --rm backend cargo test`, `npm test`, lints).
- [ ] **Bình luận mã nguồn (Strict Comments):** Mọi ghi chú trong code CHỈ mô tả (a) logic, (b) input, và (c) output; không có nhận xét dư thừa.
- [ ] **Không hardcode:** Không chứa URL tĩnh, secret, mật khẩu hay timestamp cứng.
- [ ] **Tailwind Tokens:** Giao diện tuân thủ bảng màu EFT Precision Dark Theme (`zinc-950`, `zinc-925`, `violet-600`, `rose-600`).
- [ ] **Ký số SSH:** Commit được ký số mật mã học bằng SSH key (`git log -1 --show-signature`).

## Kiểm thử thực tế & Ảnh chụp / Verification & Screenshots
<!-- Đính kèm kết quả test, curl output hoặc ảnh chụp giao diện / Attach verification output or screenshots -->
