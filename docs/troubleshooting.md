# Troubleshooting
Known production and test-environment issues, plus exact fixes applied in this implementation.

## Bug History

### Bug 1: FK violations during startup seeding
- Date discovered: During first Docker startup validation.
- Symptom: `urls_user_id_fkey` violations while loading URL seed rows.
- Root cause: Seed logic marked user IDs as valid using broad username/email existence checks rather than strict `id` existence.
- Fix: In `app/seed.py`, changed user validity tracking to only mark IDs that actually exist in `users.id`.
- Verification: Rebuilt stack with clean volumes; startup completed and no FK violations appeared in API logs.
- Status: Closed.

### Bug 2: API/Nginx healthcheck instability in containers
- Date discovered: During full `docker compose up --build` reliability runs.
- Symptom: Services reported unhealthy or flapped during boot.
- Root cause: Health probes used tools/targets that were brittle at startup timing.
- Fix: Updated `docker-compose.yml` healthchecks to use Python-based API probe and safer nginx probe host/start-period settings.
- Verification: Containers reached healthy state consistently across repeated launches.
- Status: Closed.

### Bug 3: POST /users intermittent serialization failure
- Date discovered: During automated endpoint suite execution.
- Symptom: `POST /users` occasionally failed along event-write path.
- Root cause: Event insert/commit flow could disrupt subsequent response-ready user state.
- Fix: Hardened event write handling in `app/routers/users.py` and ensured user refresh before returning response.
- Verification: User create and duplicate tests passed repeatedly in both shell and PowerShell suites.
- Status: Closed.

### Bug 4: Event FK schema mismatch with expected nullable behavior
- Date discovered: During cross-check between ORM/runtime behavior and SQL schema.
- Symptom: Inconsistent handling for missing/deleted URL/User references in events.
- Root cause: SQL schema constraints did not reflect desired nullable FK semantics.
- Fix: Updated `init.sql` to make `events.url_id` and `events.user_id` nullable with `ON DELETE SET NULL`.
- Verification: Schema recreated via clean startup and event queries/operations behaved as expected.
- Status: Closed.

### Bug 5: Redis chaos fallback occasionally stalled
- Date discovered: During Redis stop/restart chaos checks.
- Symptom: Redirect endpoints could lag when Redis was unavailable.
- Root cause: Redis socket/connect timeouts were too permissive, delaying fallback path.
- Fix: Added low default timeouts in `app/cache.py` for `socket_timeout` and `socket_connect_timeout`.
- Verification: Redirects succeeded against DB fallback while Redis was down and recovered normally after restart.
- Status: Closed.

### Bug 6: Test reruns failed due to fixed identity collisions
- Date discovered: On repeated executions of `final_test.sh`.
- Symptom: Duplicate username/email checks failed early and caused cascading assertions.
- Root cause: Script reused static user identity values each run.
- Fix: Made test identities unique per execution in `final_test.sh` and added guard to fail early if `USER_ID` extraction is empty.
- Verification: Multiple reruns passed without requiring DB reset when stack was healthy.
- Status: Closed.

## Common Symptoms and Quick Checks

### Health endpoint failing
```bash
docker compose ps
docker compose logs --tail=150 api
docker compose logs --tail=150 nginx
curl -i http://localhost/health
```

### Redirect returns 404 unexpectedly
```bash
curl -i http://localhost/<short_code>
curl -s http://localhost/urls/<url_id>
curl -s "http://localhost/events?url_id=<url_id>"
```

### Seed data not appearing
```bash
docker compose logs --tail=250 api
docker compose exec api ls -lah /app/seed
curl -s http://localhost/users/1
```

### Redis outage simulation
```bash
docker compose stop redis
curl -i http://localhost/HudIG9
docker compose start redis
```

## Validation Snapshot

Latest stable validation run:
- Full functional checks passed.
- Seed integrity checks passed.
- Redis chaos fallback checks passed.
- Final status: 31/31 checks passing.
-
