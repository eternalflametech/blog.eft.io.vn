# Stage 1: Toolchain builder
FROM rust:1.99-bookworm AS builder

WORKDIR /app

# Pre-fetch and cache crate dependencies
COPY Cargo.toml ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && echo "pub fn lib() {}" > src/lib.rs && mkdir -p src/bin && echo "fn main() {}" > src/bin/eft-cli.rs
RUN cargo build --release || true
RUN rm -rf src

# Copy source code and database migrations
COPY migrations ./migrations
COPY src ./src
COPY tests ./tests

# Recompile application binaries in release mode
RUN touch src/main.rs src/lib.rs src/bin/eft-cli.rs && cargo build --release

# Stage 2: Minimal unprivileged runtime
FROM debian:bookworm-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root application user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/sh -d /app appuser

# Prepare assets directory with correct non-root permissions
RUN mkdir -p /data/assets && chown -R appuser:appgroup /data/assets /app

# Copy compiled binary artifacts from builder stage
COPY --from=builder /app/target/release/eft-backend /app/eft-backend
COPY --from=builder /app/target/release/eft-cli /usr/local/bin/eft-cli

USER appuser

ENV PORT=8080
ENV ASSETS_DIR=/data/assets

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=10s \
    CMD wget -qO- http://127.0.0.1:8080/api/v2/health || exit 1

CMD ["/app/eft-backend"]
