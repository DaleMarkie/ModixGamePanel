const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn, exec } = require("child_process");

let backendProcess = null;

function startBackend() {
  const backendScript = path.join(__dirname, "backend", "api_main.py");
  console.log("Starting backend:", backendScript);

  backendProcess = spawn("python", ["-m", "backend.api_main"], {
    stdio: "inherit",
    cwd: __dirname,
    shell: true,
  });

  backendProcess.on("close", (code) => console.log("Backend exited with code", code));
  backendProcess.on("error", (err) => console.error("Backend failed:", err));
}

function stopBackend() {
  if (!backendProcess) return;
  if (process.platform === "win32") {
    exec(`taskkill /PID ${backendProcess.pid} /T /F`);
  } else {
    backendProcess.kill("SIGTERM");
  }
  backendProcess = null;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false, // ❌ disable
      contextIsolation: true, // ✅ enable
    },
  });

  mainWindow.loadURL("http://localhost:3000");

  // DevTools optional
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("before-quit", () => stopBackend());

app.on("window-all-closed", () => {
  stopBackend();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
