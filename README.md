# URL Shortener Platform
Production-focused URL shortener built for reliability, observability, and testable operations.

![Tests](https://img.shields.io/badge/tests-31%2F31%20passing-brightgreen)
![Python](https://img.shields.io/badge/python-3.13-blue)
![Docker](https://img.shields.io/badge/docker-compose-2496ED)
![Redis](https://img.shields.io/badge/redis-7-red)
![PostgreSQL](https://img.shields.io/badge/postgresql-16-336791)

## What This Project Is

This project delivers a complete short-link platform with:

- FastAPI backend for users, URLs, redirects, and events
- PostgreSQL as source of truth
- Redis read-through cache for redirect acceleration
- Nginx as ingress and reverse proxy
- Docker Compose for reproducible startup
- End-to-end validation scripts for Linux and Windows

## System Characteristics

### Reliability
- Redirect flow is resilient to Redis failures via PostgreSQL fallback.
- Startup seeding is validated and FK-safe.
- Event writes on hot paths are best-effort to reduce user-facing failures.

### Performance
- Redirect path uses cache-first lookup with TTL-based entries.
- Low Redis socket/connect timeouts keep fallback decisions fast.
- Indexed short-code lookups in PostgreSQL support efficient fallback reads.

### Operability
- Health endpoint: `/health`
- Structured request logging with request IDs in middleware.
- Runbooks and troubleshooting docs cover incident handling and recovery.

### Data Integrity
- Users and URLs enforce relational constraints.
- Events preserve audit history and support nullable foreign keys with `ON DELETE SET NULL`.
- Validation rejects invalid payloads and malformed URLs.

### Testability
- Full automated checks across health, seed integrity, API behavior, events, and Redis chaos.
- Idempotent Linux test suite with per-run identities.
- Windows-native test runner included.

## Quick Start

1. Create environment file.

```bash
cp .env.example .env
```

2. Build and start services.

```bash
docker compose down -v
docker compose up -d --build
```

3. Verify service health.

```bash
curl -i http://localhost/health
```

4. Open application.

- http://localhost

## Run Validation

Linux/macOS:

```bash
bash final_test.sh
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\final_test.ps1
```

## API At A Glance

| Domain | Endpoint | Methods | Purpose |
|---|---|---|---|
| Health | `/health` | GET | Liveness/readiness |
| Users | `/users` | GET, POST | List/create users |
| Users | `/users/{user_id}` | GET, PUT | Read/update user |
| Users | `/users/bulk` | POST | CSV import |
| URLs | `/urls` | GET, POST | List/create URLs |
| URLs | `/urls/{url_id}` | GET, PUT | Read/update URL |
| Redirect | `/{short_code}` | GET | Resolve short link |
| Events | `/events` | GET | List/filter events |

## Read Docs By Characteristic

| Characteristic | Primary Docs |
|---|---|
| Architecture and flow | [docs/README.md](docs/README.md), [docs/architecture.md](docs/architecture.md) |
| API behavior | [docs/api.md](docs/api.md) |
| Reliability and incidents | [docs/troubleshooting.md](docs/troubleshooting.md), [docs/runbooks.md](docs/runbooks.md) |
| Scalability and performance | [docs/capacity-plan.md](docs/capacity-plan.md) |
| Operations and release | [docs/deploy.md](docs/deploy.md), [docs/config.md](docs/config.md) |
| Trade-offs and rationale | [docs/decision-log.md](docs/decision-log.md) |

## Repository Layout

```text
PE-Hackathon-Template-2026/
	app/
	backend/data/
	docs/
	docker-compose.yml
	init.sql
	final_test.sh
	final_test.ps1
```
