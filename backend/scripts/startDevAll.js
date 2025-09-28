const { spawnSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const backendDir = path.join(__dirname, "backend");
const venvDir = path.join(backendDir, "venv");
const pythonPath = path.join(venvDir, "bin/python");

// Step 1: Create venv if missing
if (!fs.existsSync(venvDir)) {
  console.log("Creating Python venv...");
  spawnSync("python3", ["-m", "venv", venvDir], { stdio: "inherit" });
}

// Step 2: Install backend dependencies automatically
console.log("Installing Python backend dependencies...");
spawnSync(pythonPath, ["-m", "pip", "install", "--upgrade", "pip"], { stdio: "inherit" });
spawnSync(pythonPath, ["-m", "pip", "install", "-r", path.join(backendDir, "requirements.txt")], { stdio: "inherit" });

// Step 3: Helper to spawn a process
function runProcess(name, command, args) {
  const proc = spawn(command, args, { stdio: "inherit", shell: true });
  proc.on("exit", (code) => console.log(`${name} exited with code ${code}`));
  proc.on("error", (err) => console.error(`Failed to start ${name}:`, err.message));
  return proc;
}

// Step 4: Start frontend in dev mode (skipping build)
const frontend = runProcess("FRONTEND", "npx", ["next", "dev", "-p", "3000"]);

// Step 5: Start backend (FastAPI)
const backend = runProcess("BACKEND", pythonPath, [path.join(backendDir, "api_main.py")]);

// Step 6: Start Electron pointing to frontend
const electron = runProcess("ELECTRON", "electron", [".", "--no-sandbox"]);

// Step 7: Clean exit
const cleanup = () => {
  [frontend, backend, electron].forEach((p) => p.kill());
  process.exit();
};
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

console.log("All processes started. Frontend at http://localhost:3000");
