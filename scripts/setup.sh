#!/bin/bash

set -e  # stop immediately if anything fails

echo "🧩 Modix Game Panel Setup Starting..."

# ---------------------------
# FRONTEND
# ---------------------------
echo "📦 Installing frontend dependencies..."
npm install

# ---------------------------
# PYTHON VENV
# ---------------------------
echo "🐍 Setting up Python environment..."

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

# always use venv python explicitly (avoids activation bugs on ChromeOS)
VENV_PY="venv/bin/python"
VENV_PIP="venv/bin/pip"

# upgrade tooling safely
echo "⬆️ Upgrading pip tools..."
$VENV_PIP install --upgrade pip setuptools wheel

# ---------------------------
# BACKEND DEPENDENCIES
# ---------------------------
echo "📦 Installing backend dependencies..."

if [ -f "requirements.txt" ]; then
  $VENV_PIP install -r requirements.txt
else
  echo "❌ requirements.txt missing!"
  exit 1
fi

# ---------------------------
# VERIFY CORE IMPORTS
# ---------------------------
echo "🧪 Verifying backend environment..."

$VENV_PY -c "import fastapi, pydantic, psutil; print('✅ Core backend imports OK')"

# ---------------------------
# DONE
# ---------------------------
echo "🚀 Setup complete!"
echo "👉 Run: npm run dev"