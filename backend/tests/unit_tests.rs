// Logic: Automated unit tests for core backend functions.
// Input: Test cases for slug generation, diacritics stripping, and Argon2id hashing.
// Output: Test pass/fail assertions.

use eft_backend::auth::{hash_password, verify_password};
use eft_backend::services::{detect_mime_type, generate_slug, remove_vietnamese_diacritics, DetectedFormat};

#[test]
fn test_vietnamese_diacritics_removal() {
    let input = "Chào Mừng Đến Với Câu Lạc Bộ Eternal Flame Tech Đạt Giải Tin Học Trẻ";
    let output = remove_vietnamese_diacritics(input);
    assert_eq!(output, "Chao Mung Den Voi Cau Lac Bo Eternal Flame Tech Dat Giai Tin Hoc Tre");
}

#[test]
fn test_slug_generation() {
    let input = "Chào Mừng Đến Với Eternal Flame Tech Blog!";
    let slug = generate_slug(input);
    assert_eq!(slug, "chao-mung-den-voi-eternal-flame-tech-blog");
}

#[test]
fn test_mime_type_detection() {
    let png_magic = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00];
    let detected = detect_mime_type(&png_magic).expect("Should detect PNG");
    assert!(matches!(detected, DetectedFormat::Png));

    let jpeg_magic = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46];
    let detected_jpeg = detect_mime_type(&jpeg_magic).expect("Should detect JPEG");
    assert!(matches!(detected_jpeg, DetectedFormat::Jpeg));
}

#[test]
fn test_password_hashing_and_verification() {
    let password = "TestSecurePassword123!";
    let hash = hash_password(password).expect("Hashing should succeed");
    assert!(hash.starts_with("$argon2id$"));

    let is_valid = verify_password(password, &hash).expect("Verification should succeed");
    assert!(is_valid);

    let is_invalid = verify_password("WrongPassword", &hash).expect("Verification should run");
    assert!(!is_invalid);
}
