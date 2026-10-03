// Logic: Main backend application entry point initializing database, cache, middleware, and HTTP listener.
// Input: Environment configuration.
// Output: Running Axum HTTP server with graceful shutdown.

pub mod auth;
pub mod cache;
pub mod config;
pub mod db;
pub mod error;
pub mod models;
pub mod routes;
pub mod services;
pub mod state;

use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::compression::CompressionLayer;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::{
    config::Config,
    db::init_db,
    routes::create_router,
    state::AppState,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize structured logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,eft_backend=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env();
    tracing::info!("Khởi động EFT Backend trên cổng {}", config.port);

    // Initialize database and execute migrations
    let pool = init_db(&config).await.map_err(|e| {
        tracing::error!("Khởi tạo database thất bại: {e}");
        e
    })?;

    // Initialize Redis cache connection manager
    let redis_client = redis::Client::open(config.redis_url.as_str())?;
    let redis_conn = redis_client
        .get_connection_manager()
        .await
        .map_err(|e| {
            tracing::error!("Kết nối Redis thất bại: {e}");
            e
        })?;

    let shared_state = Arc::new(AppState {
        pool,
        redis: redis_conn,
        config: config.clone(),
    });

    // Configure CORS policy
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build application router with Tower-HTTP compression and tracing
    let app = create_router()
        .layer(CompressionLayer::new().br(true).gzip(true))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(shared_state);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    let listener = TcpListener::bind(addr).await?;
    tracing::info!("Hệ thống EFT Backend đang lắng nghe tại http://{}", addr);

    // Serve with graceful shutdown
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

// Logic: Listens for OS termination signals (SIGINT, SIGTERM) to initiate graceful shutdown.
// Input: None.
// Output: Completion of shutdown signal future.
async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Lỗi lắng nghe tín hiệu Ctrl+C");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("Lỗi cài đặt bộ xử lý tín hiệu SIGTERM")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Nhận tín hiệu dừng Ctrl+C, tiến hành tắt dịch vụ an toàn...");
        },
        _ = terminate => {
            tracing::info!("Nhận tín hiệu dừng SIGTERM, tiến hành tắt dịch vụ an toàn...");
        },
    }
}
