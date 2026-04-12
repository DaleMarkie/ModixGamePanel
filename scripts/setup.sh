#!/bin/bash

set -e

echo "🚀 Modix setup starting..."

# go to project root
cd "$(dirname "$0")/.."

# create venv if missing
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate

echo "📦 Upgrading pip..."
pip install --upgrade pip

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "📦 Installing Node dependencies..."
npm install

echo "✅ Setup complete!"
echo "Run: npm run dev"