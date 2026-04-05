# Decision Log
Architecture and implementation decisions made for this project, with trade-offs and outcomes.

## D-001: FastAPI for API Layer
- Date: 2026-04
- Decision: Use FastAPI as primary web framework.
- Why: High developer velocity, strong async support, built-in OpenAPI docs, clean validation with Pydantic.
- Trade-off: Requires async-aware coding patterns and careful DB session handling.
- Outcome: Stable CRUD/redirect/event endpoints with consistent 422 validation behavior.

## D-002: PostgreSQL as Source of Truth
- Date: 2026-04
- Decision: Use PostgreSQL for durable persistence.
- Why: Reliable relational model, constraints, indexing for short codes and foreign keys.
- Trade-off: Need explicit pool and connection tuning under load.
- Outcome: Users, URLs, and Events persisted with predictable query behavior.

## D-003: Redis for Read-Path Acceleration
- Date: 2026-04
- Decision: Add Redis cache for `short_code -> original_url` lookups.
- Why: Redirect path is read-heavy and latency-sensitive.
- Trade-off: Cache invalidation and outage handling complexity.
- Outcome: Fast cache-hit redirects, plus DB fallback when Redis is unavailable.

## D-004: Nginx as Single Ingress
- Date: 2026-04
- Decision: Route client traffic through Nginx.
- Why: Centralized entrypoint, easier proxy behavior control, future rate-limiting/WAF hooks.
- Trade-off: Extra moving part and healthcheck coordination.
- Outcome: Clean ingress architecture and stable local deployment behavior.

## D-005: Docker Compose for Local Platform Orchestration
- Date: 2026-04
- Decision: Standardize local runtime via Compose.
- Why: One-command multi-service startup and reproducible judge/demo environment.
- Trade-off: Compose health/start ordering can be sensitive during cold boot.
- Outcome: Reliable startup after tuning healthchecks and start periods.

## D-006: Async SQLAlchemy + asyncpg
- Date: 2026-04
- Decision: Use SQLAlchemy 2 async engine and asyncpg driver.
- Why: Fits async API stack and supports scalable concurrent I/O.
- Trade-off: Session lifecycle errors are easier to introduce than sync patterns.
- Outcome: Stable endpoint execution after commit/refresh hardening.

## D-007: Seed Data Loaded at API Startup
- Date: 2026-04
- Decision: Load CSV seed data during app lifespan startup.
- Why: Predictable baseline state for tests and demos.
- Trade-off: Startup logic must be idempotent and FK-safe.
- Outcome: Stable startup after strict ID-based validity checks in seeding.

## D-008: Nullable Event Foreign Keys with ON DELETE SET NULL
- Date: 2026-04
- Decision: Keep event records even if referenced URL/User is removed.
- Why: Preserve analytics history and operational traceability.
- Trade-off: Event rows may lose direct parent linkage over time.
- Outcome: Schema updated in `init.sql` to align with behavior expectations.

## D-009: Redirect Path Must Not Auto-Redirect on Slash Variants
- Date: 2026-04
- Decision: Disable automatic slash redirects in FastAPI app config.
- Why: Short-code paths must be exact and should not mutate via framework behavior.
- Trade-off: Strict path handling requires explicit route definitions.
- Outcome: `redirect_slashes=False` used in app initialization for deterministic routing.

## D-010: Fast Redis Timeout Strategy
- Date: 2026-04
- Decision: Use low Redis socket/connect timeout defaults.
- Why: Prevent cache outages from degrading redirect SLA.
- Trade-off: More frequent cache misses under transient network jitter.
- Outcome: Better user-perceived reliability in chaos tests.

## D-011: Idempotent End-to-End Test Design
- Date: 2026-04
- Decision: Generate unique test users per run in `final_test.sh`.
- Why: Avoid rerun failures from duplicate identity collisions.
- Trade-off: Test data grows unless environment is periodically reset.
- Outcome: Repeated local runs succeed without mandatory `down -v` before each run.
