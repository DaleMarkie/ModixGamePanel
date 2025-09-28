const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const waitOn = require("wait-on");
const { spawn } = require("child_process");

let mainWindow;
let frontendProcess;

function startFrontend() {
  if (!isDev) return;

  // Start Next.js dev server automatically
  frontendProcess = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "dev", "-p", "3000"],
    { stdio: "inherit", shell: true }
  );

  frontendProcess.on("exit", (code) => {
    console.log(`Next.js frontend exited with code ${code}`);
  });
}

async function createWindow() {
  if (isDev) {
    // Wait for Next.js to be ready
    try {
      await waitOn({ resources: ["http://localhost:3000"], timeout: 30000 });
      console.log("✅ Next.js ready on port 3000");
    } catch (err) {
      console.error("❌ Next.js did not start in time", err);
      return;
    }
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const url = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "frontend", "out", "index.html")}`;

  mainWindow.loadURL(url);

  if (isDev) mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (frontendProcess) frontendProcess.kill();
    app.quit();
  });
}

// App ready
app.whenReady().then(() => {
  startFrontend(); // Start React dev server
  createWindow(); // Open Electron window
});

// Quit app
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
