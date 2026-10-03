// Logic: Formatting and transliteration helper utilities for frontend rendering.
// Input: Raw dates, byte counts, and Vietnamese text strings.
// Output: User-friendly formatted Vietnamese strings and normalized slugs.

// Logic: Formats ISO date string into Vietnamese locale format.
// Input: Date string or Date object.
// Output: Formatted string (e.g., "03 tháng 10, 2026").
export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Chưa xuất bản';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Logic: Estimates reading duration based on average word count.
// Input: Markdown content text.
// Output: Reading duration string (e.g., "4 phút đọc").
export function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} phút đọc`;
}

// Logic: Formats byte count into human-readable size.
// Input: Number of bytes.
// Output: Formatted string (e.g., "1.5 MB").
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Logic: Removes Vietnamese diacritics and produces a clean ASCII slug.
// Input: Title string.
// Output: Normalized slug matching ^[a-z0-9]+(?:-[a-z0-9]+)*$.
export function slugifyVietnamese(title: string): string {
  const map: Record<string, string> = {
    à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
    ă: 'a', ằ: 'a', ắ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
    â: 'a', ầ: 'a', ấ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
    đ: 'd',
    è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
    ê: 'e', ề: 'e', ế: 'e', ể: 'e', ễ: 'e', ệ: 'e',
    ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
    ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
    ô: 'o', ồ: 'o', ố: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
    ơ: 'o', ờ: 'o', ớ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
    ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
    ư: 'u', ừ: 'u', ứ: 'u', ử: 'u', ữ: 'u', ự: 'u',
    ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
  };

  const normalized = title
    .toLowerCase()
    .split('')
    .map((char) => map[char] || char)
    .join('');

  return normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'bai-viet';
}
