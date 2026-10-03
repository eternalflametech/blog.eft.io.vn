# Rules Reference Manual

## 1. Overview
Rules enforce invariant engineering standards, architectural constraints, and operational workflows across the Eternal Flame Tech Blog repository. Cursor rules are defined as `.cursor/rules/*.mdc` while Antigravity rules are defined as `.agents/rules/*.md`.

---

## 2. Rule: `safety`
- **Cursor Path:** `.cursor/rules/safety.mdc` (`alwaysApply: true`, `globs: ["**/*"]`)
- **Antigravity Path:** `.agents/rules/safety.md` (`trigger: always_on`)

### Key Directives
- **Compile-Time Raw SQL:** Mandatory use of `sqlx::query!` and `sqlx::query_as!` macros in Rust. Zero raw string formatting or dynamic SQL string concatenation.
- **Input Sanitization:** Enforce strict type checking and bounded length limits across all API endpoints using the `validator` crate and Zod schemas.
- **Upload Hardening:** Accept only whitelisted MIME types (`png`, `jpg`, `webp`, `svg`, `pdf`) verified via magic bytes, enforce a 10 MB file cap, strip image EXIF metadata, and store files outside public web roots using SHA-256 content hashes.
- **XSS Prevention:** Sanitize all Markdown-rendered HTML via strict allowlist filters (`ammonia` or `rehype-sanitize`). Prohibit inline scripts and event handlers.
- **Network Isolation:** Isolate backend Axum services inside Docker bridge networks without exposing port 8080. Route external requests through the Next.js port 3000 proxy.

---

## 3. Rule: `performance`
- **Cursor Path:** `.cursor/rules/performance.mdc` (`alwaysApply: false`, globs for backend, frontend, docker)
- **Antigravity Path:** `.agents/rules/performance.md` (`trigger: model_decision`)

### Key Directives
- **Measurement-First:** Profile before and after changes. Document metrics in task reports.
- **PostgreSQL Plan Analysis:** Run `EXPLAIN (ANALYZE, BUFFERS)` to verify index usage on foreign keys, status filters, and slug lookups. Eliminate N+1 query patterns.
- **Non-Blocking Rust:** Tokio runtime handlers must not invoke blocking thread functions. Offload intensive tasks to `tokio::task::spawn_blocking`. Maintain idle Axum memory footprint at 4-6 MB.
- **Cache-Aside & Compression:** Cache payloads in Redis via Bincode binary serialization (~0.1ms cache retrieval). Compress responses larger than 1 KB with Brotli/zstd via Tower-HTTP `CompressionLayer`.
- **Frontend Optimization:** Next.js ISR with `<Link>` prefetching, lazy-loaded images with fixed aspect ratios (CLS < 0.1), and purged Tailwind stylesheets.

---

## 4. Rule: `seo`
- **Cursor Path:** `.cursor/rules/seo.mdc` (`alwaysApply: false`, globs for frontend pages and components)
- **Antigravity Path:** `.agents/rules/seo.md` (`trigger: model_decision`)

### Key Directives
- **Server-Side Rendering:** Render public articles via SSR/ISR with semantic HTML landmark tags (`<header>`, `<main>`, `<article>`, `<time>`).
- **Contextual Meta Tags:** Generate unique page titles, meta descriptions (140-160 characters), canonical URLs, Open Graph tags, and Twitter Cards (`summary_large_image`).
- **Brand Visual Fallback:** Reference `assets/logo.png` as the default Open Graph sharing image and publisher logo.
- **Structured Data:** Embed valid JSON-LD schemas for `Article`, `BreadcrumbList`, and `Organization`.
- **Syndication & Sitemaps:** Auto-generate dynamic `sitemap.xml`, `robots.txt`, and RSS 2.0 / Atom feeds.
- **Vietnamese Slugs:** Strip Vietnamese diacritics, lowercase text, and separate tokens with single hyphens.

---

## 5. Rule: `blog-editor`
- **Cursor Path:** `.cursor/rules/blog-editor.mdc` (`alwaysApply: false`, globs for editor components)
- **Antigravity Path:** `.agents/rules/blog-editor.md` (`trigger: model_decision`)

### Key Directives
- **Dual-Pane Interface:** Markdown textarea with synchronized live preview and EFT dark theme styling.
- **Formatting Actions:** Toolbar and keyboard shortcuts for text formatting (bold, italic, code), headings, blockquotes, lists, tables, links, and footnotes.
- **Drag-and-Drop Upload:** Support drag-and-drop and clipboard paste for images, uploading to `/api/v2/assets` and injecting Markdown syntax at cursor position.
- **Syntax Highlighting:** Format code blocks with language detection and one-click copy buttons.
- **Frontmatter Management:** Manage article metadata (`title`, `slug`, `tags`, `cover_image`, `excerpt`, `published_at`).
- **Autosave & Publication:** Debounced local storage and backend draft autosave; require explicit administrator action to publish.

---

## 6. Rule: `access-control`
- **Cursor Path:** `.cursor/rules/access-control.mdc` (`alwaysApply: false`, globs for backend/frontend auth and middleware)
- **Antigravity Path:** `.agents/rules/access-control.md` (`trigger: model_decision`)

### Key Directives
- **Admin Exclusivity:** All article publishing, modifications, and asset management actions require verified `admin` role.
- **Disabled Public Registration:** Public registration is disabled by default via `ENABLE_PUBLIC_REGISTRATION=false`.
- **CLI Provisioning:** Administrator accounts are provisioned exclusively through secure CLI tooling or database seeds. Passwords hashed using Argon2id.
- **Server Route Enforcement:** Enforce Axum middleware authentication on all mutation routes. Protect sessions via `HttpOnly`, `SameSite=Strict`, `Secure` cookies.

---

## 7. Rule: `asset-library`
- **Cursor Path:** `.cursor/rules/asset-library.mdc` (`alwaysApply: false`, globs for asset storage and routes)
- **Antigravity Path:** `.agents/rules/asset-library.md` (`trigger: model_decision`)

### Key Directives
- **Content-Addressable Deduplication:** Calculate SHA-256 hashes of incoming files. Reuse existing file references if identical hashes exist.
- **Format Optimization:** Automatically compress raster images into WebP variants; downscale images exceeding display thresholds.
- **Deterministic Stable URLs:** Generate permanent URLs (`/api/v2/assets/{hash}.{ext}`) for post embedding.
- **Quotas & Audit Logs:** Enforce a 10 MB per-file upload limit and cumulative storage quotas. Maintain per-admin audit logs for all uploads and deletions.

---

## 8. Rule: `workflow`
- **Cursor Path:** `.cursor/rules/workflow.mdc` (`alwaysApply: true`, `globs: ["**/*"]`)
- **Antigravity Path:** `.agents/rules/workflow.md` (`trigger: always_on`)

### Key Directives
- **Sequential 10-Step Order:** Enforces the full development lifecycle from initial interview to cleanup report without skipping steps.
- **Temporary Branching:** Mandates creating local ephemeral git branches (`temp/<task-name>`) that are never pushed to remote.
- **Testing & Container Gate:** Requires 100% test pass rate (`cargo test`, `npm test`, lints) AND successful `docker compose build` and healthy container startup before requesting merge authorization.
- **Execution Report:** Requires generating a task report at `~/reports/{taskid}-{datetime}.md` using a dynamic HTTP Date API timestamp.
- **Cryptographic Signing:** Enforces commit signing with verified SSH keys as `nmkdeveloper <nguyenminhkhoi.nmk.dev@gmail.com>`.

---

## 9. Rule: `docker-first`
- **Cursor Path:** `.cursor/rules/docker-first.mdc` (`alwaysApply: true`, `globs: ["docker-compose*.yml", "Dockerfile*", "**/*"]`)
- **Antigravity Path:** `.agents/rules/docker-first.md` (`trigger: always_on`)

### Key Directives
- **Universal Containerization:** All runtime services run inside Docker containers. No host-level runtimes (Rust, Node, PostgreSQL) required.
- **Multi-Stage & Non-Root:** Pinned base images, multi-stage builds, and execution as an unprivileged user (`appuser` / `node`).
- **Compose Standards:** `docker compose up` as canonical entry point, explicit healthchecks, named volumes for data persistence, internal bridge isolation.
- **Dev-Host Sudo Policy:** Unrestricted `sudo` is available on the Debian 13 dev host for managing the Docker environment, but `sudo` must never be embedded in project artifacts.
