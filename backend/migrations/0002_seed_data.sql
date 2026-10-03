-- Migration: 0002_seed_data.sql
-- Logic: Inserts initial core tags for EFT Blog.

INSERT INTO tags (id, name, slug) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Trí Tuệ Nhân Tạo', 'tri-tue-nhan-tao'),
    ('a0000000-0000-0000-0000-000000000002', 'Robotics', 'robotics'),
    ('a0000000-0000-0000-0000-000000000003', 'Tin Học Trẻ', 'tin-hoc-tre'),
    ('a0000000-0000-0000-0000-000000000004', 'EFT Club', 'eft-club'),
    ('a0000000-0000-0000-0000-000000000005', 'Học Thuật & Nghiên Cứu', 'hoc-thuat-nghien-cuu')
ON CONFLICT (slug) DO NOTHING;
