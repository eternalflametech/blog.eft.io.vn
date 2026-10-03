---
name: safety-audit
description: Audit SQL queries, input validation, upload pipelines, Markdown rendering, and network configuration against security standards and OWASP Top 10.
---

# Safety Audit Skill

## Purpose
Perform systematic security audits across backend handlers, database queries, authentication flows, and frontend render pipelines to guarantee zero vulnerabilities and strict OWASP Top 10 compliance.

## Activation Criteria
Activate this skill whenever:
- Adding or modifying database queries, schema migrations, or repository methods.
- Implementing file upload, storage, or asset delivery endpoints.
- Modifying authentication, authorization middleware, or session handling logic.
- Rendering dynamic Markdown or user-supplied content to HTML.
- Updating Docker network definitions or exposed container ports.

## Procedure
1. **Audit SQL Queries:**
   - Verify every query uses `sqlx::query!` or `sqlx::query_as!` macros.
   - Confirm zero dynamic string concatenation, format strings, or unescaped SQL fragments.
2. **Audit Input Validation:**
   - Verify all request bodies, query parameters, and path variables have schema validation (e.g. `validator` crate or Zod schemas).
   - Ensure boundary length limits are enforced on all text inputs.
3. **Audit File Upload Pipelines:**
   - Verify MIME type verification checks magic bytes against allowlist (`image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`, `application/pdf`).
   - Confirm EXIF metadata is stripped from images.
   - Verify 10 MB per-file upload cap is enforced server-side.
   - Confirm files are stored outside the public web root and addressed by SHA-256 hashes.
4. **Audit Markdown Sanitization:**
   - Verify all rendered HTML passes through strict allowlist sanitization (`ammonia` or `rehype-sanitize`).
   - Confirm script execution, object embedding, and inline event handlers are removed.
5. **Audit Access Control & Secrets:**
   - Verify all mutation routes require administrator authorization via server middleware.
   - Confirm public registration is disabled when `ENABLE_PUBLIC_REGISTRATION=false`.
   - Confirm zero secrets exist in source code, commit history, or sample configs.
   - Confirm Rust backend port 8080 is isolated inside Docker bridge network and not exposed to the host.
