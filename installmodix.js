#!/usr/bin/env node
/**
 * Modix Panel Ultimate Installer - Windows & Linux
 */

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const os = require("os");

const LOGFILE = path.join(process.cwd(), "modix_install.log");
fs.writeFileSync(LOGFILE, ""); // clear logfile

function log(msg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOGFILE, `[${timestamp}] ${msg}\n`);
  console.log(msg);
}

function separator() {
  log("===========================================");
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

function run(cmd, options = {}) {
  try {
    return execSync(cmd, { stdio: "pipe", ...options })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

// ==========================================
// License Step
// ==========================================
async function licenseStep() {
  separator();
  log("MODIX PANEL - LICENSE AGREEMENT");
  separator();
  log("Modix Game Panel Non-Commercial License (NC) – Version 1.3");
  log("(c) 2025 Ov3rlord & The Modix Dev Team");
  log("1. Personal/educational/evaluation use only.");
  log("2. Commercial use requires permission.");
  log("3. Violations terminate license.\n");

  const accept = await prompt("Do you agree? (Y/N): ");
  if (accept.toUpperCase() !== "Y") {
    log("[X] License declined");
    process.exit(1);
  }
  log("[✓] License accepted\n");
}

// ==========================================
// Python Check / Install
// ==========================================
function checkPython() {
  separator();
  log("STEP 1: Checking Python >=3.10...");

  let pyVersion = run("python --version") || run("python3 --version");

  if (!pyVersion) {
    if (os.platform() === "win32") {
      log("[!] Python not found. Downloading Python 3.11...");
      const pyInstaller = path.join(process.cwd(), "python_installer.exe");
      run(
        `powershell -Command "Invoke-WebRequest -Uri https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe -OutFile ${pyInstaller}"`
      );
      run(
        `${pyInstaller} /quiet InstallAllUsers=1 PrependPath=1 Include_test=0`
      );
      fs.unlinkSync(pyInstaller);
      pyVersion = run("python --version");
      if (!pyVersion) {
        log("[X] Python install failed.");
        process.exit(1);
      }
      log(`[✓] Python installed: ${pyVersion}`);
    } else {
      log(
        "[X] Python not found. Please install Python 3.10+ via your package manager (apt, dnf, yum, pacman)."
      );
      process.exit(1);
    }
  } else {
    log(`[✓] Python detected: ${pyVersion}`);
    const match = pyVersion.match(/Python (\d+)\.(\d+)/);
    const major = parseInt(match[1]),
      minor = parseInt(match[2]);
    if (major < 3 || (major === 3 && minor < 10)) {
      log("[X] Python too old. Install 3.10+");
      process.exit(1);
    }
  }
}

// ==========================================
// Pip Check / Install
// ==========================================
function checkPip() {
  separator();
  log("STEP 2: Checking pip...");
  if (!run("pip --version") && !run("pip3 --version")) {
    log("[!] pip not found. Installing pip...");
    run("curl -s https://bootstrap.pypa.io/get-pip.py -o get-pip.py");
    run("python get-pip.py || python3 get-pip.py");
    fs.unlinkSync("get-pip.py");
    log("[✓] pip installed");
  } else {
    log("[✓] pip detected");
  }
}

// ==========================================
// Backend Virtual Environment
// ==========================================
function setupBackendVenv() {
  separator();
  log("STEP 3: Setting up backend virtual environment...");
  const venvPath = path.join("backend", "venv");
  if (!fs.existsSync(venvPath)) {
    run(`python -m venv "${venvPath}" || python3 -m venv "${venvPath}"`);
    log("[✓] Virtual environment created");
  } else {
    log("[✓] Virtual environment exists");
  }

  const pipExec = path.join(
    venvPath,
    os.platform() === "win32" ? "Scripts" : "bin",
    "pip"
  );
  log("[*] Upgrading pip, setuptools, wheel...");
  run(`${pipExec} install --upgrade pip setuptools wheel`);
}

// ==========================================
// Backend Dependencies
// ==========================================
function installBackendDeps() {
  separator();
  log("STEP 4: Installing backend dependencies...");
  const requirementsPath = path.join("backend", "requirements.txt");
  fs.writeFileSync(
    requirementsPath,
    `
fastapi
uvicorn[standard]
sqlalchemy
passlib[bcrypt]
python-jose[cryptography]
pydantic>=2.0.0
python-multipart
docker
jsonschema
pyyaml
`.trim()
  );

  const pipExec = path.join(
    "backend",
    "venv",
    os.platform() === "win32" ? "Scripts" : "bin",
    "pip"
  );
  try {
    run(`${pipExec} install -r "${requirementsPath}"`);
    log("[✓] Backend dependencies installed");
  } catch {
    log("[X] Backend dependencies failed");
    process.exit(1);
  }
}

// ==========================================
// Node.js Check / Install
// ==========================================
function checkNode() {
  separator();
  log("STEP 5: Checking Node.js >=18...");
  const nodeVersion = run("node -v");
  if (!nodeVersion) {
    if (os.platform() === "win32") {
      log("[!] Node.js not found. Downloading Node.js v20...");
      const nodeInstaller = path.join(process.cwd(), "node_installer.msi");
      run(
        `powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v20.9.0/node-v20.9.0-x64.msi -OutFile ${nodeInstaller}"`
      );
      run(`msiexec /i ${nodeInstaller} /quiet /qn /norestart`);
      fs.unlinkSync(nodeInstaller);
      log(`[✓] Node.js installed: ${run("node -v")}`);
    } else {
      log("[X] Node.js not found. Please install Node.js >=18 manually.");
      process.exit(1);
    }
  } else {
    log(`[✓] Node.js detected: ${nodeVersion}`);
  }
}

// ==========================================
// Frontend Dependencies
// ==========================================
function installFrontendDeps() {
  separator();
  log("STEP 6: Installing frontend dependencies...");
  const frontendPath = path.join(process.cwd(), "frontend");
  if (!fs.existsSync(path.join(frontendPath, "package.json"))) {
    log("[X] frontend/package.json not found");
    return;
  }
  try {
    run(`cd frontend && npm install --force`);
    log("[✓] Frontend dependencies installed");
  } catch {
    log("[X] Frontend dependencies failed");
  }
}

// ==========================================
// Main Installer
// ==========================================
async function main() {
  log("Starting Modix Panel Installer...");
  await licenseStep();
  checkPython();
  checkPip();
  setupBackendVenv();
  installBackendDeps();
  checkNode();
  installFrontendDeps();
  separator();
  log("✅ Installation complete!");
  log(`Log file: ${LOGFILE}`);
  log(
    "You can start the backend via: backend\\venv\\Scripts\\activate (Windows) or backend/venv/bin/activate (Linux)"
  );
}

main();
