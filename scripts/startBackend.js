const { spawnSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendDir = path.join(__dirname, "../backend");
const venvDir = path.join(backendDir, "venv");
const backendFile = path.join(backendDir, "api_main.py");
const backendPort = process.env.API_PORT || 2010;

// Detect Python executable
let pythonPath;
const backendRc = path.join(__dirname, "../.backendrc");

// 1️⃣ Check for .backendrc override
if (fs.existsSync(backendRc)) {
  pythonPath = fs.readFileSync(backendRc, "utf8").trim();
}
// 2️⃣ Check virtual environment
else if (fs.existsSync(venvDir)) {
  pythonPath =
    process.platform === "win32"
      ? path.join(venvDir, "Scripts", "python.exe")
      : path.join(venvDir, "bin", "python");

  if (!fs.existsSync(pythonPath)) {
    console.error(
      "❌ Python not found inside venv. Please recreate venv first."
    );
    process.exit(1);
  }
}
// 3️⃣ Use system Python and create venv
else {
  console.warn("⚠️ venv not found. Creating a new virtual environment...");
  pythonPath = process.platform === "win32" ? "py -3" : "python3";

  const result = spawnSync(pythonPath, ["-m", "venv", venvDir], {
    stdio: "inherit",
    shell: process.platform === "win32", // needed for Windows
  });

  if (result.status !== 0) process.exit(result.status);

  pythonPath =
    process.platform === "win32"
      ? path.join(venvDir, "Scripts", "python.exe")
      : path.join(venvDir, "bin", "python");
}

// Upgrade pip
spawnSync(pythonPath, ["-m", "pip", "install", "--upgrade", "pip"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

// Install requirements
const requirements = path.join(backendDir, "requirements.txt");
if (fs.existsSync(requirements)) {
  console.log("📦 Installing backend dependencies...");
  const install = spawnSync(
    pythonPath,
    ["-m", "pip", "install", "-r", requirements],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
    }
  );
  if (install.status !== 0) process.exit(install.status);
}

// Set environment
const env = { ...process.env, API_PORT: backendPort };

console.log(`🚀 Starting backend using: ${pythonPath} on port ${backendPort}`);
const backendProcess = spawn(pythonPath, [backendFile], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32", // needed for Windows
});

backendProcess.on("exit", (code) => {
  console.log(`Backend exited with code ${code}`);
});
