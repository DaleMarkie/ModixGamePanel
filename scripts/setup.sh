#!/bin/bash

set -euo pipefail

# ---------------------------
# COLOURS
# ---------------------------
GREEN="\033[1;32m"
CYAN="\033[1;36m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
RESET="\033[0m"
BOLD="\033[1m"

print_section() {
  echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${BOLD}$1${RESET}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

print_step() {
  echo -e "${YELLOW}➤ $1...${RESET}"
}

print_success() {
  echo -e "${GREEN}✔ $1${RESET}"
}

print_error() {
  echo -e "${RED}✖ $1${RESET}"
}

# ---------------------------
# START
# ---------------------------
echo -e "\n${BOLD}🧩 Modix Game Panel Setup${RESET}"
echo -e "${CYAN}Linux-safe installer starting...${RESET}"

cd "$(dirname "$0")/.."

# ---------------------------
# FRONTEND
# ---------------------------
print_section "📦 Frontend Setup"

print_step "Installing frontend dependencies"
npm install >/dev/null 2>&1
print_success "Frontend dependencies installed"

# ---------------------------
# PYTHON VENV
# ---------------------------
print_section "🐍 Python Environment"

print_step "Checking virtual environment"

if [ ! -d "venv" ] || [ ! -f "venv/bin/python" ]; then
  print_step "Rebuilding virtual environment"
  rm -rf venv
  python3 -m venv venv
fi

PY="venv/bin/python"

print_step "Bootstrapping pip"
$PY -m ensurepip --upgrade >/dev/null 2>&1 || true
$PY -m pip install --upgrade pip setuptools wheel >/dev/null 2>&1
print_success "Python environment ready"

# ---------------------------
# BACKEND
# ---------------------------
print_section "⚙️ Backend Setup"

print_step "Installing backend dependencies"

if [ -f "requirements.txt" ]; then
  $PY -m pip install -r requirements.txt >/dev/null 2>&1
else
  print_error "requirements.txt missing"
  exit 1
fi

print_success "Backend dependencies installed"

# ---------------------------
# GUARANTEED PACKAGES
# ---------------------------
print_section "🛡️ Runtime Packages"

print_step "Ensuring required packages"

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
  tzlocal >/dev/null 2>&1

print_success "All runtime packages installed"

# ---------------------------
# HEALTH CHECK
# ---------------------------
print_section "🧪 Health Check"

print_step "Running backend import test"

$PY - << 'EOF'
import fastapi, pydantic, psutil, jwt, apscheduler, httpx, websockets
EOF

print_success "Backend + WebSocket support OK"

# ---------------------------
# FINAL
# ---------------------------
echo -e "\n${GREEN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "        🚀 SETUP COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${RESET}"

echo -e "${GREEN}✔ Frontend ready${RESET}"
echo -e "${GREEN}✔ Backend ready${RESET}"
echo -e "${GREEN}✔ WebSocket support working${RESET}"
echo -e "${GREEN}✔ All systems operational${RESET}"

echo ""
echo -e "${BOLD}👉 Start the dev server:${RESET}"
echo -e "   npm run dev"

echo ""
echo -e "${CYAN}💬 Discord:${RESET} https://discord.gg/C8VvaMvQzq"
echo -e "${YELLOW}🙏 Thank you for using Modix Game Panel${RESET}"
echo ""