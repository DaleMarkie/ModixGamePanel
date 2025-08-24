const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendPath = path.join(__dirname, "../backend");
const pythonPathFile = path.join(__dirname, "../.backendrc");

if (!fs.existsSync(pythonPathFile)) {
  console.error(
    "❌ Backend Python path not found. Run `npm run setup-backend` first."
  );
  process.exit(1);
}

const python = fs.readFileSync(pythonPathFile, "utf8").trim();

const backendProcess = spawn(python, ["backend/api_main.py"], {
  stdio: "inherit",
  cwd: backendPath,
  shell: true,
});

backendProcess.on("close", (code) => {
  console.log(`Backend exited with code ${code}`);
});
