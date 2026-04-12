#!/bin/bash

set -e

echo "🚀 Setting up Modix..."

echo "📦 Installing frontend..."
npm install

echo "🐍 Creating Python venv..."
python3 -m venv .venv

echo "📦 Activating venv..."
source .venv/bin/activate

echo "📦 Upgrading pip..."
pip install --upgrade pip

echo "📦 Installing backend deps..."
pip install -r requirements.txt

echo "✅ Done!"
echo "Run: npm run dev"
