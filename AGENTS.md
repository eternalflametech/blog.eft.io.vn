# Eternal Flame Tech Blog — Agent Directives

## 1. Project Identity & Stack Summary
- **Project Name:** Eternal Flame Tech Blog (EFT Blog)
- **Organization:** Eternal Flame Tech (EFT) — Official AI & Robotics Club of High School for the Gifted Nguyen Thi Minh Khai, Can Tho City, Vietnam.
- **Repository Scope:** Architectural rules, skill bundles, development workflows, and system documentation.
- **Backend Stack:** Rust (Axum web framework, Tokio asynchronous runtime, Tower-HTTP compression layer) running in Docker.
- **Frontend Stack:** Next.js (Node.js/npm) with Incremental Static Regeneration (ISR), React, and Tailwind CSS running in Docker.
- **Styling Architecture:** EFT Precision Dark Theme (`zinc-950` background, `zinc-925` cards, `violet-600` and `rose-600` accents, `Be Vietnam Pro` body font, `JetBrains Mono` code font).
- **Database & Cache:** PostgreSQL (via SQLx compile-time raw SQL) and Redis (Cache-Aside with Bincode binary serialization) running in Docker.
- **Infrastructure & Runtime:** Docker-First architecture. `docker compose up` is the canonical entry point. Single-port outport policy (:3000 proxying internal backend :8080/api/v2/) and Cloudflare Tunnel integration.
- **Target OS:** Debian 13 (Dev and Production hosts). Dev host provides Docker with unrestricted sudo convenience.
- **Git Commits:** Cryptographically signed with an SSH key as `nmkdeveloper <nguyenminhkhoi.nmk.dev@gmail.com>`.
- **Languages:** English for agent reasoning, code comments, git commits, reports, and documentation; Vietnamese for blog posts and public web UI.

## 2. Non-Negotiable Conventions
- **Dynamic Date Retrieval:** Fetch current real-world timestamp dynamically via HTTP request (e.g. HTTP Date header via `curl -sI https://google.com | grep -i '^date:'` or public time API) before generating reports or recording timestamps. Never rely on the unverified local system clock.
- **Dynamic Dependency Version Discovery:** Always search the web for the latest stable crate, npm package, Docker base image, and Compose service versions before creating or editing manifests (`Cargo.toml`, `package.json`, `Dockerfile`, `docker-compose.yml`).
- **Zero Hardcoded URLs & Timestamps:** Never hardcode external URLs, domain names, or static dates into application code, configuration files, or documentation. Rely on environment variables and runtime configuration.
- **Strict Code Commenting Standard:** Code comments must ONLY describe (a) logic, (b) input, and (c) output. Redundant descriptions, conversational remarks, greetings, and author watermarks are strictly prohibited.
- **Mandatory Tailwind CSS:** All user interface styling must use utility-first Tailwind CSS classes complying with EFT Dark Theme tokens. Mobile-first responsive structure; zero unscoped raw CSS.
- **Docker-First Architecture:** Every service runs containerised. No host-level Rust, Node, or PostgreSQL runtimes are required. `docker compose up` is the canonical invocation.
- **Debian-Native Scripts Only:** All build, run, test, and automation scripts must be Debian/Docker-native (Bash, Sh, Makefile, Cargo, Docker Compose, npm). Windows-native script formats and Windows shell syntax are strictly prohibited.

## 3. Core Skills Summary
- **Interviewing:** Proactively interview the user to clarify ambiguity whenever requirements, schemas, edge cases, or UX details are incomplete. Never make assumptions.
- **Laziness (DRY-First):** Never re-implement functionality provided by established libraries, standard libraries, or existing modules. Search crates.io, npm, and the local repository before writing any utility.
- **Safety:** Enforce compile-time checked parameterized SQL via `sqlx::query!`, validate and sanitize all incoming payloads, isolate backend services in Docker bridge networks, whitelist upload MIME types, strip EXIF metadata, sanitize Markdown against XSS, and store secrets exclusively in environment variables or Docker secrets.
- **Performance:** Measure and record metrics before and after changes. Use database indexing and query plan analysis (`EXPLAIN ANALYZE`), Tokio non-blocking asynchronous execution, Redis Cache-Aside with Bincode binary serialization, Tower-HTTP Brotli/zstd compression, Next.js ISR prefetching, and multi-stage Docker builds.
- **Docker Audit:** Verify multi-stage builds, non-root runtimes, layer caching, named volumes, healthchecks, and that `docker compose up` starts cleanly on a fresh Debian 13 host.

## 4. Feature Rules Summary
- **SEO & Metadata:** Public pages must be server-rendered with semantic HTML, unique page titles, meta descriptions, canonical URLs, Open Graph, Twitter Cards, JSON-LD structured data (Article, BreadcrumbList, Organization), auto-generated dynamic sitemaps (`sitemap.xml`) indexing all published post URLs and tag feeds with `<lastmod>`, robots.txt, RSS/Atom feeds, Vietnamese-compatible URL slugs, and zero cumulative layout shift.
- **Blog Editor & LaTeX:** In-browser Markdown editor featuring real-time preview, format toolbars, keyboard shortcuts, drag-and-drop media uploads, syntax-highlighted code blocks, tables, footnotes, KaTeX mathematical formula typesetting (`$inline$` and `$$display$$`), frontmatter metadata (title, slug, tags, cover image, excerpt), autosaved drafts, and explicit publication controls.
- **Access Control & RBAC:** Content publishing, updating, and deletion restricted exclusively to authorized administrators and editors. Granular Role-Based Access Control (RBAC: `superadmin`, `admin`, `editor`, `viewer`) with a dedicated user management interface at `/admin/users`. Public user registration is disabled by default via a server-side feature toggle (`ENABLE_PUBLIC_REGISTRATION=false`). Root administrator accounts are provisioned solely through CLI scripts or database seeds.
- **Pagination & High-Performance Feed:** Post listings feature 20-post default pagination (`limit` clamp 1..50) with accessible pagination controls, fast-path empty-feed short-circuiting, and dynamic Redis cache keys (`cache:posts:list:{tag}:{page}:{limit}`).
- **Asset Library:** Media and document uploads return permanent, shareable URLs for post embedding. Files are deduplicated by SHA-256 hash, optimized to modern formats (e.g., WebP), protected by quota limits, and audited per administrator action.
- **Docker-First:** All runtime dependencies encapsulated in containers. Healthchecks, named volumes, environment configuration, and dev-host sudo policy adherence without embedding sudo in project code.

## 5. Development Workflow (10-Step Order)
1. **Clarify Intent:** Interview the user until goals and acceptance criteria are unambiguous.
2. **Deep Logic Comprehension:** Analyze data flow, database schemas, and edge cases thoroughly before writing code.
3. **Search & Discovery:** Search the web for latest stable package and Docker base image versions.
4. **Formulate Plan:** Detail file modifications, API endpoints, database migrations, Docker services, and testing criteria.
5. **Verify with User:** Present the plan; iterate until explicit user approval is granted.
6. **Local Temp Branch:** Create an ephemeral local branch (`git checkout -b temp/<task-name>`). Never push this branch to remote.
7. **Implement Changes:** Write modular code adhering to Tailwind CSS tokens, strict comments, and container standards.
8. **Automated Testing:** Run full test suites (`cargo test`, `npm test`, lints) AND verify `docker compose build` and `docker compose up` reach healthy state; require 100% pass rate.
9. **User Confirmation to Merge & Push:** Obtain explicit authorization from the user before merging or pushing.
10. **Cleanup & Token-Saving Report:** Merge to `main`, commit with verified SSH key, push to origin, delete the local temporary branch, and generate an execution report at `~/reports/{taskid}-{datetime}.md` using a dynamic web date.

## 6. Documentation & Reporting Requirements
- **Documentation Suite:** Reference and maintain project guides, user manuals, security checklists, Docker architecture, and workflow details in `docs/`.
- **Execution Reports:** Write post-task reports to `~/reports/{taskid}-{datetime}.md` documenting objectives, plans, file changes, test outputs, Docker verification status, performance metrics, security considerations, and git signatures.
- **Brand Assets:** Reference project assets strictly via project-relative paths (e.g., `assets/logo.png`).

## 7. Tool-Specific Rules and Skills Reference
- **Cursor Configurations:** Stored in `.cursor/rules/*.mdc` and `.cursor/skills/*/SKILL.md`.
- **Antigravity Configurations:** Stored in `.agents/rules/*.md` and `.agents/skills/*/SKILL.md`.
