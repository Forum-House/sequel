#!/bin/bash
BASE_URL="${1:-http://localhost}"
SEED_CODE="HudIG9"

echo "======================================"
echo "  LOAD TEST - URL Shortener"
echo "  Target: $BASE_URL"
echo "======================================"

echo ""
echo "--- BASELINE: 50 concurrent users (Bronze) ---"
ab -n 2000 -c 50 -q "$BASE_URL/$SEED_CODE" 2>&1 | \
  grep -E "Requests per second|Time per request|Failed requests|Percentage of"

echo ""
echo "--- SCALE: 200 concurrent users (Silver) ---"
ab -n 5000 -c 200 -q "$BASE_URL/$SEED_CODE" 2>&1 | \
  grep -E "Requests per second|Time per request|Failed requests|Percentage of"

echo ""
echo "--- TSUNAMI: 500 concurrent users (Gold) ---"
ab -n 10000 -c 500 -q "$BASE_URL/$SEED_CODE" 2>&1 | \
  grep -E "Requests per second|Time per request|Failed requests|Percentage of"

echo ""
echo "Done. Save this output to artifacts/documentation/load-test-results.md"
