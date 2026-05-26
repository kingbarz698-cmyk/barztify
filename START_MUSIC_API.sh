#!/bin/bash
echo "===================================="
echo "  Barztify Music API - Starting..."
echo "===================================="
cd "$(dirname "$0")/music_api"
pip install -r requirements.txt -q
python -m uvicorn main:app --host 0.0.0.0 --port 7979 --reload
