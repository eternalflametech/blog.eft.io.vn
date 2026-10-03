# Eternal Flame Tech Blog — Workspace Rules

## 1. Project Overview & Identity
- **Project Name:** Eternal Flame Tech Blog (EFT Blog)
- **Organization:** Eternal Flame Tech (EFT) — Official AI & Robotics Club of High School for the Gifted Nguyen Thi Minh Khai, Can Tho City, Vietnam.
- **Repository Purpose:** AI Coding Agent Rules, Skill Bundles, Workflows, and Architecture Documentation Suite.
- **Tech Stack:**
  - Frontend: Next.js (Node.js / npm) with Incremental Static Regeneration (ISR).
  - Styling: Tailwind CSS with EFT Precision Dark Theme (Zinc-950, Violet, Rose, Be Vietnam Pro).
  - Backend: Rust with Axum web framework, Tokio async runtime, Tower-HTTP CompressionLayer (Brotli/zstd).
  - Database & Cache: PostgreSQL (via SQLx compile-time checked raw SQL) + Redis (Cache-Aside with Bincode binary serialization).
  - Infrastructure: Docker & Docker Compose, single-port outport policy (:3000 proxying to internal backend), Cloudflare Tunnel.
  - Host Environment: Debian 13 (Trixie) for both Dev and Production servers.
- **Languages:**
  - System Directives, Rules & Skills: English
  - Web Application UI, Blog Posts, & Public Pages: Vietnamese (Tiếng Việt)

## 2. Core Directives Summary
- **Zero Guesswork:** Interview user whenever requirements or constraints are ambiguous.
- **DRY & Reuse:** Never author custom utilities when mature crates or npm packages exist.
- **Tailwind CSS Tokens:** Mobile-first layout using Zinc-950, Zinc-925, Violet, and Rose tokens.
- **Security Baseline:** Compile-time checked SQLx queries, internal network isolation, zero secret leakage.
- **Extreme Performance:** Tokio async runtime, Redis Cache-Aside with Bincode, Tower-HTTP Brotli compression.
- **Strict Code Comments:** Document logic, input, and output only.
- **Dynamic Dependency Versioning:** Dynamically search web for latest package versions.
- **Dynamic Date Retrieval:** Fetch real-world time dynamically via HTTP request. Never use local system clock.
