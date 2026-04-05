# Configuration Reference
Environment variables and runtime configuration used by the project.

## Environment Variables

| Variable | Default | Used By | Required | Description |
|---|---|---|---|---|
| APP_ENV | development | API | No | Runtime environment label |
| API_HOST | 0.0.0.0 | API | No | API bind host |
| API_PORT | 8000 | API | No | API bind port |
| LOG_LEVEL | INFO | API | No | Log verbosity level |
| DATABASE_HOST | postgres | API | Yes | PostgreSQL host |
| DATABASE_PORT | 5432 | API | Yes | PostgreSQL port |
| DATABASE_NAME | url_shortener | API/Postgres | Yes | Database name |
| DATABASE_USER | postgres | API/Postgres | Yes | Database username |
| DATABASE_PASSWORD | postgres | API/Postgres | Yes | Database password |
| DATABASE_POOL_MAX | 10 | API | No | SQLAlchemy max pool size |
| REDIS_HOST | redis | API | Yes (for cache) | Redis host |
| REDIS_PORT | 6379 | API | Yes (for cache) | Redis port |
| REDIS_DB | 0 | API | No | Redis logical DB index |
| REDIS_PASSWORD | empty | API | No | Redis auth password |
| REDIS_CACHE_TTL_SECONDS | 60 | API | No | TTL for short code cache entries |
| REDIS_SOCKET_TIMEOUT_SECONDS | 0.3 | API | No | Redis operation timeout for fail-fast fallback |
| REDIS_SOCKET_CONNECT_TIMEOUT_SECONDS | 0.3 | API | No | Redis connect timeout for fail-fast fallback |

## Source of Truth
- Primary env template: `.env.example`
- Compose env file: `.env`
- Compose variable interpolation: `docker-compose.yml`

## Local Setup

```bash
cp .env.example .env
```

Then edit `.env` if you need non-default hostnames, credentials, or TTL.

## Validation Commands

### Show relevant compose config values
```bash
docker compose config
```

### Inspect API environment inside container
```bash
docker compose exec api env | grep -E "APP_ENV|API_|DATABASE_|REDIS_"
```

### Required grep command block

```bash
grep -nE "APP_ENV|API_HOST|API_PORT|LOG_LEVEL|DATABASE_HOST|DATABASE_PORT|DATABASE_NAME|DATABASE_USER|DATABASE_PASSWORD|DATABASE_POOL_MAX|REDIS_HOST|REDIS_PORT|REDIS_DB|REDIS_PASSWORD|REDIS_CACHE_TTL_SECONDS|REDIS_SOCKET_TIMEOUT_SECONDS|REDIS_SOCKET_CONNECT_TIMEOUT_SECONDS" .env .env.example docker-compose.yml app/cache.py
```

## Configuration Notes
- `DATABASE_HOST` and `REDIS_HOST` are service names in Compose (`postgres`, `redis`).
- In managed cloud environments, replace them with managed service endpoints.
- Low Redis timeout defaults intentionally prioritize API responsiveness when cache is degraded.
- `REDIS_CACHE_TTL_SECONDS` controls cache freshness/performance trade-off.
