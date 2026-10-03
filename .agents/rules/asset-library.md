---
trigger: model_decision
description: enforce asset upload deduplication, webp optimization, quota management, stable urls, and audit logging
---

# Asset Library Directives

## 1. Supported File Formats & MIME Verification
- **Permitted Formats:** Whitelist image formats (`.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif`) and portable documents (`.pdf`).
- **MIME Verification:** Verify file headers (magic bytes) against declared content types. Reject unrecognized, ambiguous, or executable file types immediately.
- **Filename Sanitization:** Discard original client file paths and special characters to prevent directory traversal and path injection attacks.

## 2. Content-Hash Deduplication & Stable URLs
- **SHA-256 Fingerprinting:** Calculate the SHA-256 digest of every uploaded file payload upon arrival.
- **Storage Deduplication:** Check if a file matching the SHA-256 digest already exists in the asset storage index. If present, reuse the existing file reference and return its existing URL without writing duplicate bytes to disk.
- **Deterministic Stable URLs:** Generate persistent, content-addressed URLs (format: `/api/v2/assets/{hash}.{ext}`) that remain stable across post revisions and database migrations.

## 3. Format Optimization & WebP Variants
- **Automated WebP Conversion:** Automatically process raster images (`png`, `jpg`, `jpeg`) into compressed WebP variants to optimize network bandwidth while retaining visual clarity.
- **Dimension Caps:** Downscale oversized images exceeding maximum display dimensions (e.g., width > 2560px) while preserving aspect ratios.
- **Preserved Originals:** Retain original SVG vectors and PDF documents without lossy conversion.

## 4. Quotas & Capacity Controls
- **File Size Limits:** Restrict individual uploads to a maximum of 10 MB per item.
- **Total Storage Limits:** Enforce cumulative storage quotas per administrator or total deployment to prevent resource exhaustion attacks.
- **Upload Rate Limiting:** Enforce upload frequency limits per authenticated session.

## 5. Audit Logging & Tracking
- **Upload Audit Records:** Record detailed audit entries for every uploaded or deleted asset:
  - Timestamp (ISO 8601).
  - Administrator User ID.
  - Original uploaded filename.
  - SHA-256 hash digest.
  - Final stored file path.
  - MIME type and file size in bytes.
- **Reference Tracking:** Maintain references between blog posts and assets to prevent accidental deletion of images actively linked in published articles.
