---
name: docker-audit
description: Verify Dockerfiles, Docker Compose service definitions, healthchecks, named volumes, non-root users, and clean container startup.
---

# Docker Audit Skill

## Purpose
Audit the containerization architecture across all services to verify strict compliance with Docker-first principles, multi-stage optimization, security isolation, and reproducible execution on Debian 13 hosts.

## Activation Criteria
Activate this skill whenever:
- Creating or editing `Dockerfile`, `docker-compose.yml`, or container environment configurations.
- Preparing to run automated test suites (Workflow Step 8).
- Adding new internal or external services, databases, or background workers.
- Validating cold-start container performance and persistent storage volume mappings.

## Procedure
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
