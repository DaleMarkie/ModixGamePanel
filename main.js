const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const isDev = require("electron-is-dev");
const fetch = require("node-fetch"); // npm install node-fetch@2
const localVersion = require("./version.json").version;

let mainWindow;
let backendProcess;

function startBackend() {
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
    return "http://localhost:3000";
  } else {
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

async function checkVersion() {
  try {
    const SERVER_URL = "https://cd5b5aa367d6.ngrok-free.app";
    const res = await fetch(`${SERVER_URL}/api/version`);
    const data = await res.json();

    if (data.success && data.version !== localVersion) {
      dialog.showMessageBoxSync({
        type: "warning",
        title: "Update Required",
        message: `Your Modix Panel is outdated.\nCurrent: ${localVersion}\nRequired: ${data.version}\nPlease update to continue.`,
      });
    } else {
      console.log("Modix Panel is up-to-date.");
    }
  } catch (err) {
    console.warn("Version check failed:", err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
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

// App initialization
app.whenReady().then(async () => {
  startBackend();
  await checkVersion(); // check before loading frontend
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
