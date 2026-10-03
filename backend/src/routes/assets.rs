// Logic: Asset upload handling and static asset serving with caching headers.
// Input: Multipart file payloads and filename path parameters.
// Output: Stored AssetUploadResponse metadata or cached binary file streams.

use axum::{
    extract::{Multipart, Path, State},
    http::{header::{CACHE_CONTROL, CONTENT_TYPE}, HeaderMap, HeaderValue, StatusCode},
    response::IntoResponse,
    Json,
};

use crate::{
    auth::middleware::RequireAdmin,
    error::AppError,
    services::process_and_store_asset,
    state::SharedState,
};

// Logic: Uploads and optimizes asset file payload, restricted to authenticated administrators.
// Input: SharedState, RequireAdmin extractor, Multipart form stream.
// Output: Created AssetUploadResponse JSON.
pub async fn upload_asset(
    State(state): State<SharedState>,
    RequireAdmin(user): RequireAdmin,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, AppError> {
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("Lỗi đọc multipart payload: {e}")))?
    {
        let filename = field
            .file_name()
            .unwrap_or("asset.bin")
            .to_string();

        let bytes = field
            .bytes()
            .await
            .map_err(|e| AppError::BadRequest(format!("Lỗi đọc byte dữ liệu: {e}")))?;

        if bytes.len() > state.config.max_upload_size_bytes {
            return Err(AppError::PayloadTooLarge(format!(
                "Dung lượng tệp vượt quá giới hạn tối đa {} MB",
                state.config.max_upload_size_bytes / (1024 * 1024)
            )));
        }

        let resp = process_and_store_asset(
            &state.pool,
            &state.config.assets_dir,
            &filename,
            &bytes,
            user.id,
        )
        .await?;

        return Ok((StatusCode::CREATED, Json(resp)));
    }

    Err(AppError::BadRequest("Không tìm thấy tệp tải lên hợp lệ".to_string()))
}

// Logic: Serves stored static asset with immutable HTTP cache headers.
// Input: SharedState and filename Path parameter.
// Output: Raw file bytes with MIME and Cache-Control headers.
pub async fn serve_asset(
    State(state): State<SharedState>,
    Path(filename): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    // Guard against path traversal attempts
    if filename.contains('/') || filename.contains('\\') || filename.contains("..") {
        return Err(AppError::Forbidden("Đường dẫn tệp không hợp lệ".to_string()));
    }

    let filepath = format!("{}/{}", state.config.assets_dir, filename);
    let bytes = tokio::fs::read(&filepath).await.map_err(|_| {
        AppError::NotFound("Không tìm thấy tệp tài nguyên được yêu cầu".to_string())
    })?;

    let ext = std::path::Path::new(&filename)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");

    let mime = match ext {
        "webp" => "image/webp",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "svg" => "image/svg+xml",
        "pdf" => "application/pdf",
        _ => "application/octet-stream",
    };

    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static(mime));
    headers.insert(
        CACHE_CONTROL,
        HeaderValue::from_static("public, max-age=31536000, immutable"),
    );

    Ok((StatusCode::OK, headers, bytes))
}
