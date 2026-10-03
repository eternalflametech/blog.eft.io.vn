---
trigger: always_on
description: enforce sql parameterization, input validation, upload security, markdown xss sanitization, and network isolation
---

# Safety & Security Directives

## 1. Parameterized SQL & Compile-Time Checks
- **Mandatory Compile-Time Queries:** All database queries must use `sqlx::query!` or `sqlx::query_as!` macros in Rust. Dynamic string concatenation or formatting into SQL statements (`format!`, `+`, raw unparameterized strings) is strictly prohibited.
- **Strict Parameter Binding:** Bind every dynamic value as a typed query parameter. Use prepared statements with type checking enforced by PostgreSQL metadata.
- **Transaction Safety:** Wrap multi-step mutations (e.g., article creation with tags and asset associations) in explicit database transactions (`pool.begin()`) with automatic rollback on error.

## 2. Input Validation & Data Sanitization
- **Strict Schema Validation:** Validate all incoming HTTP payloads at the boundary before processing. Use the `validator` crate for Axum request extractors and Zod for Next.js form handling.
- **Type Safety & Bounds:** Enforce length bounds on all text fields (e.g., titles max 200 chars, slugs max 100 chars, excerpts max 500 chars).
- **Slug Validation:** Ensure URL slugs conform to `^[a-z0-9]+(?:-[a-z0-9]+)*$` without directory traversal sequences (`..`, `/`, `\`).

## 3. Server-Side Access Control & Administration
- **Server-Side Enforcement:** Never rely on client-side routing or UI hiding for authorization. Enforce admin role verification in Axum middleware handlers (`require_admin`) on every mutation endpoint (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Registration Policy:** Public user registration is disabled by default via a server-side feature toggle (`ENABLE_PUBLIC_REGISTRATION=false`). Do not expose public registration routes unless explicitly configured.
- **Admin Provisioning:** Admin accounts must only be provisioned via CLI tooling or seed scripts. Never expose unauthenticated admin creation endpoints.

## 4. Secure File & Asset Upload Handling
- **MIME Type Whitelist:** Accept only strictly whitelisted MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`, and `application/pdf`. Never trust the client-supplied `Content-Type` header alone; inspect magic bytes.
- **Size Limits:** Enforce a hard maximum upload limit of 10 MB per file.
- **Metadata Stripping:** Strip all EXIF, geolocation, and camera metadata from uploaded images before storing.
- **Storage Isolation:** Store uploaded files outside the public web root. Never execute files in the storage directory.
- **Deterministic Hashing:** Name stored assets using SHA-256 content hashes (e.g., `{sha256}.{ext}`) to eliminate path traversal vulnerabilities and deduplicate storage.
- **Protected Delivery:** Serve private or restricted documents via temporary signed URLs or authenticated proxy streams.

## 5. Markdown Rendering & XSS Defense
- **HTML Sanitization:** Sanitize all rendered HTML generated from Markdown content using strict allowlist sanitizers (such as `ammonia` in Rust or `rehype-sanitize` in Next.js).
- **Prohibited Elements:** Strip `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, and `inline event handlers` (`onclick`, `onerror`).
- **Safe Link Attributes:** Automatically inject `rel="noopener noreferrer nofollow"` on all external links rendered from Markdown.

## 6. Secrets & Environment Isolation
- **Zero Secret Commits:** Never commit API keys, database passwords, JWT secrets, or private keys to the repository.
- **Environment Management:** Load secrets strictly from environment variables or Docker secrets. Use `.env.example` to document required keys without values.
- **Network Isolation:** Rust backend services must listen on internal Docker networks without exposing ports to the public host. All external traffic must route through the Next.js reverse proxy on port 3000.
