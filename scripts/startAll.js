// scripts/startAll.js
const { spawn } = require("child_process");
const path = require("path");

// Helper function to spawn a process with logging
function runProcess(name, command, args, options = {}) {
  console.log(`🚀 Starting ${name}: ${command} ${args.join(" ")}`);

  const proc = spawn(command, args, {
    stdio: "inherit",
    shell: true, // required for Windows
    ...options,
  });

  proc.on("close", (code) => {
    console.log(`${name} exited with code ${code}`);
    if (code !== 0) process.exit(code); // exit if any process fails
  });

  proc.on("error", (err) => {
    console.error(`Failed to start ${name}:`, err);
    process.exit(1);
  });

  return proc;
}

// Determine ports from environment variables or defaults
const frontendPort = process.env.PORT || 3000;
const backendPort = process.env.API_PORT || 2010;

// Paths
const frontendDir = path.join(__dirname, ".."); // Next.js frontend root
const backendScript = path.join(__dirname, "startBackend.js"); // backend launcher

// Start backend
const backendProc = runProcess("Backend", "node", [backendScript], {
  env: { ...process.env, API_PORT: backendPort },
});

// Start frontend (Next.js dev server)
const frontendProc = runProcess(
  "Frontend",
  "npx",
  ["next", "dev", "-p", frontendPort],
  { cwd: frontendDir }
);

// Cleanup on exit (CTRL+C or termination signals)
function cleanup() {
  console.log("🛑 Shutting down frontend and backend...");
  backendProc.kill();
  frontendProc.kill();
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
