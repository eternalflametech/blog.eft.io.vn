// Logic: Public blog post query endpoints with Redis Cache-Aside optimization.
// Input: Path slug, query filters (page, limit, tag).
// Output: Paginated post summaries and detailed post views with tags.

use axum::{
    extract::{Path, Query, State},
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Utc};
use serde_json::json;
use uuid::Uuid;

use crate::{
    cache::{get_cached, set_cached},
    error::AppError,
    models::{PaginatedPosts, PostListItem, PostQueryFilter, PostWithDetails, Tag},
    state::SharedState,
};

#[derive(sqlx::FromRow)]
struct PostRow {
    id: Uuid,
    slug: String,
    title: String,
    excerpt: String,
    cover_image: Option<String>,
    status: String,
    published_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    author_name: String,
}

#[derive(sqlx::FromRow)]
struct TagRow {
    post_id: Uuid,
    tag_id: Uuid,
    name: String,
    slug: String,
}

// Logic: Fetches paginated published posts, filtering optionally by tag.
// Input: SharedState and PostQueryFilter.
// Output: PaginatedPosts JSON response.
pub async fn list_posts(
    State(state): State<SharedState>,
    Query(filter): Query<PostQueryFilter>,
) -> Result<impl IntoResponse, AppError> {
    let page = filter.page.unwrap_or(1).max(1);
    let limit = filter.limit.unwrap_or(10).clamp(1, 50);
    let offset = (page - 1) * limit;

    let cache_key = if filter.tag.is_none() && page == 1 && limit == 10 {
        Some("cache:posts:page:1".to_string())
    } else {
        None
    };

    let mut redis = state.redis.clone();
    if let Some(ref k) = cache_key {
        if let Some(cached) = get_cached::<PaginatedPosts>(&mut redis, k).await {
            return Ok(Json(cached));
        }
    }

    let (posts, total) = if let Some(ref tag_slug) = filter.tag {
        let total_count: (i64,) = sqlx::query_as(
            r#"SELECT COUNT(DISTINCT p.id) 
               FROM posts p 
               JOIN post_tags pt ON p.id = pt.post_id 
               JOIN tags t ON pt.tag_id = t.id 
               WHERE p.status = 'published' AND t.slug = $1"#
        )
        .bind(tag_slug)
        .fetch_one(&state.pool)
        .await?;

        let rows: Vec<PostRow> = sqlx::query_as(
            r#"SELECT p.id, p.slug, p.title, p.excerpt, p.cover_image, p.status, p.published_at, p.created_at, u.name as author_name 
               FROM posts p 
               JOIN users u ON p.author_id = u.id 
               JOIN post_tags pt ON p.id = pt.post_id 
               JOIN tags t ON pt.tag_id = t.id 
               WHERE p.status = 'published' AND t.slug = $1 
               ORDER BY p.published_at DESC NULLS LAST 
               LIMIT $2 OFFSET $3"#
        )
        .bind(tag_slug)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.pool)
        .await?;

        (rows, total_count.0)
    } else {
        let total_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM posts WHERE status = 'published'"
        )
        .fetch_one(&state.pool)
        .await?;

        let rows: Vec<PostRow> = sqlx::query_as(
            r#"SELECT p.id, p.slug, p.title, p.excerpt, p.cover_image, p.status, p.published_at, p.created_at, u.name as author_name 
               FROM posts p 
               JOIN users u ON p.author_id = u.id 
               WHERE p.status = 'published' 
               ORDER BY p.published_at DESC NULLS LAST 
               LIMIT $1 OFFSET $2"#
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.pool)
        .await?;

        (rows, total_count.0)
    };

    // Batch query tags for returned posts
    let post_ids: Vec<Uuid> = posts.iter().map(|p| p.id).collect();
    let mut tag_map: std::collections::HashMap<Uuid, Vec<Tag>> = std::collections::HashMap::new();

    if !post_ids.is_empty() {
        let tag_rows: Vec<TagRow> = sqlx::query_as(
            r#"SELECT pt.post_id, t.id as tag_id, t.name, t.slug 
               FROM post_tags pt 
               JOIN tags t ON pt.tag_id = t.id 
               WHERE pt.post_id = ANY($1)"#
        )
        .bind(&post_ids)
        .fetch_all(&state.pool)
        .await?;

        for tr in tag_rows {
            tag_map.entry(tr.post_id).or_default().push(Tag {
                id: tr.tag_id,
                name: tr.name,
                slug: tr.slug,
            });
        }
    }

    let items: Vec<PostListItem> = posts
        .into_iter()
        .map(|p| {
            let tags = tag_map.remove(&p.id).unwrap_or_default();
            PostListItem {
                id: p.id,
                slug: p.slug,
                title: p.title,
                excerpt: p.excerpt,
                cover_image: p.cover_image,
                status: p.status,
                published_at: p.published_at,
                author_name: p.author_name,
                tags,
                created_at: p.created_at,
            }
        })
        .collect();

    let total_pages = if total == 0 { 1 } else { (total + limit - 1) / limit };

    let result = PaginatedPosts {
        items,
        total,
        page,
        limit,
        total_pages,
    };

    if let Some(ref k) = cache_key {
        let _ = set_cached(&mut redis, k, &result, 60).await;
    }

    Ok(Json(result))
}

#[derive(sqlx::FromRow)]
struct SinglePostRow {
    id: Uuid,
    slug: String,
    title: String,
    content: String,
    excerpt: String,
    cover_image: Option<String>,
    status: String,
    published_at: Option<DateTime<Utc>>,
    author_id: Uuid,
    author_name: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

// Logic: Fetches single published post by slug with Redis Cache-Aside.
// Input: SharedState and post slug Path parameter.
// Output: PostWithDetails JSON response.
pub async fn get_post_by_slug(
    State(state): State<SharedState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let cache_key = format!("cache:post:{}", slug);
    let mut redis = state.redis.clone();

    if let Some(cached) = get_cached::<PostWithDetails>(&mut redis, &cache_key).await {
        return Ok(Json(cached));
    }

    let post_row: Option<SinglePostRow> = sqlx::query_as(
        r#"SELECT p.id, p.slug, p.title, p.content, p.excerpt, p.cover_image, p.status, p.published_at, 
                  p.author_id, u.name as author_name, p.created_at, p.updated_at 
           FROM posts p 
           JOIN users u ON p.author_id = u.id 
           WHERE p.slug = $1 AND p.status = 'published'"#
    )
    .bind(&slug)
    .fetch_optional(&state.pool)
    .await?;

    let post = post_row.ok_or_else(|| {
        AppError::NotFound("Không tìm thấy bài viết được yêu cầu".to_string())
    })?;

    let tags: Vec<Tag> = sqlx::query_as(
        r#"SELECT t.id, t.name, t.slug 
           FROM post_tags pt 
           JOIN tags t ON pt.tag_id = t.id 
           WHERE pt.post_id = $1"#
    )
    .bind(post.id)
    .fetch_all(&state.pool)
    .await?;

    let post_details = PostWithDetails {
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        cover_image: post.cover_image,
        status: post.status,
        published_at: post.published_at,
        author_id: post.author_id,
        author_name: post.author_name,
        tags,
        created_at: post.created_at,
        updated_at: post.updated_at,
    };

    let _ = set_cached(&mut redis, &cache_key, &post_details, 300).await;

    Ok(Json(post_details))
}

// Logic: Lists all existing tags with article counts.
// Input: SharedState.
// Output: JSON array of tags with count.
pub async fn list_tags(
    State(state): State<SharedState>,
) -> Result<impl IntoResponse, AppError> {
    #[derive(Serialize, sqlx::FromRow)]
    struct TagWithCount {
        id: Uuid,
        name: String,
        slug: String,
        post_count: i64,
    }

    use serde::Serialize;

    let tags: Vec<TagWithCount> = sqlx::query_as(
        r#"SELECT t.id, t.name, t.slug, COUNT(pt.post_id) as post_count 
           FROM tags t 
           LEFT JOIN post_tags pt ON t.id = pt.tag_id 
           LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published' 
           GROUP BY t.id, t.name, t.slug 
           ORDER BY post_count DESC, t.name ASC"#
    )
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(json!({
        "success": true,
        "tags": tags
    })))
}
