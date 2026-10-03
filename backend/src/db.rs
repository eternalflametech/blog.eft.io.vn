// Logic: PostgreSQL database connection pool creation, migration execution, and admin initialization.
// Input: Application configuration and database URL.
// Output: Initialized PgPool instance.

use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    auth::hash_password,
    config::Config,
    error::AppError,
};

// Logic: Creates connection pool, executes migrations, and seeds default admin account if empty.
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

    // Check if users exist; if not, seed default admin account from configuration
    let user_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&pool)
        .await?;

    if user_count.0 == 0 {
        tracing::info!("Khởi tạo tài khoản quản trị mặc định...");
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

        tracing::info!("Đã khởi tạo thành công tài khoản quản trị: {}", config.admin_default_email);
    }

    Ok(pool)
}
