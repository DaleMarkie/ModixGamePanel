#!/bin/bash
echo "🚀 Starting Modix v1.1.2..."
"/project/workspace/backend/venv/bin/python3" -m uvicorn backend.main:app --host 127.0.0.1 --port 2011 &
npx cross-env PORT=3000 API_PORT=2011 npm run dev
