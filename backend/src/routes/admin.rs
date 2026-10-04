// Logic: Administrator CRUD operations on blog posts and asset metadata.
// Input: Post mutation requests and Path UUID parameters.
// Output: Created, updated, or deleted Post objects and audit logs.

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use serde_json::json;
use uuid::Uuid;

use crate::{
    auth::{hash_password, RequireAdmin, RequireAuth, RequireEditor},
    cache::invalidate_pattern,
    error::AppError,
    models::{
        Asset, CreatePostRequest, CreateUserRequest, Post, PostListItem, PostWithDetails, Tag,
        UpdatePostRequest, UpdateUserRequest, User, UserResponse,
    },
    services::generate_slug,
    state::SharedState,
};

// Logic: Lists all posts (both drafts and published) for administration view.
// Input: SharedState and RequireAuth extractor.
// Output: JSON array of PostListItem.
pub async fn admin_list_posts(
    State(state): State<SharedState>,
    RequireAuth(_user): RequireAuth,
) -> Result<impl IntoResponse, AppError> {
    #[derive(sqlx::FromRow)]
    struct AdminPostRow {
        id: Uuid,
        slug: String,
        title: String,
        excerpt: String,
        cover_image: Option<String>,
        status: String,
        published_at: Option<chrono::DateTime<Utc>>,
        created_at: chrono::DateTime<Utc>,
        author_name: String,
    }

    let rows: Vec<AdminPostRow> = sqlx::query_as(
        r#"SELECT p.id, p.slug, p.title, p.excerpt, p.cover_image, p.status, p.published_at, p.created_at, u.name as author_name 
           FROM posts p 
           JOIN users u ON p.author_id = u.id 
           ORDER BY p.created_at DESC"#
    )
    .fetch_all(&state.pool)
    .await?;

    let post_ids: Vec<Uuid> = rows.iter().map(|p| p.id).collect();
    let mut tag_map: std::collections::HashMap<Uuid, Vec<Tag>> = std::collections::HashMap::new();

    if !post_ids.is_empty() {
        #[derive(sqlx::FromRow)]
        struct PostTagRow {
            post_id: Uuid,
            tag_id: Uuid,
            name: String,
            slug: String,
        }

        let tag_rows: Vec<PostTagRow> = sqlx::query_as(
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

    let items: Vec<PostListItem> = rows
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

    Ok(Json(json!({ "success": true, "posts": items })))
}

// Logic: Fetches a single post by ID for administration editing.
// Input: SharedState, RequireAuth extractor, Path UUID.
// Output: PostWithDetails JSON.
pub async fn admin_get_post(
    State(state): State<SharedState>,
    RequireAuth(_user): RequireAuth,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    #[derive(sqlx::FromRow)]
    struct PostDetailRow {
        id: Uuid,
        slug: String,
        title: String,
        content: String,
        excerpt: String,
        cover_image: Option<String>,
        status: String,
        published_at: Option<chrono::DateTime<Utc>>,
        author_id: Uuid,
        author_name: String,
        created_at: chrono::DateTime<Utc>,
        updated_at: chrono::DateTime<Utc>,
    }

    let post: PostDetailRow = sqlx::query_as(
        r#"SELECT p.id, p.slug, p.title, p.content, p.excerpt, p.cover_image, p.status, p.published_at, 
                  p.author_id, u.name as author_name, p.created_at, p.updated_at 
           FROM posts p 
           JOIN users u ON p.author_id = u.id 
           WHERE p.id = $1"#
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Không tìm thấy bài viết".to_string()))?;

    let tags: Vec<Tag> = sqlx::query_as(
        r#"SELECT t.id, t.name, t.slug 
           FROM post_tags pt 
           JOIN tags t ON pt.tag_id = t.id 
           WHERE pt.post_id = $1"#
    )
    .bind(id)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(PostWithDetails {
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
    }))
}

// Logic: Creates a new post in transaction, inserts associated tags, and invalidates cache.
// Input: SharedState, RequireAuth extractor, CreatePostRequest JSON.
// Output: HTTP 201 Created with PostWithDetails.
pub async fn admin_create_post(
    State(state): State<SharedState>,
    RequireAuth(user): RequireAuth,
    Json(payload): Json<CreatePostRequest>,
) -> Result<impl IntoResponse, AppError> {
    let mut tx = state.pool.begin().await?;

    let post_id = Uuid::new_v4();
    let initial_slug = match payload.slug {
        Some(s) if !s.trim().is_empty() => generate_slug(&s),
        _ => generate_slug(&payload.title),
    };

    // Ensure unique slug
    let mut slug = initial_slug.clone();
    let mut suffix = 1;
    loop {
        let exists: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM posts WHERE slug = $1")
            .bind(&slug)
            .fetch_one(&mut *tx)
            .await?;
        if exists.0 == 0 {
            break;
        }
        suffix += 1;
        slug = format!("{initial_slug}-{suffix}");
    }

    let status = if user.role == "author" {
        "draft".to_string()
    } else {
        payload.status.unwrap_or_else(|| "draft".to_string())
    };
    let published_at = if status == "published" {
        Some(Utc::now())
    } else {
        None
    };

    sqlx::query(
        r#"INSERT INTO posts (id, slug, title, content, excerpt, cover_image, status, published_at, author_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"#
    )
    .bind(post_id)
    .bind(&slug)
    .bind(payload.title.trim())
    .bind(&payload.content)
    .bind(payload.excerpt.trim())
    .bind(payload.cover_image)
    .bind(&status)
    .bind(published_at)
    .bind(user.id)
    .execute(&mut *tx)
    .await?;

    // Handle tag associations
    let mut attached_tags: Vec<Tag> = Vec::new();
    if let Some(tag_names) = payload.tags {
        for name in tag_names {
            let trimmed = name.trim();
            if trimmed.is_empty() {
                continue;
            }
            let tag_slug = generate_slug(trimmed);
            let tag_id = Uuid::new_v4();

            let tag: Tag = sqlx::query_as(
                r#"INSERT INTO tags (id, name, slug) 
                   VALUES ($1, $2, $3) 
                   ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name 
                   RETURNING id, name, slug"#
            )
            .bind(tag_id)
            .bind(trimmed)
            .bind(&tag_slug)
            .fetch_one(&mut *tx)
            .await?;

            sqlx::query("INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
                .bind(post_id)
                .bind(tag.id)
                .execute(&mut *tx)
                .await?;

            attached_tags.push(tag);
        }
    }

    tx.commit().await?;

    // Invalidate Redis caches
    let mut redis = state.redis.clone();
    let _ = invalidate_pattern(&mut redis, "cache:posts:*").await;
    let _ = invalidate_pattern(&mut redis, &format!("cache:post:{slug}")).await;

    let post_details = PostWithDetails {
        id: post_id,
        slug,
        title: payload.title,
        content: payload.content,
        excerpt: payload.excerpt,
        cover_image: None,
        status,
        published_at,
        author_id: user.id,
        author_name: user.name,
        tags: attached_tags,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    Ok((StatusCode::CREATED, Json(post_details)))
}

// Logic: Updates an existing post and associated tags in transaction.
// Input: SharedState, RequireAuth extractor, Path UUID, UpdatePostRequest JSON.
// Output: HTTP 200 OK with updated PostWithDetails.
pub async fn admin_update_post(
    State(state): State<SharedState>,
    RequireAuth(user): RequireAuth,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdatePostRequest>,
) -> Result<impl IntoResponse, AppError> {
    let mut tx = state.pool.begin().await?;

    let existing: Post = sqlx::query_as(
        "SELECT id, slug, title, content, excerpt, cover_image, status, published_at, author_id, created_at, updated_at FROM posts WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::NotFound("Không tìm thấy bài viết".to_string()))?;

    if user.role == "author" && existing.author_id != user.id {
        return Err(AppError::Forbidden("Tác giả chỉ có quyền chỉnh sửa bài viết của chính mình".to_string()));
    }

    let new_title = payload.title.unwrap_or(existing.title);
    let new_content = payload.content.unwrap_or(existing.content);
    let new_excerpt = payload.excerpt.unwrap_or(existing.excerpt);
    let new_cover_image = payload.cover_image.or(existing.cover_image);
    let new_status = if user.role == "author" {
        "draft".to_string()
    } else {
        payload.status.unwrap_or(existing.status)
    };

    let new_slug = if let Some(s) = payload.slug {
        generate_slug(&s)
    } else {
        existing.slug.clone()
    };

    let new_published_at = if new_status == "published" && existing.published_at.is_none() {
        Some(Utc::now())
    } else {
        existing.published_at
    };

    sqlx::query(
        r#"UPDATE posts 
           SET title = $1, slug = $2, content = $3, excerpt = $4, cover_image = $5, 
               status = $6, published_at = $7, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $8"#
    )
    .bind(&new_title)
    .bind(&new_slug)
    .bind(&new_content)
    .bind(&new_excerpt)
    .bind(&new_cover_image)
    .bind(&new_status)
    .bind(new_published_at)
    .bind(id)
    .execute(&mut *tx)
    .await?;

    // Update tags if provided
    let mut attached_tags: Vec<Tag> = Vec::new();
    if let Some(tag_names) = payload.tags {
        sqlx::query("DELETE FROM post_tags WHERE post_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        for name in tag_names {
            let trimmed = name.trim();
            if trimmed.is_empty() {
                continue;
            }
            let tag_slug = generate_slug(trimmed);
            let tag_id = Uuid::new_v4();

            let tag: Tag = sqlx::query_as(
                r#"INSERT INTO tags (id, name, slug) 
                   VALUES ($1, $2, $3) 
                   ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name 
                   RETURNING id, name, slug"#
            )
            .bind(tag_id)
            .bind(trimmed)
            .bind(&tag_slug)
            .fetch_one(&mut *tx)
            .await?;

            sqlx::query("INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
                .bind(id)
                .bind(tag.id)
                .execute(&mut *tx)
                .await?;

            attached_tags.push(tag);
        }
    } else {
        attached_tags = sqlx::query_as(
            r#"SELECT t.id, t.name, t.slug 
               FROM post_tags pt 
               JOIN tags t ON pt.tag_id = t.id 
               WHERE pt.post_id = $1"#
        )
        .bind(id)
        .fetch_all(&mut *tx)
        .await?;
    }

    let (author_name,): (String,) = sqlx::query_as("SELECT name FROM users WHERE id = $1")
        .bind(existing.author_id)
        .fetch_one(&mut *tx)
        .await?;

    tx.commit().await?;

    // Invalidate Redis caches
    let mut redis = state.redis.clone();
    let _ = invalidate_pattern(&mut redis, "cache:posts:*").await;
    let _ = invalidate_pattern(&mut redis, &format!("cache:post:{}", existing.slug)).await;
    let _ = invalidate_pattern(&mut redis, &format!("cache:post:{new_slug}")).await;

    Ok(Json(PostWithDetails {
        id,
        slug: new_slug,
        title: new_title,
        content: new_content,
        excerpt: new_excerpt,
        cover_image: new_cover_image,
        status: new_status,
        published_at: new_published_at,
        author_id: existing.author_id,
        author_name,
        tags: attached_tags,
        created_at: existing.created_at,
        updated_at: Utc::now(),
    }))
}

// Logic: Deletes a post by ID and purges Redis cache.
// Input: SharedState, RequireAuth extractor, Path UUID.
// Output: HTTP 200 OK deletion confirmation.
pub async fn admin_delete_post(
    State(state): State<SharedState>,
    RequireAuth(user): RequireAuth,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let post: Option<(String, Uuid)> = sqlx::query_as("SELECT slug, author_id FROM posts WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.pool)
        .await?;

    let (slug, author_id) = post.ok_or_else(|| AppError::NotFound("Không tìm thấy bài viết".to_string()))?;

    if user.role == "author" && author_id != user.id {
        return Err(AppError::Forbidden("Tác giả chỉ có quyền xóa bài viết của chính mình".to_string()));
    }

    sqlx::query("DELETE FROM posts WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await?;

    let mut redis = state.redis.clone();
    let _ = invalidate_pattern(&mut redis, "cache:posts:*").await;
    let _ = invalidate_pattern(&mut redis, &format!("cache:post:{}", slug)).await;

    Ok(Json(json!({ "success": true, "message": "Đã xóa bài viết thành công" })))
}

// Logic: Instant publication shortcut for draft posts.
// Input: SharedState, RequireEditor extractor, Path UUID.
// Output: HTTP 200 OK confirmation.
pub async fn admin_publish_post(
    State(state): State<SharedState>,
    RequireEditor(_editor): RequireEditor,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query(
        "UPDATE posts SET status = 'published', published_at = CURRENT_TIMESTAMP WHERE id = $1"
    )
    .bind(id)
    .execute(&state.pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Không tìm thấy bài viết".to_string()));
    }

    let mut redis = state.redis.clone();
    let _ = invalidate_pattern(&mut redis, "cache:posts:*").await;

    Ok(Json(json!({ "success": true, "message": "Bài viết đã được xuất bản" })))
}

// Logic: Lists all uploaded assets with pagination for media management.
// Input: SharedState and RequireAuth extractor.
// Output: JSON array of Asset objects.
pub async fn admin_list_assets(
    State(state): State<SharedState>,
    RequireAuth(_user): RequireAuth,
) -> Result<impl IntoResponse, AppError> {
    let assets: Vec<Asset> = sqlx::query_as(
        "SELECT id, sha256, filename, mime_type, size_bytes, storage_path, uploaded_by, created_at FROM assets ORDER BY created_at DESC LIMIT 100"
    )
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(json!({ "success": true, "assets": assets })))
}

// Logic: Lists all user accounts with their assigned roles.
// Input: SharedState and RequireAdmin extractor.
// Output: JSON array of UserResponse objects.
pub async fn admin_list_users(
    State(state): State<SharedState>,
    RequireAdmin(_admin): RequireAdmin,
) -> Result<impl IntoResponse, AppError> {
    let users: Vec<User> = sqlx::query_as(
        "SELECT id, email, password_hash, name, role, must_change_password, created_at, updated_at FROM users ORDER BY created_at ASC"
    )
    .fetch_all(&state.pool)
    .await?;

    let responses: Vec<UserResponse> = users.into_iter().map(Into::into).collect();
    Ok(Json(json!({ "success": true, "users": responses })))
}

// Logic: Provisions a new user account with distinct role permissions (Admin, Editor, Author).
// Input: SharedState, RequireAdmin extractor, CreateUserRequest JSON.
// Output: HTTP 201 Created with UserResponse.
pub async fn admin_create_user(
    State(state): State<SharedState>,
    RequireAdmin(_admin): RequireAdmin,
    Json(payload): Json<CreateUserRequest>,
) -> Result<impl IntoResponse, AppError> {
    if payload.email.trim().is_empty() || payload.password.len() < 8 || payload.name.trim().is_empty() {
        return Err(AppError::BadRequest("Thông tin tài khoản không hợp lệ. Mật khẩu phải từ 8 ký tự trở lên.".to_string()));
    }

    let role = match payload.role.as_str() {
        "admin" | "editor" | "author" => payload.role,
        _ => return Err(AppError::BadRequest("Vai trò không hợp lệ. Chỉ chấp nhận: admin, editor, author".to_string())),
    };

    let existing: Option<(Uuid,)> = sqlx::query_as("SELECT id FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.pool)
        .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest("Email này đã được sử dụng".to_string()));
    }

    let password_hash = hash_password(&payload.password)?;

    let user: User = sqlx::query_as(
        r#"INSERT INTO users (email, password_hash, name, role, must_change_password, created_at, updated_at)
           VALUES ($1, $2, $3, $4, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING id, email, password_hash, name, role, must_change_password, created_at, updated_at"#
    )
    .bind(&payload.email)
    .bind(&password_hash)
    .bind(&payload.name)
    .bind(&role)
    .fetch_one(&state.pool)
    .await?;

    Ok((StatusCode::CREATED, Json(json!({ "success": true, "user": UserResponse::from(user) }))))
}

// Logic: Updates user account credentials, name, or role.
// Input: SharedState, RequireAdmin extractor, Path UUID, UpdateUserRequest JSON.
// Output: HTTP 200 OK with updated UserResponse.
pub async fn admin_update_user(
    State(state): State<SharedState>,
    RequireAdmin(admin): RequireAdmin,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<impl IntoResponse, AppError> {
    let existing: Option<User> = sqlx::query_as(
        "SELECT id, email, password_hash, name, role, must_change_password, created_at, updated_at FROM users WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await?;

    let existing = existing.ok_or_else(|| AppError::NotFound("Không tìm thấy tài khoản".to_string()))?;

    let new_name = payload.name.unwrap_or(existing.name);
    let new_email = payload.email.unwrap_or(existing.email);
    let new_role = match payload.role {
        Some(r) => match r.as_str() {
            "admin" | "editor" | "author" => {
                if existing.id == admin.id && r != "admin" {
                    return Err(AppError::BadRequest("Không thể tự hạ quyền quản trị viên của chính mình".to_string()));
                }
                r.to_string()
            }
            _ => return Err(AppError::BadRequest("Vai trò không hợp lệ. Chỉ chấp nhận: admin, editor, author".to_string())),
        },
        None => existing.role,
    };

    let new_password_hash = match payload.password {
        Some(pw) if !pw.trim().is_empty() => {
            if pw.len() < 8 {
                return Err(AppError::BadRequest("Mật khẩu mới phải từ 8 ký tự trở lên".to_string()));
            }
            hash_password(&pw)?
        }
        _ => existing.password_hash,
    };

    let updated: User = sqlx::query_as(
        r#"UPDATE users 
           SET name = $1, email = $2, role = $3, password_hash = $4, updated_at = CURRENT_TIMESTAMP
           WHERE id = $5
           RETURNING id, email, password_hash, name, role, must_change_password, created_at, updated_at"#
    )
    .bind(&new_name)
    .bind(&new_email)
    .bind(&new_role)
    .bind(&new_password_hash)
    .bind(id)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(json!({ "success": true, "user": UserResponse::from(updated) })))
}

// Logic: Deletes a user account with safeguard against self-deletion.
// Input: SharedState, RequireAdmin extractor, Path UUID.
// Output: HTTP 200 OK deletion confirmation.
pub async fn admin_delete_user(
    State(state): State<SharedState>,
    RequireAdmin(admin): RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    if id == admin.id {
        return Err(AppError::BadRequest("Không thể tự xóa tài khoản đang đăng nhập của chính bạn".to_string()));
    }

    let result = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Không tìm thấy tài khoản để xóa".to_string()));
    }

    Ok(Json(json!({ "success": true, "message": "Đã xóa tài khoản thành công" })))
}

// Logic: Aggregates dashboard system statistics.
// Input: SharedState and RequireAuth extractor.
// Output: JSON object with total counts of posts, drafts, users, and assets.
pub async fn admin_get_stats(
    State(state): State<SharedState>,
    RequireAuth(_user): RequireAuth,
) -> Result<impl IntoResponse, AppError> {
    let (total_posts,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM posts")
        .fetch_one(&state.pool)
        .await?;

    let (published_posts,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM posts WHERE status = 'published'")
        .fetch_one(&state.pool)
        .await?;

    let (draft_posts,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM posts WHERE status = 'draft'")
        .fetch_one(&state.pool)
        .await?;

    let (total_users,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&state.pool)
        .await?;

    let (total_assets,): (i64,) = sqlx::query_as("SELECT COUNT(*) FROM assets")
        .fetch_one(&state.pool)
        .await?;

    Ok(Json(json!({
        "success": true,
        "stats": {
            "total_posts": total_posts,
            "published_posts": published_posts,
            "draft_posts": draft_posts,
            "total_users": total_users,
            "total_assets": total_assets
        }
    })))
}
