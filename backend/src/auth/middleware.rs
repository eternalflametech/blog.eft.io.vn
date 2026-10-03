// Logic: Axum extractor enforcing administrator authentication on protected routes.
// Input: HTTP request parts and shared application state.
// Output: RequireAdmin wrapper containing validated UserResponse or AppError rejection.

use axum::{
    extract::FromRequestParts,
    http::request::Parts,
};

use crate::{
    auth::session::{get_session, SESSION_COOKIE_NAME},
    error::AppError,
    models::UserResponse,
    state::SharedState,
};

async fn extract_authenticated_user(
    parts: &mut Parts,
    state: &SharedState,
) -> Result<UserResponse, AppError> {
    let mut token = None;

    // Extract from Cookie header
    if let Some(cookie_header) = parts.headers.get(axum::http::header::COOKIE) {
        if let Ok(cookie_str) = cookie_header.to_str() {
            for pair in cookie_str.split(';') {
                let mut kv = pair.trim().splitn(2, '=');
                if let (Some(k), Some(v)) = (kv.next(), kv.next()) {
                    if k == SESSION_COOKIE_NAME {
                        token = Some(v.to_string());
                        break;
                    }
                }
            }
        }
    }

    // Extract from Authorization header if Cookie is absent
    if token.is_none() {
        if let Some(auth_header) = parts.headers.get(axum::http::header::AUTHORIZATION) {
            if let Ok(auth_str) = auth_header.to_str() {
                if let Some(stripped) = auth_str.strip_prefix("Bearer ") {
                    token = Some(stripped.trim().to_string());
                }
            }
        }
    }

    let token = token.ok_or_else(|| {
        AppError::Unauthorized("Yêu cầu phiên đăng nhập".to_string())
    })?;

    let mut redis = state.redis.clone();
    let user = get_session(&mut redis, &token).await.ok_or_else(|| {
        AppError::Unauthorized("Phiên đăng nhập đã hết hạn hoặc không hợp lệ".to_string())
    })?;

    Ok(user)
}

pub struct RequireAuth(pub UserResponse);

impl FromRequestParts<SharedState> for RequireAuth {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &SharedState,
    ) -> Result<Self, Self::Rejection> {
        let user = extract_authenticated_user(parts, state).await?;
        Ok(RequireAuth(user))
    }
}

pub struct RequireEditor(pub UserResponse);

impl FromRequestParts<SharedState> for RequireEditor {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &SharedState,
    ) -> Result<Self, Self::Rejection> {
        let user = extract_authenticated_user(parts, state).await?;
        if user.role != "admin" && user.role != "editor" {
            return Err(AppError::Forbidden(
                "Yêu cầu quyền Biên tập viên hoặc Quản trị viên".to_string(),
            ));
        }
        Ok(RequireEditor(user))
    }
}

pub struct RequireAdmin(pub UserResponse);

impl FromRequestParts<SharedState> for RequireAdmin {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &SharedState,
    ) -> Result<Self, Self::Rejection> {
        let user = extract_authenticated_user(parts, state).await?;
        if user.role != "admin" {
            return Err(AppError::Forbidden(
                "Tài khoản không có quyền Quản trị viên cao nhất".to_string(),
            ));
        }
        Ok(RequireAdmin(user))
    }
}
