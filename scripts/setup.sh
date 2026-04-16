#!/bin/bash

echo "🔧 Installing frontend dependencies..."
npm install

echo "🐍 Setting up Python environment..."

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

echo "📦 Installing backend dependencies..."
venv/bin/pip install --upgrade pip
venv/bin/pip install -r requirements.txt

echo "✅ Setup complete!"