# Docker Architecture & Operations Manual

## 1. Overview & Docker-First Mandate
The Eternal Flame Tech Blog operates on a strict Docker-first runtime model. All components (Rust Axum backend, Next.js frontend, PostgreSQL database, and Redis cache) run as isolated containers within a unified Docker Compose bridge network.

No host-level installations of Rust, Node.js, npm, or PostgreSQL are required to run the application. The only host requirement is Docker Engine and Docker Compose.

---

## 2. Docker Quickstart Path
A developer or administrator on a fresh Debian 13 host can start the complete application in three commands:

```bash
# 1. Clone repository
git clone https://github.com/eternalflametech/blog.eft.io.vn.git
cd blog.eft.io.vn

# 2. Configure environment
cp .env.example .env

# 3. Launch full stack
docker compose up -d --build
```

### Initial Credentials & Forced Password Change
On first launch, database migrations automatically seed the root administrator account:
- **Email:** `admin@eft.io.vn`
- **Initial Password:** `admin` (not stored in `.env` for security)
- **Role:** `admin` (Full Administrator)
- **Security Policy:** Immediately upon login, a non-dismissible modal forces the administrator to update their password to a secure custom passphrase.
- **Initial Posts:** Clean zero-state (no hardcoded mock posts).

Access points:
- **Frontend & Public Gateway:** `http://localhost:3000`
- **Internal API Proxy:** `http://localhost:3000/api/v2/*`
- **Health Check Endpoint:** `http://localhost:3000/api/v2/health`

---

## 3. Docker Compose Service Layout
The system defines four core application services plus an optional Cloudflare Zero Trust tunnel service, all connected via a dedicated bridge network (`eft-net`):

```
[ Internet / Edge Traffic ]
            │
            ├──► [ Cloudflare Edge SSL ]
            │           │
            │           ▼ (Encrypted Zero Trust Tunnel)
            │   ┌────────────────────────────────┐
            │   │    cloudflared (eft-net)       │
            │   └───────────────┬────────────────┘
            │                   │ http://frontend:3000
            ▼ :3000 (Local Dev) │
┌───────────────────────────────┴───────────────┐
│              frontend (Next.js)               │
│  - Port 3000 exposed to host                  │
│  - API proxy rewrites /api/v2/* to backend    │
│  - Multi-stage standalone Node.js Alpine      │
└──────────────────────┬────────────────────────┘
                       │ Docker Internal Network (eft-net)
                       ▼
┌───────────────────────────────────────────────┐
│               backend (Axum)                  │
│  - Port 8080 internal only (never exposed)    │
│  - Tokio async runtime + Tower-HTTP           │
│  - Multi-stage compiled Rust binary           │
└──────────────┬─────────────────┬──────────────┘
               │                 │
               ▼                 ▼
┌──────────────────────┐ ┌──────────────────────┐
│  postgres (PostgreSQL)│ │    redis (Redis)     │
│  - Named volume      │ │  - Named volume      │
│  - Compile-time SQL  │ │  - Bincode Cache     │
└──────────────────────┘ └──────────────────────┘
```

### Service Invariants
- `frontend`: Builds from multi-stage Dockerfile, runs standalone Next.js server as non-root user `node`.
- `backend`: Builds from multi-stage Dockerfile, compiles release binary in builder stage, runs as non-root `appuser` in minimal runtime image.
- `postgres`: Official PostgreSQL image with declared healthcheck (`pg_isready -U postgres`).
- `redis`: Official Redis image with declared healthcheck (`redis-cli ping`).
- `cloudflared`: Official pinned image `cloudflare/cloudflared:2026.9.3` managed via Docker Compose profile (`profiles: ["tunnel"]`). Runs non-root tunnel connecting securely to Cloudflare Edge.

---

## 4. Cloudflare Tunnel Operations (Zero Trust)
To publish the application securely without opening inbound ports:
1. Obtain the **Tunnel Token** from the Cloudflare Zero Trust Dashboard (*Networks* > *Tunnels*).
2. Configure `.env`:
   ```bash
   COMPOSE_PROFILES=tunnel
   CLOUDFLARE_TUNNEL_TOKEN=<your-token>
   ```
3. Set Cloudflare Public Hostname origin to `http://frontend:3000` (or `http://eft-frontend:3000`).
4. Start with tunnel:
   ```bash
   docker compose up -d
   # Or explicitly invoke profile via CLI:
   docker compose --profile tunnel up -d
   ```
5. Inspect tunnel health and logs:
   ```bash
   docker compose logs -f cloudflared
   ```

---

## 5. Named Volumes & State Persistence
All persistent application state lives strictly in declared named volumes:
- `eft_pgdata`: Stores PostgreSQL database records and relational tables.
- `eft_redisdata`: Stores Redis cache snapshots and session data.
- `eft_assets`: Stores uploaded media files and WebP optimized assets outside web roots.

Anonymous volumes and host bind mounts into the source repository tree for persistent state are strictly prohibited.

---

## 6. Secrets Management & Environment Configuration
Configuration is injected dynamically via environment variables:
- **Environment Variables:** Loaded via `.env` file or Docker Compose environment blocks.
- **Git Exclusion:** `.env`, `.env*.local`, and Docker secret files are strictly excluded via `.gitignore`.
- **Zero Hardcoding:** No passwords, cryptographic keys, or host URLs are hardcoded in `docker-compose.yml`.

---

## 7. Dev-Host Sudo Policy
On the dedicated Debian 13 development host:
- `sudo` is available without restriction to manage the container host environment (e.g. `sudo apt-get install -y docker-ce`, `sudo usermod -aG docker $USER`, managing systemd units, configuring local firewalls).
- `sudo` must **NEVER** be embedded into Dockerfiles, Compose files, Makefile targets, or project automation scripts.
- The delivered application and all container processes run as unprivileged, non-root users.
