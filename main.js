const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

// Start your dev server automatically
const devServer = spawn("npm", ["run", "dev"], {
  shell: true,
  cwd: path.resolve(__dirname),
  stdio: "inherit",
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadURL("http://localhost:3000"); // Dev server

  win.on("closed", () => {
    devServer.kill(); // Stop dev server when Electron closes
    app.quit();
  });
}

app.whenReady().then(() => {
  // Give dev server 5 seconds to start
  setTimeout(createWindow, 5000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
