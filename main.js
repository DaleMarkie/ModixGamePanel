// main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const isDev = require("electron-is-dev");

let mainWindow;
let backendProcess;

function startBackend() {
  // Try Node backend (scripts/startBackend.js). If you use Python, adapt this to spawn python.
  const backendScript = path.join(__dirname, "scripts", "startBackend.js");

  backendProcess = spawn("node", [backendScript], {
    stdio: "inherit",
    shell: true,
  });

  backendProcess.on("close", (code) => {
    console.log(`Backend exited with code ${code}`);
  });

  backendProcess.on("error", (err) => {
    console.error("Failed to start backend:", err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    // DEV: use live dev server
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // PACKAGED: load an index.html fallback in frontend (you can generate a simple static index.html if needed)
    mainWindow.loadFile(path.join(__dirname, "frontend", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (e) {
      /* ignore */
    }
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
