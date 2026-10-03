// Logic: Data representations for Tag entity.
// Input: Database rows or JSON payloads.
// Output: Strongly-typed Tag models.

use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Tag {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTagRequest {
    pub name: String,
}
