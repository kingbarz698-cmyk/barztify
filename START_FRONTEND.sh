#!/bin/bash
echo "===================================="
echo "  Barztify Frontend - Starting..."
echo "===================================="
cd "$(dirname "$0")"
npm install --silent
npm run dev
