// Logic: Health check endpoint for Docker container probes.
// Input: None.
// Output: JSON status response.

use axum::{response::IntoResponse, Json};
use chrono::Utc;
use serde_json::json;

// Logic: Handles GET /api/v2/health request.
// Input: None.
// Output: HTTP 200 OK JSON status payload.
pub async fn health_check() -> impl IntoResponse {
    Json(json!({
        "status": "healthy",
        "service": "eft-backend",
        "timestamp": Utc::now().to_rfc3339()
    }))
}
