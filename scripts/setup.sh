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

TOTAL_STEPS=6
CURRENT_STEP=0

# ---------------------------
# OFFICIAL SOURCE
# ---------------------------
OFFICIAL_REPO="https://github.com/DaleMarkie/ModixGamePanel"

# ---------------------------
# UI
# ---------------------------
print_section() {
  echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${BOLD}$1${RESET}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

progress() {
  CURRENT_STEP=$((CURRENT_STEP + 1))
  PERCENT=$((CURRENT_STEP * 100 / TOTAL_STEPS))

  BAR_SIZE=30
  FILLED=$((PERCENT * BAR_SIZE / 100))
  EMPTY=$((BAR_SIZE - FILLED))

  printf "\n${CYAN}["
  printf "%0.s#" $(seq 1 $FILLED)
  printf "%0.s-" $(seq 1 $EMPTY)
  printf "] %d%%${RESET}\n" "$PERCENT"
}

run_step() {
  local msg="$1"
  shift

  echo -e "${YELLOW}➤ $msg...${RESET}"

  if "$@"; then
    echo -e "${GREEN}✔ $msg${RESET}"
    progress
  else
    echo -e "${RED}✖ Failed: $msg${RESET}"
    exit 1
  fi
}

# ---------------------------
# START
# ---------------------------
echo -e "\n${BOLD}🧩 Modix Game Panel Setup${RESET}"
echo -e "${CYAN}Linux-safe installer starting...${RESET}"

# ---------------------------
# OFFICIAL WARNING (START)
# ---------------------------
print_section "🔒 Official Modix Source"

echo -e "${YELLOW}Only download Modix from the official repository:${RESET}"
echo -e "${CYAN}${OFFICIAL_REPO}${RESET}"
echo ""
echo -e "${RED}⚠ Unofficial sources may contain outdated, broken, or unsafe code.${RESET}"
echo ""

cd "$(dirname "$0")/.."

# ---------------------------
# FRONTEND
# ---------------------------
print_section "📦 Frontend Setup"

run_step "Installing frontend dependencies" \
  bash -c "npm install >/dev/null 2>&1"

# ---------------------------
# PYTHON VENV
# ---------------------------
print_section "🐍 Python Environment"

run_step "Checking / rebuilding virtual environment" bash -c '
if [ ! -d "venv" ] || [ ! -f "venv/bin/python" ]; then
  rm -rf venv
  python3 -m venv venv
fi
'

PY="venv/bin/python"

run_step "Bootstrapping pip" \
  bash -c "$PY -m ensurepip --upgrade >/dev/null 2>&1 || true"

run_step "Upgrading pip + tools" \
  bash -c "$PY -m pip install --upgrade pip setuptools wheel >/dev/null 2>&1"

# ---------------------------
# BACKEND
# ---------------------------
print_section "⚙️ Backend Setup"

if [ ! -f "requirements.txt" ]; then
  echo -e "${RED}✖ requirements.txt missing${RESET}"
  exit 1
fi

run_step "Installing backend dependencies" \
  bash -c "$PY -m pip install -r requirements.txt >/dev/null 2>&1"

# ---------------------------
# GUARANTEED PACKAGES
# ---------------------------
print_section "🛡️ Runtime Packages"

run_step "Ensuring required packages" \
  bash -c "$PY -m pip install \
    fastapi \
    'uvicorn[standard]' \
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
    tzlocal >/dev/null 2>&1"

# ---------------------------
# HEALTH CHECK
# ---------------------------
print_section "🧪 Health Check"

run_step "Running backend import test" \
  bash -c "$PY - << 'EOF'
import fastapi, pydantic, psutil, jwt, apscheduler, httpx, websockets
EOF"

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

# ---------------------------
# OFFICIAL REMINDER (END)
# ---------------------------
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}🔒 Official Updates Only${RESET}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "Get updates only from:"
echo -e "${GREEN}${OFFICIAL_REPO}${RESET}"
echo -e "${RED}Avoid unofficial downloads to stay secure.${RESET}"

echo ""
echo -e "${BOLD}👉 Start the dev server:${RESET}"
echo -e "   npm run dev"

echo ""
echo -e "${CYAN}💬 Discord:${RESET} https://discord.gg/C8VvaMvQzq"
echo -e "${YELLOW}🙏 Thank you for using Modix Game Panel${RESET}"
echo ""