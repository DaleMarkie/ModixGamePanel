const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const backendDir = path.join(__dirname, "../backend");
const backendFile = path.join(backendDir, "api_main.py");
const venvDir = path.join(backendDir, "venv");
const API_PORT = process.env.API_PORT || 2010;

let pythonPath;

if (fs.existsSync(venvDir)) {
  pythonPath =
    process.platform === "win32"
      ? path.join(venvDir, "Scripts", "python.exe")
      : path.join(venvDir, "bin", "python");
} else {
  pythonPath = process.platform === "win32" ? "py -3" : "python3";
}

const env = { ...process.env, API_PORT };
console.log(`🚀 Starting backend on port ${API_PORT}...`);

const backendProcess = spawn(pythonPath, [backendFile], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env,
});

backendProcess.on("exit", (code) => {
  console.log(`Backend exited with code ${code}`);
});
