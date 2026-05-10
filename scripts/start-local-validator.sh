#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROGRAM_ID="${PERMIT402_PROGRAM_ID:-GiZNZ6kTa1R8Yypm7ub3zFpavCSpBxuxsHT5vHsM2L3S}"
PROGRAM_SO="${PERMIT402_PROGRAM_SO:-$REPO_ROOT/target/deploy/permit402.so}"
LEDGER_DIR="${PERMIT402_LEDGER_DIR:-/tmp/permit402-test-ledger}"
LOG_FILE="${PERMIT402_VALIDATOR_LOG:-/tmp/permit402-validator.log}"
PID_FILE="${PERMIT402_VALIDATOR_PID:-/tmp/permit402-validator.pid}"
RPC_URL="${PERMIT402_RPC_URL:-http://127.0.0.1:8899}"

if [ ! -f "$PROGRAM_SO" ]; then
  printf 'Missing program binary: %s\n' "$PROGRAM_SO" >&2
  printf 'Run: anchor build --no-idl -- --tools-version v1.52\n' >&2
  exit 1
fi

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  printf 'Permit402 validator already running pid=%s rpc=%s\n' "$(cat "$PID_FILE")" "$RPC_URL"
  exit 0
fi

rm -rf "$LEDGER_DIR"
NO_DNA=1 solana-test-validator \
  --reset \
  --quiet \
  --ledger "$LEDGER_DIR" \
  --bpf-program "$PROGRAM_ID" "$PROGRAM_SO" \
  >"$LOG_FILE" 2>&1 &

printf '%s\n' "$!" > "$PID_FILE"

for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  if NO_DNA=1 solana cluster-version --url "$RPC_URL" >/dev/null 2>&1; then
    printf 'Permit402 validator ready pid=%s rpc=%s program=%s\n' "$(cat "$PID_FILE")" "$RPC_URL" "$PROGRAM_ID"
    NO_DNA=1 solana program show "$PROGRAM_ID" --url "$RPC_URL"
    exit 0
  fi
  sleep 1
done

printf 'Permit402 validator did not become ready. Log tail:\n' >&2
tail -n 80 "$LOG_FILE" >&2
exit 1
