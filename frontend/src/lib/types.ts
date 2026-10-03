// Logic: TypeScript type definitions for EFT Blog models, payloads, and API contracts.
// Input: Shared domain specifications.
// Output: Typed interfaces for frontend use.

export interface Tag {
  id: string;
  name: string;
  slug: string;
  post_count?: number;
}

export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image?: string | null;
  status: 'draft' | 'published';
  published_at?: string | null;
  author_name: string;
  tags: Tag[];
  created_at: string;
}

export interface PostWithDetails {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image?: string | null;
  status: 'draft' | 'published';
  published_at?: string | null;
  author_id: string;
  author_name: string;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedPosts {
  items: PostListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Asset {
  id: string;
  sha256: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  uploaded_by?: string | null;
  created_at: string;
}

export interface AssetUploadResponse {
  id: string;
  sha256: string;
  url: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  deduplicated: boolean;
}
