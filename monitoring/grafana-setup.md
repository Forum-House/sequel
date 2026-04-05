# Grafana Setup Guide

## 1. Start Monitoring Stack
```bash
docker compose up -d prometheus grafana
```

## 2. Login to Grafana
1. Open http://localhost:3000.
2. Login with admin / admin.
3. Change password when prompted.

## 3. Add Prometheus Data Source
1. Go to Connections -> Data sources.
2. Click Add data source.
3. Choose Prometheus.
4. Set URL to http://prometheus:9090.
5. Click Save & test.

## 4. Create Dashboard Panels
Create a dashboard with the following 4 panels:

### Panel 1: Request Rate (Traffic)
- Query: `sum(rate(http_requests_total[1m]))`
- Visualization: Time series

### Panel 2: Latency p95
- Query: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`
- Visualization: Time series

### Panel 3: Error Rate
- Query: `sum(rate(http_requests_total{status=~"4..|5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100`
- Visualization: Time series

### Panel 4: CPU and Memory
- Query examples:
  - CPU: `avg(system_cpu_usage_percent)`
  - Memory: `avg(system_memory_percent)`
- Source: custom JSON metrics endpoint via exporter/bridge from /metrics.

## 5. Optional Alerts
- Create alert rule for error rate > 5% for 10 minutes.
- Create alert rule for no traffic when business hours are expected.
