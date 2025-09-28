// scripts/startBackend.js
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Helper: check if a file exists
const fileExists = (p) => {
  try {
    return fs.existsSync(p);
  } catch (e) {
    return false;
  }
};

// Detect Node entrypoints
const nodeEntrypoints = [
  path.join(__dirname, "..", "backend", "startBackend.js"),
  path.join(__dirname, "..", "backend", "index.js"),
  path.join(__dirname, "..", "backend", "server.js"),
];

// Detect Python entrypoints
const pyEntrypoints = [
  path.join(__dirname, "..", "backend", "api_main.py"),
  path.join(__dirname, "..", "backend", "main.py"),
];

// Read custom Python command from .backendrc if it exists
let pyCmd = process.platform === "win32" ? "py" : "python3";
const backendRc = path.join(__dirname, "../.backendrc");
if (fileExists(backendRc)) {
  pyCmd = fs.readFileSync(backendRc, "utf8").trim();
}

// Function to spawn a process
function runProcess(command, args, entrypoint) {
  console.log(`🚀 Starting backend: ${command} ${args.join(" ")}`);
  const proc = spawn(command, args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, PYTHONPATH: path.join(__dirname, "../backend") },
  });

  proc.on("close", (code) => {
    console.log(`Backend exited with code ${code}`);
    process.exit(code);
  });

  proc.on("error", (err) => {
    console.error(`Failed to start backend (${entrypoint}):`, err);
    process.exit(1);
  });
}

// Try Node backends first
for (const entry of nodeEntrypoints) {
  if (fileExists(entry)) {
    runProcess("node", [entry], entry);
    return; // stop after first found
  }
}

// Try Python backends if no Node backend found
for (const entry of pyEntrypoints) {
  if (fileExists(entry)) {
    runProcess(pyCmd, [entry], entry);
    return; // stop after first found
  }
}

// If nothing found, exit with error
console.error(
  "❌ No backend entrypoint found. Checked:\n",
  nodeEntrypoints.concat(pyEntrypoints).join("\n")
);
process.exit(1);
