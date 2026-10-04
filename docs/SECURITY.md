# Security Guidelines & Review Checklist

## 1. Overview
This document outlines production security invariants for the Eternal Flame Tech Blog. Every code change must be evaluated against this checklist prior to merging.

---

## 2. Security Review Checklist

### 2.1. SQL Injection Prevention
- [ ] Every database interaction utilizes `sqlx::query!` or `sqlx::query_as!` macros in Rust.
- [ ] No string concatenation (`format!`, `+`) or raw interpolations exist in query construction.
- [ ] All dynamic variables are bound as typed parameters (`$1`, `$2`, etc.).
- [ ] Database transactions are wrapped in explicit rollback blocks on failure.

### 2.2. Cross-Site Scripting (XSS) Prevention
- [ ] Markdown-to-HTML rendering pipelines pass output through strict sanitizers (`ammonia` or `rehype-sanitize`).
- [ ] Forbidden tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<style>`) are stripped.
- [ ] Inline HTML event attributes (`onclick`, `onerror`, `onload`) are purged.
- [ ] KaTeX mathematical formula expressions are sanitized without raw script evaluation (`throwOnError: false`).
- [ ] All external links rendered from user content include `rel="noopener noreferrer nofollow"`.
- [ ] Dynamic user text in UI components is properly escaped by default in React templates.

### 2.3. Authentication & Role-Based Access Control (RBAC)
- [ ] All mutation endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) enforce typed server-side Axum authorization extractors (`RequireAdmin`, `RequireEditor`).
- [ ] User administration endpoint (`/api/v2/admin/users`) is strictly restricted to `superadmin` and `admin` roles.
- [ ] Public user registration is disabled by default via `ENABLE_PUBLIC_REGISTRATION=false`.
- [ ] Initial administrator default password (`admin`) is not stored in `.env`; immediate password update is enforced upon first login via a non-dismissible modal.
- [ ] Passwords are hashed using Argon2id with cryptographically random salts.
- [ ] Session tokens are stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
- [ ] Token revocation is immediate upon logout, clearing both server database records and Redis cache entries (`cache:session:*`, `cache:auth:*`).
- [ ] Brute-force protection and rate limiting are enforced on `/api/v2/auth/login`.

### 2.4. File & Asset Upload Safety
- [ ] MIME types are verified by reading magic file bytes, not client-supplied `Content-Type` headers.
- [ ] Uploaded formats are restricted to allowlisted extensions: `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.pdf`.
- [ ] Maximum file size is strictly capped at 10 MB per file.
- [ ] EXIF metadata and geolocation tags are automatically stripped from image uploads.
- [ ] Files are stored outside the public web root in a non-executable storage volume.
- [ ] Files are named using deterministic SHA-256 content hashes to prevent path traversal attacks.
- [ ] Quotas are enforced to mitigate denial-of-service via disk exhaustion.

### 2.5. Network Isolation & Infrastructure Security
- [ ] The Rust backend Axum service runs inside an isolated Docker bridge network.
- [ ] Backend port 8080 is not exposed to the public host or external network.
- [ ] The Next.js server acts as the sole public gateway on port 3000, proxying `/api/v2/*` requests internally.
- [ ] Production deployments route external traffic through Cloudflare Zero Trust Tunnel (`cloudflared:2026.9.3`) with Edge SSL termination, leaving zero open inbound ports on the host.
- [ ] Unnecessary operating system packages are omitted from Docker runtime images (Alpine or distroless).

### 2.6. Secrets Management
- [ ] Zero secrets, private keys, database passwords, or API tokens (including `CLOUDFLARE_TUNNEL_TOKEN`) are tracked in version control.
- [ ] `.env` and local environment files are included in `.gitignore`.
- [ ] `.env.example` documents all required environment variable names with dummy placeholders.
- [ ] Secrets are injected via Docker Compose secret mounts or host environment variables.
