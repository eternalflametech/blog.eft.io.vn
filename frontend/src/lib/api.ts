// Logic: Typed HTTP API client supporting SSR, ISR, and browser interactions.
// Input: Endpoint URLs, query parameters, request payloads, credentials.
// Output: Strongly-typed response models or descriptive Error rejections.

import {
  Asset,
  AssetUploadResponse,
  PaginatedPosts,
  PostListItem,
  PostWithDetails,
  Tag,
  User,
} from './types';

// Logic: Determines target base URL depending on runtime environment (Node vs Browser).
// Input: None.
// Output: Base URL string.
function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_BACKEND_URL || 'http://backend:8080';
  }
  return '';
}

// Logic: Fetches paginated public posts with optional tag filtering.
// Input: Optional page, limit, and tag parameters.
// Output: PaginatedPosts response.
export async function getPosts(params?: {
  page?: number;
  limit?: number;
  tag?: string;
}): Promise<PaginatedPosts> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.tag) query.set('tag', params.tag);

  const res = await fetch(`${getBaseUrl()}/api/v2/posts?${query.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('Lỗi tải danh sách bài viết');
  }

  return res.json();
}

// Logic: Fetches a single published post by slug.
// Input: Post slug string.
// Output: PostWithDetails response.
export async function getPostBySlug(slug: string): Promise<PostWithDetails | null> {
  const res = await fetch(`${getBaseUrl()}/api/v2/posts/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error('Lỗi tải thông tin bài viết');
  }

  return res.json();
}

// Logic: Fetches all tags with post counts.
// Input: None.
// Output: Array of Tag objects.
export async function getTags(): Promise<Tag[]> {
  const res = await fetch(`${getBaseUrl()}/api/v2/tags`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.tags || [];
}

// Logic: Authenticates administrator credentials.
// Input: Email and password.
// Output: User and authentication token.
export async function login(credentials: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/v2/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Đăng nhập thất bại');
  }

  return data;
}

// Logic: Destroys user session and clears cookie.
// Input: None.
// Output: Void.
export async function logout(): Promise<void> {
  await fetch('/api/v2/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

// Logic: Checks active administrator session.
// Input: None.
// Output: User or null.
export async function getMe(): Promise<User | null> {
  try {
    const res = await fetch('/api/v2/auth/me', {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

// Logic: Fetches all posts for administrator dashboard.
// Input: None.
// Output: Array of PostListItem.
export async function adminGetPosts(): Promise<PostListItem[]> {
  const res = await fetch('/api/v2/admin/posts', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Lỗi tải danh sách bài viết quản trị');
  }

  const data = await res.json();
  return data.posts || [];
}

// Logic: Fetches single post by ID for editing.
// Input: Post UUID string.
// Output: PostWithDetails.
export async function adminGetPost(id: string): Promise<PostWithDetails> {
  const res = await fetch(`/api/v2/admin/posts/${id}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Lỗi nạp bài viết để chỉnh sửa');
  }

  return res.json();
}

// Logic: Creates a new post (draft or published).
// Input: Post creation payload.
// Output: Created PostWithDetails.
export async function adminCreatePost(post: {
  title: string;
  slug?: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  status?: string;
  tags?: string[];
}): Promise<PostWithDetails> {
  const res = await fetch('/api/v2/admin/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi tạo bài viết');
  }

  return data;
}

// Logic: Updates an existing post.
// Input: Post UUID and update payload.
// Output: Updated PostWithDetails.
export async function adminUpdatePost(
  id: string,
  post: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    cover_image?: string;
    status?: string;
    tags?: string[];
  }
): Promise<PostWithDetails> {
  const res = await fetch(`/api/v2/admin/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi cập nhật bài viết');
  }

  return data;
}

// Logic: Deletes a post by ID.
// Input: Post UUID.
// Output: Void.
export async function adminDeletePost(id: string): Promise<void> {
  const res = await fetch(`/api/v2/admin/posts/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Lỗi xóa bài viết');
  }
}

// Logic: Instant publication action for a draft post.
// Input: Post UUID.
// Output: Void.
export async function adminPublishPost(id: string): Promise<void> {
  const res = await fetch(`/api/v2/admin/posts/${id}/publish`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Lỗi xuất bản bài viết');
  }
}

// Logic: Uploads an image or document asset.
// Input: FormData with file field.
// Output: AssetUploadResponse.
export async function uploadAsset(formData: FormData): Promise<AssetUploadResponse> {
  const res = await fetch('/api/v2/assets', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi tải tệp lên');
  }

  return data;
}

// Logic: Lists stored assets for administrator library.
// Input: None.
// Output: Array of Asset items.
export async function adminGetAssets(): Promise<Asset[]> {
  const res = await fetch('/api/v2/admin/assets', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Lỗi tải danh mục tài nguyên');
  }

  const data = await res.json();
  return data.assets || [];
}
