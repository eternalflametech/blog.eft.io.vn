// Logic: Router assembly for all API v2 endpoints.
// Input: SharedState.
// Output: Axum Router instance.

pub mod admin;
pub mod assets;
pub mod auth;
pub mod health;
pub mod posts;

use axum::{
    routing::{get, post},
    Router,
};

use crate::state::SharedState;

// Logic: Mounts all API v2 routes under a unified Axum router.
// Input: SharedState.
// Output: Router<SharedState>.
pub fn create_router() -> Router<SharedState> {
    Router::new()
        // Health check
        .route("/api/v2/health", get(health::health_check))
        // Authentication
        .route("/api/v2/auth/login", post(auth::login))
        .route("/api/v2/auth/logout", post(auth::logout))
        .route("/api/v2/auth/me", get(auth::me))
        .route("/api/v2/auth/register", post(auth::register))
        // Public posts & tags
        .route("/api/v2/posts", get(posts::list_posts))
        .route("/api/v2/posts/{slug}", get(posts::get_post_by_slug))
        .route("/api/v2/tags", get(posts::list_tags))
        // Assets
        .route("/api/v2/assets", post(assets::upload_asset))
        .route("/api/v2/assets/{filename}", get(assets::serve_asset))
        // Administrative post & asset management
        .route(
            "/api/v2/admin/posts",
            get(admin::admin_list_posts).post(admin::admin_create_post),
        )
        .route(
            "/api/v2/admin/posts/{id}",
            get(admin::admin_get_post)
                .put(admin::admin_update_post)
                .delete(admin::admin_delete_post),
        )
        .route(
            "/api/v2/admin/posts/{id}/publish",
            post(admin::admin_publish_post),
        )
        .route("/api/v2/admin/assets", get(admin::admin_list_assets))
}
