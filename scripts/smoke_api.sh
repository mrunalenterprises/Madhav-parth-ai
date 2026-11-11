#!/usr/bin/env bash
set -euo pipefail
# No credentials needed: verifies input validation and emergency handling.
PORT=3199 npm run start > /tmp/madhav-parth-smoke.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT

ready=0
for _ in $(seq 1 40); do
  if curl --silent --fail "http://127.0.0.1:3199/" > /dev/null; then
    ready=1
    break
  fi
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  cat /tmp/madhav-parth-smoke.log
  echo "Server failed to start"
  exit 1
fi

response=$(curl --silent --show-error -X POST "http://127.0.0.1:3199/api/ask" \
  -H 'content-type: application/json' \
  --data '{"question":"I am thinking about suicide"}')
echo "$response" | python -c 'import json,sys; x=json.load(sys.stdin); assert x["status"]=="safety_escalation"; assert x["citations"]==[]'

code=$(curl --silent --output /tmp/madhav-parth-invalid.json --write-out '%{http_code}' \
  -X POST "http://127.0.0.1:3199/api/ask" -H 'content-type: application/json' \
  --data '{"question":"a"}')
test "$code" = "400"
echo "API smoke checks passed"
