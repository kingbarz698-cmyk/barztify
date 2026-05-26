#!/bin/bash
# Barztify Music API startup script
# Usage:
#   Development:  bash start.sh
#   Production:   PROD=1 bash start.sh

cd "$(dirname "$0")"

PORT=${MUSIC_API_PORT:-7979}
HOST=${MUSIC_API_HOST:-0.0.0.0}
WORKERS=${MUSIC_API_WORKERS:-1}

if [ "${PROD:-0}" = "1" ]; then
  echo "Starting Barztify Music API [PRODUCTION] on $HOST:$PORT (workers=$WORKERS)"
  # Production: no --reload, multiple workers
  uvicorn main:app --host "$HOST" --port "$PORT" --workers "$WORKERS" --no-access-log
else
  echo "Starting Barztify Music API [DEVELOPMENT] on $HOST:$PORT"
  uvicorn main:app --host "$HOST" --port "$PORT" --reload
fi
