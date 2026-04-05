#!/bin/bash
BASE="http://localhost"
PASS=0
FAIL=0
TEST_SUFFIX="$(date +%s)-$RANDOM"
PRIMARY_USER="testuser_final_${TEST_SUFFIX}"
PRIMARY_EMAIL="final_${TEST_SUFFIX}@test.com"
OWNER_USER="urlowner_x9_${TEST_SUFFIX}"
OWNER_EMAIL="ownerx9_${TEST_SUFFIX}@test.com"

check() {
  local desc=$1 expected=$2 actual=$3
  if [ "$actual" == "$expected" ]; then
    echo "✅ $desc"
    ((PASS++))
  else
    echo "❌ FAIL: $desc"
    echo "   Expected: $expected"
    echo "   Got:      $actual"
    ((FAIL++))
  fi
}

echo ""
echo "======================================"
echo "  URL SHORTENER — FINAL TEST SUITE"
echo "======================================"

# ── SEED DATA VERIFICATION (run this first) ──
echo ""
echo "── SEED DATA ──"

# Verify known user from users.csv id=1 → cobaltlagoon85
SEED_USER=$(curl -s $BASE/users/1 | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d.get('username') or d.get('data',{}).get('username','MISSING'))" 2>/dev/null)

check "GET /users/1 returns cobaltlagoon85 (seed user)" "cobaltlagoon85" "$SEED_USER"

# Verify known user from users.csv id=2 → urbananchor00
SEED_USER2=$(curl -s $BASE/users/2 | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d.get('username') or d.get('data',{}).get('username','MISSING'))" 2>/dev/null)

check "GET /users/2 returns urbananchor00 (seed user)" "urbananchor00" "$SEED_USER2"

# Verify known short_code from urls.csv → HudIG9 (user_id=6, active=True)
SEED_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" $BASE/HudIG9)
check "GET /HudIG9 returns 302 (seed short_code)" "302" "$SEED_REDIRECT"

# Verify a known INACTIVE short_code from urls.csv → xrf6Jp (is_active=False)
INACTIVE_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" $BASE/xrf6Jp)
check "GET /xrf6Jp returns 404 (inactive seed URL)" "404" "$INACTIVE_REDIRECT"

# Verify events seed loaded — seed uses event_type "created"
SEED_EVENTS=$(curl -s "$BASE/events?url_id=1")
SEED_EVENT_TYPE=$(echo $SEED_EVENTS | python3 -c "
import sys,json
d=json.load(sys.stdin)
items = d if isinstance(d,list) else d.get('data',d.get('events',[]))
types = [i.get('event_type','') for i in items]
print(types[0] if types else 'MISSING')" 2>/dev/null)

check "Seed events loaded (event_type=created)" "created" "$SEED_EVENT_TYPE"

# ── USERS ──────────────────────────────────
echo ""
echo "── USERS ──"

check "POST /users returns 201" "201" \
  $(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/users \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${PRIMARY_USER}\",\"email\":\"${PRIMARY_EMAIL}\"}")

check "POST /users duplicate returns 409" "409" \
  $(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/users \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${PRIMARY_USER}\",\"email\":\"${PRIMARY_EMAIL}\"}")

check "POST /users bad type returns 422" "422" \
  $(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/users \
    -H "Content-Type: application/json" \
    -d '{"username":123,"email":"bad"}')

check "GET /users/99999 returns 404" "404" \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/users/99999)

USER_ID=$(curl -s -X POST $BASE/users \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${OWNER_USER}\",\"email\":\"${OWNER_EMAIL}\"}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)

if [ -z "$USER_ID" ]; then
  echo "❌ FAIL: Could not create owner user; USER_ID is empty"
  echo "   This usually means POST /users failed unexpectedly."
  ((FAIL++))
  echo ""
  echo "======================================"
  echo "  RESULTS: $PASS passed, $FAIL failed"
  echo "======================================"
  exit 1
fi

check "GET /users/:id returns 200" "200" \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/users/$USER_ID)

# ── BULK IMPORT (with real seed format) ────
echo ""
echo "── BULK IMPORT ──"

# Use REAL seed format: id,username,email,created_at
echo "id,username,email,created_at
9001,bulkseeduser1,bulkseed1@test.com,2025-01-01 00:00:00
9002,bulkseeduser2,bulkseed2@test.com,2025-01-02 00:00:00
,missingid@test.com,
badrow" > /tmp/test_seed_real.csv

BULK_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/users/bulk \
  -F "file=@/tmp/test_seed_real.csv")
check "POST /users/bulk returns 200" "200" "$BULK_CODE"

BULK_COUNT=$(curl -s -X POST $BASE/users/bulk \
  -F "file=@/tmp/test_seed_real.csv" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); \
    print(d.get('imported_count', d.get('data',{}).get('imported_count','MISSING')))" 2>/dev/null)
check "POST /users/bulk returns imported_count >= 0" "true" \
  $(python3 -c "print('true' if str('$BULK_COUNT').isdigit() else 'false')" 2>/dev/null)

# Verify bulk-imported user with preserved ID
BULK_USER=$(curl -s $BASE/users/9001 | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d.get('username') or d.get('data',{}).get('username','MISSING'))" 2>/dev/null)
check "GET /users/9001 returns bulkseeduser1 (ID preserved)" "bulkseeduser1" "$BULK_USER"

# ── URLS ───────────────────────────────────
echo ""
echo "── URLS ──"

check "POST /urls returns 201" "201" \
  $(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/urls \
    -H "Content-Type: application/json" \
    -d "{\"user_id\":$USER_ID,\"original_url\":\"https://google.com\"}")

check "POST /urls bad type returns 422" "422" \
  $(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/urls \
    -H "Content-Type: application/json" \
    -d '{"user_id":"notanint","original_url":"https://google.com"}')

check "POST /urls invalid URL returns 422" "422" \
  $(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/urls \
    -H "Content-Type: application/json" \
    -d "{\"user_id\":$USER_ID,\"original_url\":\"not-a-url\"}")

URL_RESPONSE=$(curl -s -X POST $BASE/urls \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":$USER_ID,\"original_url\":\"https://example.com\"}")

SHORT=$(echo $URL_RESPONSE | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d.get('short_code') or d.get('data',{}).get('short_code',''))" 2>/dev/null)

URL_ID=$(echo $URL_RESPONSE | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d.get('id') or d.get('data',{}).get('id',''))" 2>/dev/null)

check "short_code present in POST /urls response" "true" \
  $([ -n "$SHORT" ] && echo "true" || echo "false")

check "GET /:short_code returns 302" "302" \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/$SHORT)

check "GET /urls/:id returns 200" "200" \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/urls/$URL_ID)

# ── DEACTIVATION ───────────────────────────
echo ""
echo "── DEACTIVATION ──"

DEACT_RESPONSE=$(curl -s -X POST $BASE/urls \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":$USER_ID,\"original_url\":\"https://deactivate.com\"}")
DEACT_SHORT=$(echo $DEACT_RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('short_code',''))" 2>/dev/null)
DEACT_ID=$(echo $DEACT_RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)

curl -s -o /dev/null -X PUT $BASE/urls/$DEACT_ID \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'

DEACT_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/$DEACT_SHORT)
check "GET deactivated short_code returns 404/410" "true" \
  $([ "$DEACT_CODE" == "404" ] || [ "$DEACT_CODE" == "410" ] && echo "true" || echo "false")

# ── EVENTS ─────────────────────────────────
echo ""
echo "── EVENTS ──"

EVENTS=$(curl -s $BASE/events)
EVENT_COUNT=$(echo $EVENTS | python3 -c "
import sys,json
d=json.load(sys.stdin)
items = d if isinstance(d,list) else d.get('data',d.get('events',[]))
print(len(items))" 2>/dev/null)

check "GET /events has entries" "true" \
  $([ "$EVENT_COUNT" -gt 0 ] 2>/dev/null && echo "true" || echo "false")

EVENT_TYPES=$(echo $EVENTS | python3 -c "
import sys,json
d=json.load(sys.stdin)
items = d if isinstance(d,list) else d.get('data',d.get('events',[]))
types = set(i.get('event_type','') for i in items)
print(','.join(sorted(types)))" 2>/dev/null)

# Seed events use "created", app events use "url_created" — both must exist
check "Seed event type 'created' exists" "true" \
  $(echo $EVENT_TYPES | grep -q "created" && echo "true" || echo "false")

check "App event type 'url_created' exists" "true" \
  $(echo $EVENT_TYPES | grep -q "url_created" && echo "true" || echo "false")

check "App event type 'url_visited' exists" "true" \
  $(echo $EVENT_TYPES | grep -q "url_visited" && echo "true" || echo "false")

check "App event type 'url_deactivated' exists" "true" \
  $(echo $EVENT_TYPES | grep -q "url_deactivated" && echo "true" || echo "false")

check "App event type 'user_created' exists" "true" \
  $(echo $EVENT_TYPES | grep -q "user_created" && echo "true" || echo "false")

check "GET /events?user_id= filter works" "200" \
  $(curl -s -o /dev/null -w "%{http_code}" "$BASE/events?user_id=$USER_ID")

check "GET /events?url_id= filter works" "200" \
  $(curl -s -o /dev/null -w "%{http_code}" "$BASE/events?url_id=$URL_ID")

# ── REDIS CHAOS ────────────────────────────
echo ""
echo "── REDIS CHAOS TEST ──"
echo "Stopping Redis..."
docker stop $(docker ps --filter "name=redis" -q) 2>/dev/null
sleep 3

check "Seed URL redirect works WITHOUT Redis" "302" \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/HudIG9)

check "New URL redirect works WITHOUT Redis" "302" \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/$SHORT)

echo "Restarting Redis..."
docker start $(docker ps -a --filter "name=redis" -q) 2>/dev/null
sleep 3

check "Redirect works AFTER Redis restart" "302" \
  $(curl -s -o /dev/null -w "%{http_code}" $BASE/$SHORT)

# ── SUMMARY ────────────────────────────────
echo ""
echo "======================================"
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "======================================"
if [ $FAIL -eq 0 ]; then
  echo "  🟢 ALL CHECKS PASSED — safe to submit"
else
  echo "  🔴 $FAIL check(s) failed — fix before submitting"
  echo ""
  echo "  Most likely causes:"
  echo "  - Seed data not loaded → check docker-compose volumes"
  echo "  - ID not preserved in bulk import → fix seed.py INSERT with explicit id"
  echo "  - Wrong event_type strings → check both seed loader and routers"
fi
echo ""