// Logic: File upload validation, magic byte checking, SHA-256 deduplication, and WebP optimization.
// Input: Raw uploaded byte buffers, original filenames, admin user ID.
// Output: Stored Asset models and API response metadata.

use std::io::Cursor;
use std::path::Path;
use sha2::{Digest, Sha256};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{Asset, AssetUploadResponse},
};

#[derive(Debug)]
pub enum DetectedFormat {
    Png,
    Jpeg,
    WebP,
    Svg,
    Pdf,
}

// Logic: Inspects buffer header magic bytes to detect allowed file MIME formats.
// Input: Raw byte slice.
// Output: Result<DetectedFormat, AppError>.
pub fn detect_mime_type(bytes: &[u8]) -> Result<DetectedFormat, AppError> {
    if bytes.len() < 8 {
        return Err(AppError::BadRequest("Tệp dữ liệu quá ngắn".to_string()));
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if bytes.starts_with(&[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) {
        return Ok(DetectedFormat::Png);
    }

    // JPEG: FF D8 FF
    if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
        return Ok(DetectedFormat::Jpeg);
    }

    // WebP: RIFF .... WEBP
    if bytes.starts_with(b"RIFF") && bytes.len() >= 12 && &bytes[8..12] == b"WEBP" {
        return Ok(DetectedFormat::WebP);
    }

    // PDF: %PDF-
    if bytes.starts_with(b"%PDF-") {
        return Ok(DetectedFormat::Pdf);
    }

    // SVG: Text XML starting with <svg or <?xml
    if let Ok(text) = std::str::from_utf8(&bytes[..bytes.len().min(1024)]) {
        let trimmed = text.trim_start();
        if trimmed.starts_with("<svg") || (trimmed.starts_with("<?xml") && trimmed.contains("<svg")) {
            return Ok(DetectedFormat::Svg);
        }
    }

    Err(AppError::UnsupportedMediaType(
        "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận PNG, JPEG, WebP, SVG, PDF.".to_string(),
    ))
}

// Logic: Processes, deduplicates, optimizes, and stores an uploaded asset.
// Input: PgPool, storage directory path, original filename, byte payload, admin user ID.
// Output: AssetUploadResponse metadata.
pub async fn process_and_store_asset(
    pool: &PgPool,
    assets_dir: &str,
    original_filename: &str,
    raw_bytes: &[u8],
    user_id: Uuid,
) -> Result<AssetUploadResponse, AppError> {
    let format = detect_mime_type(raw_bytes)?;

    // Ensure assets directory exists
    tokio::fs::create_dir_all(assets_dir)
        .await
        .map_err(|e| AppError::Internal(format!("Lỗi tạo thư mục lưu trữ: {e}")))?;

    // Calculate SHA-256 hash of incoming raw bytes
    let mut hasher = Sha256::new();
    hasher.update(raw_bytes);
    let hash_hex = format!("{:x}", hasher.finalize());

    // Deduplication check: verify if asset already exists in PostgreSQL
    let existing: Option<Asset> = sqlx::query_as::<_, Asset>(
        "SELECT id, sha256, filename, mime_type, size_bytes, storage_path, uploaded_by, created_at FROM assets WHERE sha256 = $1"
    )
    .bind(&hash_hex)
    .fetch_optional(pool)
    .await?;

    if let Some(asset) = existing {
        let ext = Path::new(&asset.storage_path)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("webp");
        return Ok(AssetUploadResponse {
            id: asset.id,
            sha256: asset.sha256.clone(),
            url: format!("/api/v2/assets/{}.{}", asset.sha256, ext),
            filename: asset.filename,
            mime_type: asset.mime_type,
            size_bytes: asset.size_bytes,
            deduplicated: true,
        });
    }

    // Process & optimize: convert raster images to WebP and strip EXIF
    let (final_bytes, mime_type, extension) = match format {
        DetectedFormat::Png | DetectedFormat::Jpeg => {
            let img = image::load_from_memory(raw_bytes)
                .map_err(|e| AppError::BadRequest(format!("Lỗi giải mã hình ảnh: {e}")))?;

            // Downscale oversized images exceeding 2560px width
            let processed_img = if img.width() > 2560 {
                img.resize(2560, 2560, image::imageops::FilterType::Lanczos3)
            } else {
                img
            };

            let mut webp_buf = Cursor::new(Vec::new());
            match processed_img.write_to(&mut webp_buf, image::ImageFormat::WebP) {
                Ok(_) => (webp_buf.into_inner(), "image/webp".to_string(), "webp"),
                Err(_) => {
                    // Fallback to storing raw bytes if WebP encoding unavailable
                    let ext = if matches!(format, DetectedFormat::Png) { "png" } else { "jpg" };
                    let mime = if matches!(format, DetectedFormat::Png) { "image/png" } else { "image/jpeg" };
                    (raw_bytes.to_vec(), mime.to_string(), ext)
                }
            }
        }
        DetectedFormat::WebP => (raw_bytes.to_vec(), "image/webp".to_string(), "webp"),
        DetectedFormat::Svg => (raw_bytes.to_vec(), "image/svg+xml".to_string(), "svg"),
        DetectedFormat::Pdf => (raw_bytes.to_vec(), "application/pdf".to_string(), "pdf"),
    };

    let filename = format!("{hash_hex}.{extension}");
    let storage_path = format!("{assets_dir}/{filename}");

    // Write file to filesystem asynchronously
    tokio::fs::write(&storage_path, &final_bytes)
        .await
        .map_err(|e| AppError::Internal(format!("Lỗi ghi tệp lưu trữ: {e}")))?;

    let asset_id = Uuid::new_v4();
    let size_bytes = final_bytes.len() as i64;

    // Record asset in database
    sqlx::query(
        "INSERT INTO assets (id, sha256, filename, mime_type, size_bytes, storage_path, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7)"
    )
    .bind(asset_id)
    .bind(&hash_hex)
    .bind(original_filename)
    .bind(&mime_type)
    .bind(size_bytes)
    .bind(&storage_path)
    .bind(user_id)
    .execute(pool)
    .await?;

    // Record audit log
    let _ = sqlx::query(
        "INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5, $6)"
    )
    .bind(Uuid::new_v4())
    .bind(user_id)
    .bind("upload_asset")
    .bind("asset")
    .bind(asset_id.to_string())
    .bind(serde_json::json!({
        "sha256": hash_hex,
        "filename": original_filename,
        "size_bytes": size_bytes,
        "mime_type": mime_type
    }))
    .execute(pool)
    .await;

    Ok(AssetUploadResponse {
        id: asset_id,
        sha256: hash_hex.clone(),
        url: format!("/api/v2/assets/{filename}"),
        filename: original_filename.to_string(),
        mime_type,
        size_bytes,
        deduplicated: false,
    })
}
