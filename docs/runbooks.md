# Runbooks
Operational response playbooks for common production and validation incidents.

## 1. Redis Unavailable

### Trigger
- Redirect latency increases.
- Cache hit ratio drops.
- Redis container marked unhealthy/stopped.

### Diagnosis
```bash
docker compose ps redis
docker compose logs --tail=200 redis
docker compose logs --tail=200 api
```

### Resolution
1. Confirm API is still serving redirects via DB fallback.
2. Restart Redis container.
3. Re-run redirect checks for seeded and newly created short codes.

```bash
docker compose restart redis
curl -i http://localhost/HudIG9
curl -i http://localhost/<recent_short_code>
```

### Post-Incident Notes
- Verify no widespread 5xx from API during outage.
- Keep socket/connect Redis timeouts low to avoid fallback stalls.

## 2. Postgres Unavailable

### Trigger
- `/health` fails.
- User/URL/event API operations fail.
- API logs show DB connection errors/timeouts.

### Diagnosis
```bash
docker compose ps postgres
docker compose logs --tail=200 postgres
docker compose logs --tail=200 api
```

### Resolution
1. Validate DB env vars and credentials.
2. Restart Postgres, then API.
3. Re-test health and critical CRUD endpoints.

```bash
docker compose restart postgres
docker compose restart api
curl -i http://localhost/health
curl -i http://localhost/users/1
```

### Post-Incident Notes
- Check for crash-loop causes in `init.sql` or volume state.
- Document recovery time and data integrity outcome.

## 3. Healthcheck Flapping During Startup

### Trigger
- Containers alternate healthy/unhealthy after launch.
- Nginx starts before API is fully ready.

### Diagnosis
```bash
docker compose ps
docker compose logs --tail=200 api
docker compose logs --tail=200 nginx
```

### Resolution
1. Verify healthcheck commands and `start_period` values in compose file.
2. Rebuild and relaunch cleanly.

```bash
docker compose down
docker compose up -d --build
```

### Post-Incident Notes
- Keep API probe deterministic (`python -c urllib` probe in current config).
- Maintain explicit startup grace period for nginx healthcheck.

## 4. Seed Integrity Failure

### Trigger
- Known seeded users or short codes missing.
- Startup logs show FK or parse errors in seeding.

### Diagnosis
```bash
docker compose logs --tail=300 api
docker compose exec api ls -lah /app/seed
curl -s http://localhost/users/1
curl -i http://localhost/HudIG9
```

### Resolution
1. Validate CSV mounts and header formats.
2. Ensure strict ID-based user validity in seed flow.
3. If needed, reset local DB volume and reseed.

```bash
docker compose down -v
docker compose up -d --build
```

### Post-Incident Notes
- Record row counts loaded for users, URLs, events.
- Verify no FK violations remain in startup logs.

## 5. Automated Test Rerun Failures

### Trigger
- `final_test.sh` fails on duplicate user creation during repeated runs.

### Diagnosis
```bash
bash final_test.sh
grep -n "PRIMARY_USER\|OWNER_USER\|USER_ID" final_test.sh
```

### Resolution
1. Ensure per-run unique test identities are enabled.
2. Ensure script exits early when `USER_ID` extraction fails.
3. Re-run without resetting stack to verify idempotency.

```bash
bash final_test.sh
bash final_test.sh
```

### Post-Incident Notes
- Prefer deterministic, self-contained tests over one-time-only scripts.
- Keep Windows parity with `final_test.ps1` for local QA.
