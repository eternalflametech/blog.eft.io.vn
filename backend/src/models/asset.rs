// Logic: Data representations for Asset entity and upload responses.
// Input: Database rows or file upload metadata.
// Output: Strongly-typed Asset models.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Asset {
    pub id: Uuid,
    pub sha256: String,
    pub filename: String,
    pub mime_type: String,
    pub size_bytes: i64,
    pub storage_path: String,
    pub uploaded_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetUploadResponse {
    pub id: Uuid,
    pub sha256: String,
    pub url: String,
    pub filename: String,
    pub mime_type: String,
    pub size_bytes: i64,
    pub deduplicated: bool,
}
