// scripts/startAll.js
const { spawn } = require("child_process");
const path = require("path");

function startBackend() {
  const backendScript = path.join(__dirname, "startBackend.js"); // adjust if Python: 'api_main.py'

  const backendProcess = spawn(
    backendScript.endsWith(".js") ? "node" : "python",
    [backendScript],
    { stdio: "inherit", shell: true }
  );

  backendProcess.on("close", (code) => {
    console.log(`Backend exited with code ${code}`);
  });

  backendProcess.on("error", (err) => {
    console.error("Failed to start backend:", err);
  });
}

startBackend();
console.log("Backend started. Open your browser to http://localhost:3000");
