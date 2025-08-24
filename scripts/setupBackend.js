const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

let pythonCmd = "python3"; // default
const backendFile = path.join(__dirname, "../backend/api_main.py");

// Use Python from .backendrc if it exists
const backendRc = path.join(__dirname, "../.backendrc");
if (fs.existsSync(backendRc)) {
  pythonCmd = fs.readFileSync(backendRc, "utf8").trim();
}

console.log(`🚀 Starting backend using: ${pythonCmd}`);

const backendProcess = spawn(pythonCmd, [backendFile], {
  stdio: "inherit",
  env: { ...process.env, PYTHONPATH: path.join(__dirname, "../backend") },
  shell: true,
});

backendProcess.on("close", (code) => {
  console.log(`Backend exited with code ${code}`);
});
