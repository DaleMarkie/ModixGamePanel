// scripts/startBackend.js
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

function fileExists(p) {
  try {
    return fs.existsSync(p);
  } catch (e) {
    return false;
  }
}

// Try Node-style backend entrypoints
const nodeEntrypoints = [
  path.join(__dirname, "..", "backend", "startBackend.js"),
  path.join(__dirname, "..", "backend", "index.js"),
  path.join(__dirname, "..", "backend", "server.js"),
];

// Try Python-style backend entrypoints
const pyEntrypoints = [
  path.join(__dirname, "..", "backend", "api_main.py"),
  path.join(__dirname, "..", "backend", "main.py"),
];

let started = false;
for (const p of nodeEntrypoints) {
  if (fileExists(p)) {
    const proc = spawn("node", [p], { stdio: "inherit", shell: true });
    proc.on("close", (code) => process.exit(code));
    proc.on("error", (err) => {
      console.error("Node backend spawn error:", err);
      process.exit(1);
    });
    started = true;
    break;
  }
}

if (!started) {
  for (const p of pyEntrypoints) {
    if (fileExists(p)) {
      // prefer python3 if available
      const pyCmd = process.platform === "win32" ? "py" : "python3";
      const proc = spawn(pyCmd, [p], { stdio: "inherit", shell: true });
      proc.on("close", (code) => process.exit(code));
      proc.on("error", (err) => {
        console.error("Python backend spawn error:", err);
        process.exit(1);
      });
      started = true;
      break;
    }
  }
}

if (!started) {
  console.error(
    "No backend entrypoint found. Checked:\n",
    nodeEntrypoints.concat(pyEntrypoints).join("\n")
  );
  process.exit(1);
}
