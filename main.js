const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const isDev = require("electron-is-dev");

let mainWindow;
let backendProcess;

function startBackend() {
  // Cross-platform Node backend start
  const backendScript = path.join(__dirname, "scripts", "startBackend.js");

  backendProcess = spawn(process.execPath, [backendScript], {
    cwd: __dirname,
    shell: true,
    stdio: "inherit",
  });

  backendProcess.on("close", (code) => {
    console.log(`Backend exited with code ${code}`);
  });
}

function getFrontendURL() {
  if (isDev) {
    // Dev server
    return "http://localhost:3000";
  } else {
    // Production build
    // Next.js .next server pages path
    // Works on all OSes
    return `file://${path.join(
      __dirname,
      "frontend",
      ".next",
      "server",
      "pages",
      "index.html"
    )}`;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // optional
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(getFrontendURL());

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (backendProcess) backendProcess.kill();
    app.quit();
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
