# Incident Response Report

## INC-001: Application Startup Failure
- Date: April 5, 2026 00:18 IST
- Duration: 45 minutes
- Severity: P1 - App failed to start, restart loop

## Impact
- API service did not become healthy.
- Redirect and CRUD endpoints were unavailable.
- Nginx returned upstream errors during restart loop window.

## Timeline
- 00:18 IST: Alert triggered for repeated healthcheck failures.
- 00:22 IST: On-call reviewed container logs and found database constraint errors during seed.
- 00:31 IST: Root cause narrowed to foreign-key violations in seed URL rows.
- 00:42 IST: Seed logic patched to validate user IDs strictly before URL/event inserts.
- 00:54 IST: Stack restarted with clean validation checks.
- 01:03 IST: Health endpoint stable and API functionality restored.

## Root Cause
Seed loader accepted non-strict user validity assumptions, allowing URL inserts referencing users that did not exist by ID. This triggered foreign-key violations and startup failure.

## Resolution
- Fixed seed pipeline to validate exact user ID existence.
- Kept defensive skip logic for invalid URL/event references.
- Revalidated startup and endpoint checks after redeploy.

## Verification
- /health returned 200 consistently.
- Seed completed without FK exceptions.
- Full test suite returned passing status.

## Lessons Learned
- Startup seeding must enforce strict referential integrity checks.
- Healthchecks should fail fast with actionable logs.
- Structured logging is required for quick root-cause detection.

## Follow-up Actions
- Added structured JSON logging for key events.
- Added metrics and monitoring stack (Prometheus + Grafana).
- Added alerting runbook for service-down and high-error conditions.
