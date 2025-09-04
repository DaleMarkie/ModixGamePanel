const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const backendDir = path.join(__dirname, "../backend");
const venvDir = path.join(backendDir, "venv");
const backendFile = path.join(backendDir, "api_main.py");

const backendPort = process.env.API_PORT || 2010;

// Detect Python executable
let pythonPath;

if (fs.existsSync(venvDir)) {
  pythonPath =
    process.platform === "win32"
      ? path.join(venvDir, "Scripts", "python.exe")
      : path.join(venvDir, "bin", "python3");

  if (!fs.existsSync(pythonPath)) {
    console.error(
      "❌ Python not found inside venv. Please recreate venv first."
    );
    process.exit(1);
  }
} else {
  console.warn("⚠️  venv not found. Using system Python instead.");
  pythonPath = process.platform === "win32" ? "py -3" : "python3";
}

// Set environment
const env = { ...process.env, PYTHONPATH: backendDir, API_PORT: backendPort };

console.log(`🚀 Starting backend using: ${pythonPath} on port ${backendPort}`);

// Spawn backend process
const backendProcess = spawn(pythonPath, [backendFile], {
  stdio: "inherit",
  env,
  shell: true,
});

backendProcess.on("exit", (code) =>
  console.log(`Backend exited with code ${code}`)
);
