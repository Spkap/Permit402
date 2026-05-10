#!/usr/bin/env bash
set -euo pipefail

PID_FILE="${PERMIT402_VALIDATOR_PID:-/tmp/permit402-validator.pid}"

if [ ! -f "$PID_FILE" ]; then
  printf 'No Permit402 validator pid file found at %s\n' "$PID_FILE"
  exit 0
fi

PID="$(cat "$PID_FILE")"
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  printf 'Stopped Permit402 validator pid=%s\n' "$PID"
else
  printf 'Permit402 validator pid=%s is not running\n' "$PID"
fi

rm -f "$PID_FILE"
