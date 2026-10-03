---
name: performance-audit
description: Audit and optimize database queries, async runtime execution, Redis cache-aside serialization, compression layers, and Core Web Vitals.
---

# Performance Audit Skill

## Purpose
Systematically benchmark, profile, and optimize application throughput, memory consumption, cache hit ratios, and client loading speeds across the full technology stack.

## Activation Criteria
Activate this skill whenever:
- Adding or altering database queries that operate on growing tables (posts, tags, assets).
- Implementing or modifying caching logic in Redis or ISR revalidation in Next.js.
- Introducing new async tasks or CPU-intensive routines in the Rust Axum backend.
- Adding frontend dependencies or visual components that could impact bundle size or Core Web Vitals.
- Configuring Docker build layers or container deployment specifications.

## Procedure
1. **Benchmark Baseline:**
   - Measure current request latency, memory usage, and throughput before making code adjustments.
2. **Audit Database Performance:**
   - Run `EXPLAIN (ANALYZE, BUFFERS)` on all modified SQL queries.
   - Verify index utilization on foreign keys, slug lookups, and status filters.
   - Confirm absence of N+1 query patterns; replace repetitive queries with batch operations or joins.
3. **Audit Async Backend:**
   - Verify zero blocking calls exist in async Axum handlers; ensure any unavoidable blocking tasks run in `tokio::task::spawn_blocking`.
   - Verify Redis caching uses Bincode binary serialization.
   - Verify Tower-HTTP `CompressionLayer` is configured for responses larger than 1 KB (Brotli/zstd).
   - Verify Axum idle memory footprint remains lean (target 4-6 MB).
4. **Audit Frontend & Core Web Vitals:**
   - Verify public pages leverage Next.js ISR with `<Link>` prefetching.
   - Ensure images specify width/height attributes to prevent Cumulative Layout Shift (CLS < 0.1).
   - Check that unused Tailwind classes are purged.
5. **Report Performance Metrics:**
   - Compare and document before/after benchmark measurements in the task execution report.
