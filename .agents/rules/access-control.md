---
trigger: model_decision
description: enforce role-based access control, admin-only post authoring, disabled public registration, and cli provisioning
---

# Access Control Directives

## 1. Role-Based Access Control (RBAC) Architecture
- **Admin Exclusivity:** Publishing, editing, updating, and deleting blog posts and managing uploaded media assets are privileges reserved exclusively for authenticated users with the `admin` role.
- **Reader Model:** Public users have read-only access to published articles, categories, tags, and public asset files.
- **Least Privilege:** Internal services and database users must operate with least privilege required for their designated functions.

## 2. Public Registration Safeguards
- **Disabled by Default:** Public user registration is strictly disabled by default.
- **Server-Side Feature Flag:** The registration endpoint must be guarded by an explicit environment feature flag (`ENABLE_PUBLIC_REGISTRATION=false`). When false or unset, registration requests must immediately return `403 Forbidden` or `404 Not Found`.
- **No Client Reliance:** The public interface must not rely solely on hiding the registration UI; server routes must reject registration requests unconditionally when the feature flag is disabled.

## 3. Administrator Account Provisioning
- **CLI & Seed Only:** Administrator credentials must only be provisioned via secure command-line interfaces (such as `cargo run --bin eft-cli -- admin create --email <email>`) or direct database seed migrations in isolated environments.
- **Password Hashing:** Passwords must be hashed using modern algorithms (Argon2id) with unique salts. Plaintext passwords must never be logged or stored.
- **MFA Ready:** Support Time-based One-Time Passwords (TOTP) for administrator authentication where applicable.

## 4. Server-Side Route Guarding & Sessions
- **Middleware Validation:** All administrative API endpoints (`/api/v2/admin/*`, mutations on `/api/v2/posts/*`, `/api/v2/assets/*`) must enforce an Axum authentication and authorization layer.
- **Session Tokens:** Issue cryptographically secure session tokens or JWTs stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
- **Token Invalidation:** Provide an explicit logout mechanism that immediately invalidates session tokens in the Redis cache and backend database.
- **Rate Limiting:** Protect login routes against brute-force attacks by enforcing strict IP-based and account-based rate limiting.
