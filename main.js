const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;

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

  if (isDev) {
    // In dev: load Next.js server
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // In prod: load Next.js build
    mainWindow.loadFile(path.join(__dirname, "frontend", "out", "index.html"));
    // or path.join(__dirname, "build", "index.html") if using CRA
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
