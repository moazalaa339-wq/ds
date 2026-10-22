#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "========================================"
echo "  Hawa Engine - Local Server"
echo "========================================"
if command -v python3 >/dev/null 2>&1; then
  exec python3 http_server.py
elif command -v python >/dev/null 2>&1; then
  exec python http_server.py
else
  echo "ERROR: Python not found"
  exit 1
fi
