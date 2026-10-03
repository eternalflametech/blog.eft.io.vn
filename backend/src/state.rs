// Logic: Application shared state accessible across Axum handlers.
// Input: Initialized PgPool, Redis ConnectionManager, and Config.
// Output: AppState struct wrapped in Arc.

use std::sync::Arc;
use redis::aio::ConnectionManager;
use sqlx::PgPool;

use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub redis: ConnectionManager,
    pub config: Config,
}

pub type SharedState = Arc<AppState>;
