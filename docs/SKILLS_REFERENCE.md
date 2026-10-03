# Skills Reference Manual

## 1. Overview
Skills represent modular, executable capability bundles available to coding assistants working on the Eternal Flame Tech Blog repository. Both Cursor (`.cursor/skills/`) and Antigravity (`.agents/skills/`) consume these standardized bundles.

---

## 2. Skill: `interviewing`
- **Location:** `.cursor/skills/interviewing/SKILL.md` & `.agents/skills/interviewing/SKILL.md`
- **Core Principle:** Never guess or assume unspecified requirements.

### Activation Triggers
- Incomplete functional specifications or unstated acceptance criteria.
- Ambiguous database schemas, missing column types, or unclear table relationships.
- Undefined API endpoints, authentication boundaries, or payload contracts.
- Missing responsive UI behavior, interaction states, or error handling scenarios.

### Execution Procedure
1. **Identify Ambiguity:** Parse user directives and extract technical decisions lacking explicit definition.
2. **Formulate Questions:** Structure multiple-choice questions with concrete implementation trade-offs and recommended solutions.
3. **Present to User:** Query the user directly and pause execution until choices are submitted.
4. **Update Plan:** Incorporate user clarifications into the technical plan before modifying any code.

### Expected Deliverable
A documented clarification log and an updated implementation plan verified by the user.

---

## 3. Skill: `laziness` (DRY-First)
- **Location:** `.cursor/skills/laziness/SKILL.md` & `.agents/skills/laziness/SKILL.md`
- **Core Principle:** Don't Reinvent The Wheel (DRY). Reuse battle-tested libraries and existing internal modules.

### Activation Triggers
- Designing new data parsing, serialization, or transformation logic.
- Implementing algorithms for text slugification, cryptographic hashing, date manipulation, or validation.
- Considering authoring new standalone utility functions or helper modules.

### Execution Procedure
1. **Internal Search:** Inspect the repository to verify if existing helpers or shared modules already solve the requirement.
2. **Ecosystem Search:** Search crates.io (for Rust Axum backend) and npmjs.com (for Next.js frontend) for industry-standard crates and packages.
   - Standard Backend Crates: `tokio`, `axum`, `sqlx`, `bincode`, `tower`, `tower-http`, `serde`, `validator`, `tracing`, `argon2`, `ammonia`.
   - Standard Frontend Packages: `clsx`, `tailwind-merge`, `lucide-react`, `rehype-sanitize`, `remark-gfm`.
3. **Version Check:** Query the web dynamically for the current stable release version before editing manifests.
4. **Integration:** Implement features by composing library primitives rather than authoring custom utilities.

### Expected Deliverable
Minimal bespoke glue code that delegates core functionality to verified standard libraries.

---

## 4. Skill: `safety-audit`
- **Location:** `.cursor/skills/safety-audit/SKILL.md` & `.agents/skills/safety-audit/SKILL.md`
- **Core Principle:** Enforce defense-in-depth across database queries, input validation, upload handlers, and Markdown rendering.

### Activation Triggers
- Adding or editing database queries or migrations.
- Implementing or altering file upload, storage, or asset serving routes.
- Updating authentication middleware or authorization roles.
- Rendering dynamic Markdown content to HTML.
- Modifying Docker networking or container port mappings.

### Execution Procedure
1. **SQL Parameterization Check:** Confirm all queries utilize `sqlx::query!` or `sqlx::query_as!` macros with typed parameter binding. Reject any dynamic string concatenation.
2. **Boundary Validation Check:** Verify incoming payloads pass through schema validators (`validator` crate or Zod schemas) with string length and type bounds.
3. **Upload Pipeline Check:**
   - Confirm MIME inspection validates magic bytes against whitelist (`png`, `jpg`, `webp`, `svg`, `pdf`).
   - Confirm EXIF metadata stripping on raster images.
   - Confirm per-file upload size cap of 10 MB.
   - Confirm SHA-256 content-addressable storage outside the public web root.
4. **Markdown XSS Check:** Verify HTML sanitizers strip dangerous elements (`<script>`, `<iframe>`, inline event handlers) and inject `rel="noopener noreferrer nofollow"` on external links.
5. **Network & Secret Isolation Check:** Verify backend port 8080 remains internal to Docker bridge network and zero credentials exist in repository tracking.

### Expected Deliverable
A verified security audit checklist confirming zero OWASP Top 10 vulnerabilities.

---

## 5. Skill: `performance-audit`
- **Location:** `.cursor/skills/performance-audit/SKILL.md` & `.agents/skills/performance-audit/SKILL.md`
- **Core Principle:** Measure before and after optimizing; deliver concrete latency, throughput, and memory numbers.

### Activation Triggers
- Adding or altering database queries that operate on large or growing tables.
- Modifying Redis caching logic or Next.js ISR revalidation schedules.
- Introducing asynchronous background jobs or data transformation routines in Rust.
- Adding frontend dependencies that alter client bundle sizes or Core Web Vitals.
- Updating Docker build configurations.

### Execution Procedure
1. **Baseline Measurement:** Record current latency, query execution times, memory usage, and bundle sizes.
2. **Database Plan Audit:** Execute `EXPLAIN (ANALYZE, BUFFERS)` on PostgreSQL queries to confirm index utilization and rule out sequential scans. Check for N+1 queries.
3. **Async Runtime Audit:** Verify handlers avoid blocking calls in async Tokio routines. Ensure Redis caching leverages Bincode binary serialization. Ensure Tower-HTTP `CompressionLayer` compresses payloads over 1 KB using Brotli/zstd.
4. **Frontend Audit:** Check Next.js ISR prefetching with `<Link>`, enforce explicit image dimensions to achieve CLS < 0.1, and verify unused Tailwind CSS classes are purged.
5. **Metrics Compilation:** Compile before/after comparisons and include in the task completion report.

### Expected Deliverable
Documented performance metrics validating compliance with latency and resource targets.

---

## 6. Skill: `docker-audit`
- **Location:** `.cursor/skills/docker-audit/SKILL.md` & `.agents/skills/docker-audit/SKILL.md`
- **Core Principle:** Ensure zero host-runtime dependencies, complete containerization, robust healthchecks, and non-root execution.

### Activation Triggers
- Creating or editing `Dockerfile`, `docker-compose.yml`, or container environment configurations.
- Preparing to run automated test suites (Workflow Step 8).
- Adding new internal or external services, databases, or background workers.
- Validating cold-start container performance and persistent storage volume mappings.

### Execution Procedure
1. **Dockerfile Compliance Audit:**
   - Confirm multi-stage builds are present for compiled languages (Rust backend and Next.js standalone frontend).
   - Verify all base images use pinned version tags and slim/alpine/distroless distributions.
   - Confirm that the final stage switches to an unprivileged user (`USER appuser`).
   - Confirm that `sudo` does not appear anywhere in Dockerfiles.
2. **Docker Compose Invariants Audit:**
   - Verify every service is declared with an explicit container name, restart policy, and healthcheck.
   - Confirm inter-service dependencies use `depends_on` with `condition: service_healthy`.
   - Verify that PostgreSQL data, Redis caches, and uploaded assets reside in declared named volumes.
   - Verify that port mapping is restricted strictly to the frontend gateway (`3000:3000`), with internal services isolated on a bridge network.
3. **Startup & Health Verification:**
   - Run `docker compose config` to validate compose file syntax.
   - Run `docker compose build --no-cache` to ensure clean multi-stage compilation without host dependencies.
   - Run `docker compose up -d` and inspect `docker compose ps` until all services report `healthy`.
   - Verify HTTP responses: `curl -f http://localhost:3000/api/v2/health` and front-page HTML delivery.
   - Run `docker compose down` to verify clean container teardown.

### Expected Deliverable
A validated Docker container verification report confirming clean build, healthy service state, and volume persistence.
