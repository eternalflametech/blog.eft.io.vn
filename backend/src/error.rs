// Logic: Centralized application error handling and HTTP response generation.
// Input: Various domain and library errors.
// Output: Standard HTTP status codes and JSON error responses.

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    Database(sqlx::Error),
    Redis(redis::RedisError),
    Unauthorized(String),
    Forbidden(String),
    NotFound(String),
    BadRequest(String),
    PayloadTooLarge(String),
    UnsupportedMediaType(String),
    Internal(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Database(e) => write!(f, "Database error: {e}"),
            Self::Redis(e) => write!(f, "Redis error: {e}"),
            Self::Unauthorized(msg) => write!(f, "Unauthorized: {msg}"),
            Self::Forbidden(msg) => write!(f, "Forbidden: {msg}"),
            Self::NotFound(msg) => write!(f, "Not Found: {msg}"),
            Self::BadRequest(msg) => write!(f, "Bad Request: {msg}"),
            Self::PayloadTooLarge(msg) => write!(f, "Payload Too Large: {msg}"),
            Self::UnsupportedMediaType(msg) => write!(f, "Unsupported Media Type: {msg}"),
            Self::Internal(msg) => write!(f, "Internal Server Error: {msg}"),
        }
    }
}

impl std::error::Error for AppError {}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        Self::Database(err)
    }
}

impl From<redis::RedisError> for AppError {
    fn from(err: redis::RedisError) -> Self {
        Self::Redis(err)
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        Self::Internal(err.to_string())
    }
}

impl IntoResponse for AppError {
    // Logic: Maps AppError variants to HTTP status code and JSON error payload.
    // Input: &self.
    // Output: Axum HTTP Response.
    fn into_response(self) -> Response {
        let (status, message) = match self {
            Self::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg),
            Self::Forbidden(msg) => (StatusCode::FORBIDDEN, msg),
            Self::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            Self::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            Self::PayloadTooLarge(msg) => (StatusCode::PAYLOAD_TOO_LARGE, msg),
            Self::UnsupportedMediaType(msg) => (StatusCode::UNSUPPORTED_MEDIA_TYPE, msg),
            Self::Database(e) => {
                tracing::error!("Database query failed: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Lỗi cơ sở dữ liệu nội bộ".to_string(),
                )
            }
            Self::Redis(e) => {
                tracing::error!("Redis cache error: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Lỗi bộ nhớ đệm nội bộ".to_string(),
                )
            }
            Self::Internal(msg) => {
                tracing::error!("Internal error: {}", msg);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Lỗi xử lý hệ thống nội bộ".to_string(),
                )
            }
        };

        let body = Json(json!({
            "success": false,
            "error": message,
            "code": status.as_u16()
        }));

        (status, body).into_response()
    }
}
