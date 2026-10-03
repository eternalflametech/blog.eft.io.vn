// Logic: Password hashing and cryptographic verification using Argon2id.
// Input: Plaintext password strings and stored Argon2id hashes.
// Output: Cryptographic hashes or verification boolean results.

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

use crate::error::AppError;

// Logic: Generates a secure salted Argon2id hash from plaintext password.
// Input: Plaintext password slice.
// Output: Formatted Argon2id hash string or AppError.
pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(format!("Lỗi băm mật khẩu: {e}")))?
        .to_string();
    Ok(hash)
}

// Logic: Verifies a plaintext password against a stored Argon2id hash string.
// Input: Plaintext password slice and stored hash slice.
// Output: True if valid, false otherwise.
pub fn verify_password(password: &str, password_hash: &str) -> Result<bool, AppError> {
    let parsed_hash = PasswordHash::new(password_hash)
        .map_err(|e| AppError::Internal(format!("Định dạng hash không hợp lệ: {e}")))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}
