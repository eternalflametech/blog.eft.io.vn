---
name: laziness
description: Enforce Don't-Repeat-Yourself (DRY) principles by reusing established standard libraries, crates, and npm packages instead of writing bespoke utilities.
---

# Laziness (DRY-First) Skill

## Purpose
Ensure maximum engineering leverage by reusing well-tested standard libraries, established crates, and npm packages. Writing custom algorithms or utilities when mature solutions exist introduces maintenance burden and security risks.

## Activation Criteria
Activate this skill whenever:
- Designing new data structures, parsing routines, or serialization logic.
- Implementing common algorithms (hashing, slugification, date parsing, sanitization, pagination).
- Considering writing utility functions or helper modules in backend or frontend code.

## Procedure
1. **Repository Audit:** Search the existing codebase first to determine if an internal module or helper already solves the problem.
2. **Ecosystem Discovery:** Search crates.io (for Rust) and npmjs.com (for Next.js/React) for standard, battle-tested libraries:
   - For Rust: Evaluate `tokio`, `axum`, `sqlx`, `bincode`, `tower`, `tower-http`, `serde`, `serde_json`, `validator`, `tracing`, `argon2`, `ammonia`.
   - For Frontend: Evaluate `clsx`, `tailwind-merge`, `lucide-react`, `rehype-sanitize`, `remark-gfm`.
3. **Verify Maintenance & Security:** Check crate/package download metrics, recent updates, security advisories, and dependency footprint.
4. **Search Latest Stable Version:** Dynamically search the web for the latest stable release version before editing `Cargo.toml` or `package.json`.
5. **Integrate:** Implement using library primitives, writing only project-specific integration logic.
