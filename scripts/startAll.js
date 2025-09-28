const { spawn } = require("child_process");

function startBackend() {
  const backendProcess = spawn("node", ["scripts/startBackend.js"], {
    stdio: "inherit",
    shell: true,
  });

  backendProcess.on("close", (code) =>
    console.log(`Backend exited with code ${code}`)
  );
  backendProcess.on("error", (err) => console.error("Backend failed:", err));
}

function startFrontend() {
  const frontendProcess = spawn("npx", ["next", "start", "-p", "3000"], {
    stdio: "inherit",
    shell: true,
  });

  frontendProcess.on("close", (code) =>
    console.log(`Frontend exited with code ${code}`)
  );
  frontendProcess.on("error", (err) => console.error("Frontend failed:", err));
}

startBackend();
startFrontend();
console.log(
  "Frontend + Backend running. Open http://localhost:3000 in browser."
);
