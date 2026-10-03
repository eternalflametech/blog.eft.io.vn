// Logic: Authentication endpoints (login, logout, me, register).
// Input: Credentials, session tokens, and registration payloads.
// Output: Session cookies, user profile responses, or status errors.

use axum::{
    extract::State,
    http::{header::SET_COOKIE, HeaderMap, HeaderValue, StatusCode},
    response::IntoResponse,
    Json,
};
use serde_json::json;

use crate::{
    auth::{
        create_session, destroy_session, hash_password, middleware::RequireAdmin,
        verify_password, SESSION_COOKIE_NAME,
    },
    error::AppError,
    models::{LoginRequest, RegisterRequest, User, UserResponse},
    state::SharedState,
};

// Logic: Authenticates administrator credentials and issues session cookie.
// Input: SharedState and LoginRequest JSON payload.
// Output: HTTP response with Set-Cookie header and UserResponse JSON.
pub async fn login(
    State(state): State<SharedState>,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, name, role, created_at, updated_at FROM users WHERE email = $1"
    )
    .bind(payload.email.trim())
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Thông tin đăng nhập không hợp lệ".to_string()))?;

    let is_valid = verify_password(&payload.password, &user.password_hash)?;
    if !is_valid {
        return Err(AppError::Unauthorized("Thông tin đăng nhập không hợp lệ".to_string()));
    }

    let user_resp = UserResponse::from(user);
    let mut redis = state.redis.clone();
    let token = create_session(&mut redis, &user_resp).await?;

    let cookie_val = format!(
        "{}={}; HttpOnly; Path=/; SameSite=Strict; Max-Age={}",
        SESSION_COOKIE_NAME, token, 7 * 24 * 60 * 60
    );

    let mut headers = HeaderMap::new();
    headers.insert(SET_COOKIE, HeaderValue::from_str(&cookie_val).map_err(|e| {
        AppError::Internal(format!("Lỗi tạo Header cookie: {e}"))
    })?);

    Ok((
        StatusCode::OK,
        headers,
        Json(json!({
            "success": true,
            "user": user_resp,
            "token": token
        })),
    ))
}

// Logic: Terminates user session and clears authentication cookie.
// Input: SharedState and HTTP headers.
// Output: Cleared Set-Cookie header.
pub async fn logout(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    let mut token = None;

    if let Some(cookie_header) = headers.get(axum::http::header::COOKIE) {
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

    if let Some(tok) = token {
        let mut redis = state.redis.clone();
        let _ = destroy_session(&mut redis, &tok).await;
    }

    let cookie_val = format!(
        "{}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0",
        SESSION_COOKIE_NAME
    );

    let mut resp_headers = HeaderMap::new();
    resp_headers.insert(SET_COOKIE, HeaderValue::from_str(&cookie_val).map_err(|e| {
        AppError::Internal(format!("Lỗi tạo Header cookie: {e}"))
    })?);

    Ok((
        StatusCode::OK,
        resp_headers,
        Json(json!({ "success": true, "message": "Đã đăng xuất thành công" })),
    ))
}

// Logic: Returns currently authenticated administrator user profile.
// Input: RequireAdmin extractor.
// Output: UserResponse JSON.
pub async fn me(
    RequireAdmin(user): RequireAdmin,
) -> impl IntoResponse {
    Json(json!({
        "success": true,
        "user": user
    }))
}

// Logic: Handles user registration guarded by ENABLE_PUBLIC_REGISTRATION toggle.
// Input: SharedState and RegisterRequest JSON payload.
// Output: Created UserResponse or 403 Forbidden.
pub async fn register(
    State(state): State<SharedState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<impl IntoResponse, AppError> {
    if !state.config.enable_public_registration {
        return Err(AppError::Forbidden(
            "Tính năng đăng ký tài khoản công khai bị vô hiệu hóa trên máy chủ".to_string(),
        ));
    }

    let password_hash = hash_password(&payload.password)?;
    let user_id = uuid::Uuid::new_v4();

    sqlx::query(
        "INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, 'admin')"
    )
    .bind(user_id)
    .bind(payload.email.trim())
    .bind(&password_hash)
    .bind(payload.name.trim())
    .execute(&state.pool)
    .await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "success": true,
            "message": "Đăng ký tài khoản thành công"
        })),
    ))
}
