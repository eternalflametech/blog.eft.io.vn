// Logic: Data representations for Post entity, queries, and mutation payloads.
// Input: Database rows or JSON payloads.
// Output: Strongly-typed Post models.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use super::tag::Tag;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Post {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub content: String,
    pub excerpt: String,
    pub cover_image: Option<String>,
    pub status: String,
    pub published_at: Option<DateTime<Utc>>,
    pub author_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostWithDetails {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub content: String,
    pub excerpt: String,
    pub cover_image: Option<String>,
    pub status: String,
    pub published_at: Option<DateTime<Utc>>,
    pub author_id: Uuid,
    pub author_name: String,
    pub tags: Vec<Tag>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostListItem {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub excerpt: String,
    pub cover_image: Option<String>,
    pub status: String,
    pub published_at: Option<DateTime<Utc>>,
    pub author_name: String,
    pub tags: Vec<Tag>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedPosts {
    pub items: Vec<PostListItem>,
    pub total: i64,
    pub page: i64,
    pub limit: i64,
    pub total_pages: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreatePostRequest {
    pub title: String,
    pub slug: Option<String>,
    pub content: String,
    pub excerpt: String,
    pub cover_image: Option<String>,
    pub status: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePostRequest {
    pub title: Option<String>,
    pub slug: Option<String>,
    pub content: Option<String>,
    pub excerpt: Option<String>,
    pub cover_image: Option<String>,
    pub status: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct PostQueryFilter {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub tag: Option<String>,
    pub status: Option<String>,
}
