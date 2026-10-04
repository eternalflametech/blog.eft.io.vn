# Security Policy

## 1. Supported Versions

| Version | Supported          |
| :---    | :---               |
| 0.1.x   | :white_check_mark: |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability within the Eternal Flame Tech Blog, please do **NOT** open a public issue. We appreciate responsible disclosure to protect user safety and platform integrity.

### Disclosure Channels
- **Email:** `nguyenminhkhoi.nmk.dev@gmail.com`
- **PGP/SSH Signed Communications:** Welcome and appreciated.
- **Subject:** `[SECURITY] EFT Blog Vulnerability Report`

### Information to Include
- Detailed description of the vulnerability.
- Steps to reproduce or proof-of-concept (PoC).
- Affected endpoints or components.
- Potential impact and severity assessment.

### Response Timeline
- **Initial Response:** Within 24-48 hours.
- **Triage & Remediation Plan:** Within 5 business days.
- **Patch Deployment:** Deployed promptly via container updates.

---

## 3. Security Baseline & Technical Controls

For full architecture details and pre-commit checklists, refer to [docs/SECURITY.md](docs/SECURITY.md):
- **Compile-time SQL parameterization** via `sqlx::query!`.
- **Role-Based Access Control (RBAC)** enforced on all administrative endpoints (`RequireAdmin`, `RequireEditor`).
- **Argon2id password hashing** with unique cryptographic salts.
- **XSS prevention** with Markdown HTML sanitization and safe KaTeX parsing.
- **Docker network isolation** (internal Axum port 8080 proxied exclusively via Next.js port 3000).
- **Asset upload verification** checking magic bytes and stripping EXIF metadata.
