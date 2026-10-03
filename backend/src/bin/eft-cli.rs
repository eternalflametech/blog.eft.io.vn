// Logic: Command-line management tool for administrative account provisioning and password reset.
// Input: CLI subcommands, flags, and database connection string.
// Output: Created or updated administrator records in PostgreSQL.

use clap::{Args, Parser, Subcommand};
use sqlx::postgres::PgPoolOptions;
use uuid::Uuid;

#[derive(Parser)]
#[command(name = "eft-cli")]
#[command(about = "Eternal Flame Tech Blog Administration CLI", long_about = None)]
struct Cli {
    #[arg(short, long)]
    database_url: Option<String>,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Admin(AdminArgs),
}

#[derive(Args)]
struct AdminArgs {
    #[command(subcommand)]
    action: AdminAction,
}

#[derive(Subcommand)]
enum AdminAction {
    Create {
        #[arg(short, long)]
        email: String,
        #[arg(short, long)]
        password: String,
        #[arg(short, long)]
        name: String,
    },
    ResetPassword {
        #[arg(short, long)]
        email: String,
        #[arg(short, long)]
        password: String,
    },
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let cli = Cli::parse();

    let db_url = cli.database_url.unwrap_or_else(|| {
        std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:postgres_secure_pass@localhost:5432/eft_blog".into())
    });

    let pool = PgPoolOptions::new()
        .max_connections(2)
        .connect(&db_url)
        .await?;

    match cli.command {
        Commands::Admin(admin_args) => match admin_args.action {
            AdminAction::Create { email, password, name } => {
                let salt = argon2::password_hash::SaltString::generate(&mut argon2::password_hash::rand_core::OsRng);
                let password_hash = argon2::Argon2::default()
                    .hash_password(password.as_bytes(), &salt)
                    .map_err(|e| format!("Hashing error: {e}"))?
                    .to_string();

                let id = Uuid::new_v4();
                sqlx::query(
                    "INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, 'admin')"
                )
                .bind(id)
                .bind(email.trim())
                .bind(&password_hash)
                .bind(name.trim())
                .execute(&pool)
                .await?;

                println!("Đã tạo tài khoản quản trị viên thành công: {email} (ID: {id})");
            }
            AdminAction::ResetPassword { email, password } => {
                let salt = argon2::password_hash::SaltString::generate(&mut argon2::password_hash::rand_core::OsRng);
                let password_hash = argon2::Argon2::default()
                    .hash_password(password.as_bytes(), &salt)
                    .map_err(|e| format!("Hashing error: {e}"))?
                    .to_string();

                let result = sqlx::query(
                    "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2"
                )
                .bind(&password_hash)
                .bind(email.trim())
                .execute(&pool)
                .await?;

                if result.rows_affected() == 0 {
                    eprintln!("Không tìm thấy tài khoản với email: {email}");
                    std::process::exit(1);
                } else {
                    println!("Đã đổi mật khẩu cho tài khoản: {email}");
                }
            }
        },
    }

    Ok(())
}
use argon2::PasswordHasher;
