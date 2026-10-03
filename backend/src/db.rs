// Logic: PostgreSQL database connection pool creation, migration execution, and initial seeding.
// Input: Application configuration and database URL.
// Output: Initialized PgPool instance.

use chrono::Utc;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    auth::hash_password,
    config::Config,
    error::AppError,
};

// Logic: Creates connection pool, executes migrations, and seeds default admin and welcome post if empty.
// Input: Config reference.
// Output: Initialized PgPool.
pub async fn init_db(config: &Config) -> Result<PgPool, AppError> {
    let pool = PgPoolOptions::new()
        .max_connections(20)
        .min_connections(2)
        .connect(&config.database_url)
        .await
        .map_err(|e| AppError::Internal(format!("Lỗi kết nối cơ sở dữ liệu: {e}")))?;

    // Run embedded migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|e| AppError::Internal(format!("Lỗi chạy database migrations: {e}")))?;

    // Check if users exist; if not, seed default admin and welcome post
    let user_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&pool)
        .await?;

    if user_count.0 == 0 {
        tracing::info!("Khởi tạo tài khoản quản trị mặc định và bài viết mẫu...");
        let admin_id = Uuid::new_v4();
        let password_hash = hash_password(&config.admin_default_password)?;

        sqlx::query(
            "INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, 'admin')"
        )
        .bind(admin_id)
        .bind(&config.admin_default_email)
        .bind(&password_hash)
        .bind(&config.admin_default_name)
        .execute(&pool)
        .await?;

        // Seed initial blog post
        let post_id = Uuid::new_v4();
        let slug = "chao-mung-den-voi-eternal-flame-tech-blog";
        let title = "Chào mừng đến với Eternal Flame Tech Blog - CLB AI & Robotics Chuyên Nguyễn Thị Minh Khai";
        let excerpt = "Khám phá các dự án nghiên cứu Trí Tuệ Nhân Tạo, chế tạo Robotics và các bài viết kỹ thuật chuyên sâu từ Câu lạc bộ Eternal Flame Tech.";
        let content = r#"# Chào Mừng Đến Với Eternal Flame Tech Blog

**Eternal Flame Tech (EFT)** là Câu lạc bộ Trí Tuệ Nhân Tạo và Robotics chính thức trực thuộc **Trường THPT Chuyên Nguyễn Thị Minh Khai, Cần Thơ**. 

Nền tảng EFT Blog được xây dựng nhằm mục đích:
1. **Chia sẻ kiến thức chuyên môn:** Các nghiên cứu về AI, Machine Learning, Computer Vision và Embedded Systems.
2. **Ghi lại hành trình nghiên cứu:** Báo cáo tiến độ các dự án robot thi đấu và sản phẩm công nghệ của thành viên.
3. **Thúc đẩy tinh thần học thuật:** Tạo sân chơi công nghệ cởi mở, kết nối học sinh và cộng đồng đam mê khoa học kỹ thuật.

---

## Kiến Trúc Nền Tảng Công Nghệ (Tech Stack)

Hệ thống EFT Blog được thiết kế theo tiêu chuẩn tối ưu hiệu năng và an toàn cao nhất:

| Thành phần | Công nghệ sử dụng | Mục đích |
| :--- | :--- | :--- |
| **Backend** | Rust (Axum, Tokio, Tower-HTTP) | Xử lý API tốc độ cao, nén Brotli, bộ nhớ siêu nhẹ |
| **Frontend** | Next.js, React, Tailwind CSS | Giao diện chuẩn EFT Dark Theme, hỗ trợ ISR |
| **Cơ sở dữ liệu** | PostgreSQL & Redis | Lưu trữ dữ liệu quan hệ và đệm Bincode nhị phân |
| **Hạ tầng** | Docker-First Architecture | Triển khai khép kín, an toàn tuyệt đối |

---

## Mã Nguồn Minh Họa

Dưới đây là một đoạn mã Rust Axum biểu diễn cách hệ thống nén dữ liệu tự động:

```rust
use tower_http::compression::CompressionLayer;

let app = Router::new()
    .nest("/api/v2", api_routes)
    .layer(CompressionLayer::new().br(true).gzip(true));
```

---

## Kế Hoạch Sắp Tới
- [x] Khởi tạo nền tảng EFT Blog với giao diện Precision Dark Theme.
- [ ] Công bố chuỗi bài viết hướng dẫn lập trình Thị giác máy tính (OpenCV & YOLO).
- [ ] Ra mắt chuyên mục Chế tạo Robot thi đấu dành cho thành viên mới.

*Cùng nhau giữ vững ngọn lửa nhiệt huyết khoa học công nghệ!*"#;

        sqlx::query(
            "INSERT INTO posts (id, slug, title, content, excerpt, status, published_at, author_id) VALUES ($1, $2, $3, $4, $5, 'published', $6, $7)"
        )
        .bind(post_id)
        .bind(slug)
        .bind(title)
        .bind(content)
        .bind(excerpt)
        .bind(Utc::now())
        .bind(admin_id)
        .execute(&pool)
        .await?;

        // Associate with initial tags
        let tag_ids: Vec<(Uuid,)> = sqlx::query_as(
            "SELECT id FROM tags WHERE slug IN ('tri-tue-nhan-tao', 'robotics', 'eft-club')"
        )
        .fetch_all(&pool)
        .await?;

        for tag_row in tag_ids {
            let _ = sqlx::query("INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
                .bind(post_id)
                .bind(tag_row.0)
                .execute(&pool)
                .await;
        }

        tracing::info!("Đã khởi tạo thành công tài khoản: {}", config.admin_default_email);
    }

    Ok(pool)
}
