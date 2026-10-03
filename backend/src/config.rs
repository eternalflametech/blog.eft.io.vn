// Logic: Application configuration parsed from environment variables.
// Input: Environment variables from process.
// Output: Strongly-typed Config struct.

use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub session_secret: String,
    pub assets_dir: String,
    pub max_upload_size_bytes: usize,
    pub enable_public_registration: bool,
    pub admin_default_email: String,
    pub admin_default_password: String,
    pub admin_default_name: String,
}

impl Config {
    // Logic: Loads configuration variables with fallback defaults.
    // Input: None (reads from environment).
    // Output: Config instance.
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8080);

        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
            "postgres://postgres:postgres_secure_pass@postgres:5432/eft_blog".to_string()
        });

        let redis_url = env::var("REDIS_URL").unwrap_or_else(|_| "redis://redis:6379".to_string());

        let session_secret = env::var("SESSION_SECRET")
            .unwrap_or_else(|_| "change_me_to_a_random_32_byte_string_for_production".to_string());

        let assets_dir = env::var("ASSETS_DIR").unwrap_or_else(|_| "/data/assets".to_string());

        let max_upload_size_bytes = env::var("MAX_UPLOAD_SIZE_BYTES")
            .ok()
            .and_then(|s| s.parse().ok())
            .unwrap_or(10 * 1024 * 1024); // 10 MB

        let enable_public_registration = env::var("ENABLE_PUBLIC_REGISTRATION")
            .map(|v| v.eq_ignore_ascii_case("true") || v == "1")
            .unwrap_or(false);

        let admin_default_email = env::var("ADMIN_DEFAULT_EMAIL")
            .unwrap_or_else(|_| "admin@eft.io.vn".to_string());

        let admin_default_password = env::var("ADMIN_DEFAULT_PASSWORD")
            .unwrap_or_else(|_| "admin123456_ChangeMeInProd!".to_string());

        let admin_default_name = env::var("ADMIN_DEFAULT_NAME")
            .unwrap_or_else(|_| "Quản Trị Viên EFT".to_string());

        Self {
            port,
            database_url,
            redis_url,
            session_secret,
            assets_dir,
            max_upload_size_bytes,
            enable_public_registration,
            admin_default_email,
            admin_default_password,
            admin_default_name,
        }
    }
}
