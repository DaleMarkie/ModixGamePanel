#!/usr/bin/env node
/**
 * 🚀 Modix Advanced Installer v4
 * Fully silent cross-platform installer with background launch
 */

const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const net = require("net");
const https = require("https");

// --- Load inquirer ---
let inquirer;
try {
  inquirer = require("inquirer");
} catch {
  console.log("📦 Installing missing dependency: inquirer");
  execSync("npm install inquirer", { stdio: "inherit", shell: true });
  inquirer = require("inquirer");
}

// ------------------- Helpers -------------------
function log(step, msg) {
  const icons = { info: "🔹", ok: "✅", warn: "⚠️", err: "❌", run: "⚡" };
  console.log(`${icons[step] || "•"} ${msg}`);
}

async function getFreePort(defaultPort) {
  let port = defaultPort;
  while (true) {
    const free = await new Promise((resolve) => {
      const tester = net
        .createServer()
        .once("error", () => resolve(false))
        .once("listening", () => {
          tester.once("close", () => resolve(true)).close();
        })
        .listen(port);
    });
    if (free) return port;
    port++;
  }
}

function checkCommand(cmd, versionArg = "--version") {
  try {
    return execSync(`${cmd} ${versionArg}`, {
      stdio: ["ignore", "pipe", "ignore"],
      shell: true,
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

function installNodePackages(packages) {
  log("run", `Installing Node packages: ${packages.join(", ")}`);
  execSync(`npm install ${packages.join(" ")}`, {
    stdio: "inherit",
    shell: true,
  });
}

async function installPythonWindows() {
  log("info", "Downloading Python installer...");
  const url =
    "https://www.python.org/ftp/python/3.12.2/python-3.12.2-amd64.exe";
  const dest = path.join(os.tmpdir(), "python_installer.exe");
  await downloadFile(url, dest);
  log("run", "Running Python installer silently...");
  spawn(dest, ["/quiet", "InstallAllUsers=1", "PrependPath=1"], {
    stdio: "inherit",
  });
}

async function installNodeWindows() {
  log("info", "Downloading Node.js installer...");
  const url = "https://nodejs.org/dist/v20.5.0/node-v20.5.0-x64.msi";
  const dest = path.join(os.tmpdir(), "node_installer.msi");
  await downloadFile(url, dest);
  log("run", "Running Node.js installer silently...");
  spawn("msiexec", ["/i", dest, "/quiet", "/norestart"], { stdio: "inherit" });
}

// ------------------- Dependency Checks -------------------
async function checkAndInstallDependencies() {
  let pythonCmd =
    checkCommand("python3") ||
    checkCommand("py -3") ||
    checkCommand("python") ||
    null;
  if (!pythonCmd && process.platform === "win32") {
    await installPythonWindows();
    pythonCmd =
      checkCommand("python3") ||
      checkCommand("py -3") ||
      checkCommand("python");
  }
  if (!pythonCmd) {
    log("err", "Python not found");
    process.exit(1);
  }
  log("ok", `Found Python: ${pythonCmd}`);

  if (!checkCommand("node") || !checkCommand("npm")) {
    if (process.platform === "win32") await installNodeWindows();
    if (!checkCommand("node") || !checkCommand("npm")) {
      log("err", "Node/npm not found");
      process.exit(1);
    }
  }
  log(
    "ok",
    `Node.js: ${checkCommand("node", "-v")}, npm: ${checkCommand("npm", "-v")}`
  );

  const required = ["inquirer", "cross-env"];
  const missing = required.filter((pkg) => {
    try {
      require.resolve(pkg);
      return false;
    } catch {
      return true;
    }
  });
  if (missing.length > 0) installNodePackages(missing);
}

// ------------------- Main Installer -------------------
(async () => {
  console.log("\n🚀 Modix Installer v4\n");

  await checkAndInstallDependencies();

  const backendDir = path.join(__dirname, "../backend");
  const venvDir = path.join(backendDir, "venv");
  const requirementsFile = path.join(backendDir, "requirements.txt");
  const nodeModulesDir = path.join(__dirname, "../node_modules");

  // --- Backend ---
  if (fs.existsSync(venvDir))
    fs.rmSync(venvDir, { recursive: true, force: true });
  log("run", "Creating Python virtual environment...");
  execSync(
    `${
      process.platform === "win32" ? "py -3" : "python3"
    } -m venv "${venvDir}"`,
    { stdio: "inherit", shell: true }
  );
  const pythonVenv =
    process.platform === "win32"
      ? path.join(venvDir, "Scripts", "python.exe")
      : path.join(venvDir, "bin", "python3");
  log("run", "Installing backend dependencies...");
  execSync(`"${pythonVenv}" -m pip install --upgrade pip`, {
    stdio: "inherit",
    shell: true,
  });
  execSync(`"${pythonVenv}" -m pip install -r "${requirementsFile}"`, {
    stdio: "inherit",
    shell: true,
  });
  log("ok", "Backend ready");

  // --- Frontend ---
  if (!fs.existsSync(nodeModulesDir)) {
    log("run", "Installing frontend dependencies...");
    execSync("npm ci", { stdio: "inherit", shell: true });
    log("ok", "Frontend ready");
  }

  // --- Ports & .env ---
  const frontendPort = await getFreePort(3000);
  const backendPort = await getFreePort(2010);
  fs.writeFileSync(
    path.join(__dirname, "../.env"),
    `PORT=${frontendPort}\nAPI_PORT=${backendPort}\n`
  );
  log("ok", `Frontend: ${frontendPort}, Backend: ${backendPort}`);

  // --- Launch in background ---
  log("run", "Launching Modix in background...");
  if (process.platform === "win32") {
    spawn(
      "cmd.exe",
      [
        "/c",
        `start npx cross-env PORT=${frontendPort} API_PORT=${backendPort} npm run dev`,
      ],
      { detached: true }
    );
  } else {
    spawn(
      "sh",
      [
        "-c",
        `npx cross-env PORT=${frontendPort} API_PORT=${backendPort} npm run dev &`,
      ],
      { detached: true }
    );
  }

  // --- Desktop Shortcut (Windows) ---
  if (process.platform === "win32") {
    const shortcut = path.join(os.homedir(), "Desktop", "Modix.lnk");
    const script = path.join(__dirname, "launch_modix.bat");
    fs.writeFileSync(
      script,
      `@echo off\nnpx cross-env PORT=${frontendPort} API_PORT=${backendPort} npm run dev\n`
    );
    execSync(
      `powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('${shortcut}');$s.TargetPath='${script}';$s.Save()"`
    );
    log("ok", "Desktop shortcut created");
  }

  log("ok", "Installation complete. Modix is running!");
})();
