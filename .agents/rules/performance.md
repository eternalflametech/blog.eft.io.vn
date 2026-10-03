---
trigger: model_decision
description: enforce high-performance async axum, redis bincode cache-aside, compression, nextjs isr, and database indexing
---

# Performance Optimization Directives

## 1. Measurement-First Methodology
- **Profile Before & After:** Never optimize based on intuition. Measure latency, query execution times, memory usage, and payload sizes before and after making changes.
- **Explain Analyze:** Run `EXPLAIN (ANALYZE, BUFFERS)` on all PostgreSQL queries involving joins, ordering, or filtering. Ensure query plans use index scans rather than sequential table scans.
- **Document Numbers:** Record concrete metric comparisons (response time in ms, memory delta in MB, throughput req/s) in task reports.

## 2. Database Layer Optimization
- **Index Architecture:** Index all foreign keys, status filters (`status = 'published'`), timestamp orderings (`published_at DESC`), and slug columns (`slug UNIQUE`).
- **Connection Pooling:** Tune SQLx `PgPool` with sensible min/max connection pools suitable for the deployment environment.
- **Eliminate N+1 Queries:** Never issue separate queries in a loop for post tags, authors, or asset associations. Use composite SQL joins, subqueries, or batch queries (`WHERE id = ANY(...)`).

## 3. Rust Backend & Axum Runtime
- **Tokio Non-Blocking Operations:** Never call synchronous or blocking functions (`std::thread::sleep`, synchronous filesystem operations, unbuffered I/O) within async Axum handler routines. Offload unavoidable CPU-bound tasks to `tokio::task::spawn_blocking`.
- **Minimal Memory Overhead:** Keep idle Axum memory footprint lean (target 4-6 MB). Avoid cloning large heap structures; pass data via immutable references (`&Arc<State>`) or streaming bodies.
- **Cache-Aside with Redis & Bincode:** Cache serialized article payloads in Redis using Bincode binary serialization. Target ~0.1ms cache retrieval latency. Invalidate cached keys immediately upon post update or deletion.
- **HTTP Compression:** Use Tower-HTTP `CompressionLayer` to automatically compress API responses exceeding 1 KB with Brotli (`br`), Zstandard (`zstd`), or Gzip based on client `Accept-Encoding`.

## 4. Next.js Frontend & Core Web Vitals
- **Incremental Static Regeneration (ISR):** Render public blog pages statically at build time or during initial request, then revalidate at scheduled intervals (`revalidate: 60`).
- **Prefetching:** Utilize Next.js `<Link>` components to automatically prefetch route payloads on hover, enabling instant SPA navigation.
- **Image Optimization:** Serve responsive images using modern formats (WebP/AVIF), explicit aspect ratios to avoid Cumulative Layout Shift (CLS < 0.1), and lazy loading for off-screen assets.
- **Tailwind Purging:** Configure Tailwind content paths accurately to purge unused CSS, delivering minimal stylesheet bundles.
- **Core Web Vitals Thresholds:** Enforce LCP < 2.5s, INP < 200ms, and CLS < 0.1 across all public blog pages.

## 5. Docker Packaging & Multi-Stage Builds
- **Multi-Stage Builds:** Separate build stages from runtime stages. Build the Rust binary in a full toolchain container with release optimizations (`--release`), then copy the binary into a minimal runtime image (Alpine or distroless).
- **Frontend Standalone Output:** Configure `output: 'standalone'` in Next.js to produce a stripped-down Node.js runtime container without extraneous dev dependencies.
- **Layer Caching:** Order Dockerfile instructions from least frequently changed (package manifests) to most frequently changed (source code) to maximize Docker build layer caching.
