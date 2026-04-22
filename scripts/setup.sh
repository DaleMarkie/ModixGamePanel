#!/bin/bash

set -euo pipefail

echo "🧩 Modix Game Panel Setup Starting (Linux-safe mode)..."

cd "$(dirname "$0")/.."

# ---------------------------
# FRONTEND
# ---------------------------
echo "📦 Installing frontend dependencies..."
npm install

# ---------------------------
# PYTHON VENV SAFETY LAYER
# ---------------------------
echo "🐍 Checking Python environment..."

if [ ! -d "venv" ] || [ ! -f "venv/bin/python" ]; then
  echo "🧹 Rebuilding virtual environment..."
  rm -rf venv
  python3 -m venv venv
fi

PY="venv/bin/python"

# ensure pip exists even on broken venvs
echo "🔧 Bootstrapping pip..."
$PY -m ensurepip --upgrade >/dev/null 2>&1 || true
$PY -m pip install --upgrade pip setuptools wheel

# ---------------------------
# BACKEND DEPENDENCIES
# ---------------------------
echo "📦 Installing backend dependencies..."

if [ -f "requirements.txt" ]; then
  $PY -m pip install -r requirements.txt
else
  echo "❌ requirements.txt missing"
  exit 1
fi

# ---------------------------
# HARD GUARANTEE PACKAGES
# ---------------------------
echo "🛡️ Installing guaranteed runtime packages..."

$PY -m pip install \
  fastapi \
  "uvicorn[standard]" \
  websockets \
  pydantic \
  psutil \
  passlib[bcrypt] \
  pyjwt \
  apscheduler \
  httpx \
  mcrcon \
  requests \
  sse-starlette \
  tzlocal

# ---------------------------
# BACKEND HEALTH CHECK
# ---------------------------
echo "🧪 Running backend import check..."

$PY - << 'EOF'
import fastapi
import pydantic
import psutil
import jwt
import apscheduler
import httpx
import websockets
print("✅ Backend + WebSocket support OK")
EOF

# ---------------------------
# FINAL STATUS
# ---------------------------
echo ""
echo "🚀 SETUP COMPLETE"
echo "✔ Frontend ready"
echo "✔ Backend environment ready"
echo "✔ WebSocket support fixed"
echo "✔ All required modules installed"
echo ""
echo "👉 Start dev server:"
echo "   npm run dev"