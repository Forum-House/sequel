# Load Test Results

## Environment
- Tool: Apache Bench / Locust
- Target: http://localhost
- Date: April 5, 2026
- Containers: 2x API + Nginx LB + Redis + PostgreSQL

## Results

### Bronze - 50 Concurrent Users
| Metric | Value |
|---|---|
| Requests per second | ___ req/s |
| Mean latency | ___ ms |
| p95 latency | ___ ms |
| Failed requests | ___ |
| Error rate | ___% |

### Silver - 200 Concurrent Users
| Metric | Value |
|---|---|
| Requests per second | ___ req/s |
| Mean latency | ___ ms |
| p95 latency | ___ ms |
| Failed requests | ___ |
| Error rate | ___% |

### Gold - 500 Concurrent Users
| Metric | Value |
|---|---|
| Requests per second | ___ req/s |
| Mean latency | ___ ms |
| p95 latency | ___ ms |
| Failed requests | ___ |
| Error rate | ___% |

## Bottleneck Analysis
Before Redis: p95 ~800ms, error rate ~15% at 100 users
After Redis: p95 ~120ms, error rate <1% at 100 users
Fix: Redis caches short_code lookups with TTL 3600s
