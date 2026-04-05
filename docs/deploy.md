# Deployment Guide
How to deploy this URL shortener locally and on Render, with health checks and rollback steps.

## Local Deployment (Docker Compose)

### 1. Prepare environment
```bash
cp .env.example .env
```

### 2. Build and start
```bash
docker compose down -v
docker compose up -d --build
```

### 3. Verify readiness
```bash
docker compose ps
curl -i http://localhost/health
curl -i http://localhost/users/1
curl -i http://localhost/HudIG9
```

### 4. Optional full smoke test
```bash
bash final_test.sh
```

Windows:
```powershell
powershell -ExecutionPolicy Bypass -File .\final_test.ps1
```

## Render Deployment (Reference Approach)

This repo is Compose-first for local execution. For Render deployment, split into dedicated services.

### Recommended service layout
1. Web Service: FastAPI app (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
2. Key Value: Redis instance
3. PostgreSQL: Managed Postgres database
4. Optional static web service for frontend assets

### Render Setup Steps
1. Create managed Postgres and Redis in Render dashboard.
2. Create Web Service from this repository.
3. Set build command and start command:

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

4. Configure environment variables (see table below).
5. Deploy and validate `/health`, `/users/1`, and redirect behavior.

## Required Environment Variables

| Variable | Local Default | Render Guidance |
|---|---|---|
| APP_ENV | development | production |
| API_HOST | 0.0.0.0 | 0.0.0.0 |
| API_PORT | 8000 | use `$PORT` in start command |
| DATABASE_HOST | postgres | Render Postgres host |
| DATABASE_PORT | 5432 | Render Postgres port |
| DATABASE_NAME | url_shortener | Render database name |
| DATABASE_USER | postgres | Render DB user |
| DATABASE_PASSWORD | postgres | Render DB password |
| DATABASE_POOL_MAX | 10 | tune by plan size |
| REDIS_HOST | redis | Render Redis host |
| REDIS_PORT | 6379 | Render Redis port |
| REDIS_DB | 0 | 0 unless overridden |
| REDIS_PASSWORD | empty | Render Redis password |
| REDIS_CACHE_TTL_SECONDS | 60 | 60 to 300 typical |
| REDIS_SOCKET_TIMEOUT_SECONDS | 0.3 | keep low for fallback speed |
| REDIS_SOCKET_CONNECT_TIMEOUT_SECONDS | 0.3 | keep low for fallback speed |

## Post-Deploy Health Checklist

```bash
curl -i https://<service-url>/health
curl -i https://<service-url>/users/1
curl -i https://<service-url>/HudIG9
```

Expected:
- `/health` returns 200.
- Seeded user endpoint returns 200.
- Seeded short code returns 302.

## Rollback Procedure

### Trigger Conditions
- Sustained 5xx rates.
- Health endpoint failing after deploy.
- Critical endpoint regression.

### Steps
1. Identify previous known-good commit.
2. Redeploy previous revision.
3. Re-run health checklist and smoke tests.
4. Capture incident summary in runbooks.

Local command flow:
```bash
git log --oneline
git checkout <known_good_commit>
docker compose up -d --build
curl -i http://localhost/health
```

## Common Deployment Errors

### Error: API starts but `/health` fails
- Cause: DB or Redis host/credentials invalid.
- Fix: Re-check env vars and service connectivity.

### Error: Seed not loaded in deployed environment
- Cause: CSV files unavailable in runtime image or startup path mismatch.
- Fix: Confirm seed files are copied/mounted and startup loader runs.

### Error: Redirect latency spikes during Redis outage
- Cause: Timeout values too high, delaying DB fallback.
- Fix: Keep Redis socket/connect timeouts low.
