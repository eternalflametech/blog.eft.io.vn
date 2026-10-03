// Logic: Vietnamese diacritics stripping and SEO slug normalization.
// Input: Raw UTF-8 Vietnamese text strings.
// Output: ASCII hyphen-separated lowercase slug strings.

// Logic: Converts Vietnamese accented characters to plain ASCII equivalents.
// Input: Input string slice.
// Output: Transliterated ASCII string.
pub fn remove_vietnamese_diacritics(input: &str) -> String {
    let mut result = String::with_capacity(input.len());
    for c in input.chars() {
        let mapped = match c {
            'a' | 'à' | 'á' | 'ả' | 'ã' | 'ạ' | 'ă' | 'ằ' | 'ắ' | 'ẳ' | 'ẵ' | 'ặ' | 'â' | 'ầ' | 'ấ' | 'ẩ' | 'ẫ' | 'ậ' => 'a',
            'A' | 'À' | 'Á' | 'Ả' | 'Ã' | 'Ạ' | 'Ă' | 'Ằ' | 'Ắ' | 'Ẳ' | 'Ẵ' | 'Ặ' | 'Â' | 'Ầ' | 'Ấ' | 'Ẩ' | 'Ẫ' | 'Ậ' => 'A',
            'd' | 'đ' => 'd',
            'D' | 'Đ' => 'D',
            'e' | 'è' | 'é' | 'ẻ' | 'ẽ' | 'ẹ' | 'ê' | 'ề' | 'ế' | 'ể' | 'ễ' | 'ệ' => 'e',
            'E' | 'È' | 'É' | 'Ẻ' | 'Ẽ' | 'Ẹ' | 'Ê' | 'Ề' | 'Ế' | 'Ể' | 'Ễ' | 'Ệ' => 'E',
            'i' | 'ì' | 'í' | 'ỉ' | 'ĩ' | 'ị' => 'i',
            'I' | 'Ì' | 'Í' | 'Ỉ' | 'Ĩ' | 'Ị' => 'I',
            'o' | 'ò' | 'ó' | 'ỏ' | 'õ' | 'ọ' | 'ô' | 'ồ' | 'ố' | 'ổ' | 'ỗ' | 'ộ' | 'ơ' | 'ờ' | 'ớ' | 'ở' | 'ỡ' | 'ợ' => 'o',
            'O' | 'Ò' | 'Ó' | 'Ỏ' | 'Õ' | 'Ọ' | 'Ô' | 'Ồ' | 'Ố' | 'Ổ' | 'Ỗ' | 'Ộ' | 'Ơ' | 'Ờ' | 'Ớ' | 'Ở' | 'Ỡ' | 'Ợ' => 'O',
            'u' | 'ù' | 'ú' | 'ủ' | 'ũ' | 'ụ' | 'ư' | 'ừ' | 'ứ' | 'ử' | 'ữ' | 'ự' => 'u',
            'U' | 'Ù' | 'Ú' | 'Ủ' | 'Ũ' | 'Ụ' | 'Ư' | 'Ừ' | 'Ứ' | 'Ử' | 'Ữ' | 'Ự' => 'U',
            'y' | 'ỳ' | 'ý' | 'ỷ' | 'ỹ' | 'ỵ' => 'y',
            'Y' | 'Ỳ' | 'Ý' | 'Ỷ' | 'Ỹ' | 'Ỵ' => 'Y',
            other => other,
        };
        result.push(mapped);
    }
    result
}

// Logic: Produces a canonical URL slug from an input title.
// Input: Input text slice.
// Output: Normalized slug matching ^[a-z0-9]+(?:-[a-z0-9]+)*$.
pub fn generate_slug(title: &str) -> String {
    let ascii_str = remove_vietnamese_diacritics(title).to_lowercase();
    let mut slug = String::new();
    let mut prev_hyphen = false;

    for c in ascii_str.chars() {
        if c.is_ascii_alphanumeric() {
            slug.push(c);
            prev_hyphen = false;
        } else if !prev_hyphen && !slug.is_empty() {
            slug.push('-');
            prev_hyphen = true;
        }
    }

    if slug.ends_with('-') {
        slug.pop();
    }

    if slug.is_empty() {
        "bai-viet".to_string()
    } else {
        slug
    }
}
