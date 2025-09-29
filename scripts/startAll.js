const { spawn } = require("child_process");

const frontend = spawn("npm", ["run", "next"], {
  stdio: "inherit",
  shell: true,
});
const backend = spawn("node", ["scripts/startBackend.js"], {
  stdio: "inherit",
  shell: true,
});

frontend.on("exit", () => process.exit());
backend.on("exit", () => process.exit());
