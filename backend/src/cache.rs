// Logic: Redis Cache-Aside operations with Bincode binary serialization.
// Input: Cache keys, generic serializable types, and TTL durations.
// Output: Deserialized cached data or cache mutation status.

use redis::aio::ConnectionManager;
use redis::AsyncCommands;
use serde::{de::DeserializeOwned, Serialize};

use crate::error::AppError;

// Logic: Retrieves and deserializes a cached value using Bincode binary serialization.
// Input: Mutable Redis connection manager and cache key string.
// Output: Option<T> if found and successfully deserialized.
pub async fn get_cached<T: DeserializeOwned>(
    conn: &mut ConnectionManager,
    key: &str,
) -> Option<T> {
    let bytes: Option<Vec<u8>> = conn.get(key).await.ok()?;
    match bytes {
        Some(data) => match bincode::deserialize::<T>(&data) {
            Ok(val) => Some(val),
            Err(e) => {
                tracing::warn!("Bincode deserialization error for key {key}: {e}");
                None
            }
        },
        None => None,
    }
}

// Logic: Serializes and stores a value in Redis with a specified time-to-live.
// Input: Mutable Redis connection manager, cache key string, value reference, TTL in seconds.
// Output: Result indicating storage success or AppError.
pub async fn set_cached<T: Serialize>(
    conn: &mut ConnectionManager,
    key: &str,
    val: &T,
    ttl_seconds: u64,
) -> Result<(), AppError> {
    let bytes = bincode::serialize(val)
        .map_err(|e| AppError::Internal(format!("Serialization error: {e}")))?;
    conn.set_ex::<_, _, ()>(key, bytes, ttl_seconds).await?;
    Ok(())
}

// Logic: Removes a single cached key from Redis.
// Input: Mutable Redis connection manager and cache key string.
// Output: Result indicating deletion status or AppError.
pub async fn delete_cached(
    conn: &mut ConnectionManager,
    key: &str,
) -> Result<(), AppError> {
    conn.del::<_, ()>(key).await?;
    Ok(())
}

// Logic: Scans and removes all keys matching a specific pattern.
// Input: Mutable Redis connection manager and pattern prefix.
// Output: Result indicating invalidation status.
pub async fn invalidate_pattern(
    conn: &mut ConnectionManager,
    pattern: &str,
) -> Result<(), AppError> {
    let keys: Vec<String> = conn.keys(pattern).await.unwrap_or_default();
    if !keys.is_empty() {
        let _: () = conn.del::<_, ()>(&keys).await.unwrap_or_default();
    }
    Ok(())
}
