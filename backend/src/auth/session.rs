// Logic: User session lifecycle management in Redis cache.
// Input: User entity, session tokens, and connection manager.
// Output: Session token strings, UserResponse instances, or deletion status.

use redis::aio::ConnectionManager;
use uuid::Uuid;

use crate::{
    cache::{delete_cached, get_cached, set_cached},
    error::AppError,
    models::UserResponse,
};

pub const SESSION_COOKIE_NAME: &str = "eft_session";
pub const SESSION_TTL_SECONDS: u64 = 7 * 24 * 60 * 60; // 7 days

// Logic: Generates a session token and stores serialized user session in Redis.
// Input: Mutable Redis connection manager and UserResponse.
// Output: Unique session token string.
pub async fn create_session(
    conn: &mut ConnectionManager,
    user: &UserResponse,
) -> Result<String, AppError> {
    let token = Uuid::new_v4().to_string();
    let key = format!("session:{token}");
    set_cached(conn, &key, user, SESSION_TTL_SECONDS).await?;
    Ok(token)
}

// Logic: Retrieves active user session from Redis by token.
// Input: Mutable Redis connection manager and token slice.
// Output: Option<UserResponse>.
pub async fn get_session(
    conn: &mut ConnectionManager,
    token: &str,
) -> Option<UserResponse> {
    let key = format!("session:{token}");
    get_cached::<UserResponse>(conn, &key).await
}

// Logic: Invalidates and destroys a session in Redis.
// Input: Mutable Redis connection manager and token slice.
// Output: Result indicating removal status.
pub async fn destroy_session(
    conn: &mut ConnectionManager,
    token: &str,
) -> Result<(), AppError> {
    let key = format!("session:{token}");
    delete_cached(conn, &key).await
}

// Logic: Updates active user session in Redis.
// Input: Mutable Redis connection manager, token slice, and UserResponse reference.
// Output: Result indicating session cache update status.
pub async fn update_session(
    conn: &mut ConnectionManager,
    token: &str,
    user: &UserResponse,
) -> Result<(), AppError> {
    let key = format!("session:{token}");
    set_cached(conn, &key, user, SESSION_TTL_SECONDS).await
}
