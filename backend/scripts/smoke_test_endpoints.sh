#!/usr/bin/env bash
set -u

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"
START_SERVER=1
PORT="${PORT:-8000}"
SERVER_PID=""
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="/tmp/ownmerit-smoke"

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m"

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  echo -e "${GREEN}PASS${NC} - $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo -e "${RED}FAIL${NC} - $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

info() {
  echo -e "${YELLOW}INFO${NC} - $1"
}

json_get() {
  local payload="$1"
  local key="$2"
  python3 - "$payload" "$key" << "PY"
import json
import sys

payload = sys.argv[1]
key = sys.argv[2]
try:
    data = json.loads(payload)
except Exception:
    print("")
    raise SystemExit(0)

value = data.get(key, "")
if isinstance(value, (dict, list)):
    print(json.dumps(value))
else:
    print(value)
PY
}

usage() {
  cat <<EOF
Usage: $(basename "$0") [--no-start] [--base-url URL]

Options:
  --no-start         Do not start uvicorn. Assume server already running.
  --base-url URL     Override API base URL (default: $BASE_URL)
EOF
}

cleanup() {
  if [[ -n "$SERVER_PID" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-start)
      START_SERVER=0
      shift
      ;;
    --base-url)
      BASE_URL="${2:-}"
      if [[ -z "$BASE_URL" ]]; then
        echo "Missing value for --base-url"
        exit 2
      fi
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 2
      ;;
  esac
done

mkdir -p "$TMP_DIR"

if [[ "$START_SERVER" -eq 1 ]]; then
  info "Starting uvicorn on $BASE_URL"
  (
    cd "$ROOT_DIR" &&
    uvicorn app.main:app --host 127.0.0.1 --port "$PORT"
  ) >"$TMP_DIR/uvicorn.log" 2>&1 &
  SERVER_PID=$!

  for _ in $(seq 1 20); do
    code=$(curl -s -o "$TMP_DIR/health-wait.json" -w "%{http_code}" "$BASE_URL/health" || true)
    if [[ "$code" == "200" ]]; then
      break
    fi
    sleep 0.5
  done
fi

echo "== OwnMerit Endpoint Smoke Test =="
echo "Base URL: $BASE_URL"
echo

health_code=$(curl -s -o "$TMP_DIR/health.json" -w "%{http_code}" "$BASE_URL/health")
health_body="$(python3 -c "import pathlib;print(pathlib.Path('$TMP_DIR/health.json').read_text())")"
if [[ "$health_code" == "200" ]] && [[ "$(json_get "$health_body" "status")" == "ok" ]]; then
  pass "GET /health"
else
  fail "GET /health (code=$health_code)"
fi

echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" | base64 -d > "$TMP_DIR/test.png"

upload_code=$(curl -s -o "$TMP_DIR/upload.json" -w "%{http_code}" \
  -X POST "$BASE_URL/api/proofs/upload" \
  -F "image=@$TMP_DIR/test.png;type=image/png" \
  -F "task_context=Completed CV workshop" \
  -F "note=attended full session")
upload_body="$(python3 -c "import pathlib;print(pathlib.Path('$TMP_DIR/upload.json').read_text())")"
submission_id="$(json_get "$upload_body" "id")"
upload_suggestion="$(json_get "$upload_body" "ai_suggestion")"
if [[ "$upload_code" == "201" ]] && [[ -n "$submission_id" ]]; then
  pass "POST /api/proofs/upload (id=$submission_id suggestion=$upload_suggestion)"
else
  fail "POST /api/proofs/upload (code=$upload_code)"
fi

reviews_code=$(curl -s -o "$TMP_DIR/reviews.json" -w "%{http_code}" "$BASE_URL/api/admin/reviews")
if [[ "$reviews_code" == "200" ]]; then
  pass "GET /api/admin/reviews"
else
  fail "GET /api/admin/reviews (code=$reviews_code)"
fi

if [[ -n "$submission_id" ]]; then
  review_one_code=$(curl -s -o "$TMP_DIR/review_one.json" -w "%{http_code}" "$BASE_URL/api/admin/reviews/$submission_id")
  if [[ "$review_one_code" == "200" ]]; then
    pass "GET /api/admin/reviews/{submission_id}"
  else
    fail "GET /api/admin/reviews/{submission_id} (code=$review_one_code)"
  fi
fi

reminders_code=$(curl -s -o "$TMP_DIR/reminders.json" -w "%{http_code}" \
  -X POST "$BASE_URL/api/ai/reminders/generate" \
  -H "Content-Type: application/json" \
  -d '{"activity":"Attend mentoring session","user_context":"care leaver preparing CV","frequency":"weekly"}')
reminders_body="$(python3 -c "import pathlib;print(pathlib.Path('$TMP_DIR/reminders.json').read_text())")"
reminders_provider="$(json_get "$reminders_body" "provider")"
if [[ "$reminders_code" == "200" ]]; then
  pass "POST /api/ai/reminders/generate (provider=$reminders_provider)"
else
  fail "POST /api/ai/reminders/generate (code=$reminders_code)"
fi

recurrence_code=$(curl -s -o "$TMP_DIR/recurrence.json" -w "%{http_code}" \
  -X POST "$BASE_URL/api/ai/recurrence/parse" \
  -H "Content-Type: application/json" \
  -d '{"natural_language_rule":"every monday and thursday at 6pm"}')
recurrence_body="$(python3 -c "import pathlib;print(pathlib.Path('$TMP_DIR/recurrence.json').read_text())")"
recurrence_rrule="$(json_get "$recurrence_body" "rrule")"
if [[ "$recurrence_code" == "200" ]] && [[ -n "$recurrence_rrule" ]]; then
  pass "POST /api/ai/recurrence/parse (rrule=$recurrence_rrule)"
else
  fail "POST /api/ai/recurrence/parse (code=$recurrence_code)"
fi

echo
echo "== RESULT: $PASS_COUNT passed, $FAIL_COUNT failed =="
if [[ "$FAIL_COUNT" -eq 0 ]]; then
  exit 0
fi
exit 1
