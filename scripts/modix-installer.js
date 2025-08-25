#!/usr/bin/env node

const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const net = require("net");
const os = require("os");
const https = require("https");
const { createWriteStream } = require("fs");

// ------------------- Utility Functions -------------------
async function getFreePort(defaultPort) {
  let port = defaultPort;
  let free = false;
  while (!free) {
    free = await new Promise((resolve) => {
      const tester = net
        .createServer()
        .once("error", () => resolve(false))
        .once("listening", function () {
          tester.once("close", () => resolve(true)).close();
        })
        .listen(port);
    });
    if (!free) port++;
  }
  return port;
}

function checkCommand(cmd, versionArg = "--version") {
  try {
    execSync(`${cmd} ${versionArg}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function installNodePackages(packages) {
  console.log(`📦 Installing missing Node packages: ${packages.join(", ")}`);
  execSync(`npm install ${packages.join(" ")}`, {
    stdio: "inherit",
    shell: true,
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

// ------------------- Auto-install Windows -------------------
async function installPythonWindows() {
  console.log("⬇️ Downloading Python installer...");
  const pythonUrl =
    "https://www.python.org/ftp/python/3.12.2/python-3.12.2-amd64.exe";
  const installerPath = path.join(os.tmpdir(), "python_installer.exe");
  await downloadFile(pythonUrl, installerPath);
  console.log("⚡ Running Python installer...");
  spawnSync(installerPath, ["/quiet", "InstallAllUsers=1", "PrependPath=1"], {
    stdio: "inherit",
  });
}

async function installNodeWindows() {
  console.log("⬇️ Downloading Node.js installer...");
  const nodeUrl = "https://nodejs.org/dist/v20.5.0/node-v20.5.0-x64.msi";
  const installerPath = path.join(os.tmpdir(), "node_installer.msi");
  await downloadFile(nodeUrl, installerPath);
  console.log("⚡ Running Node.js installer...");
  spawnSync("msiexec", ["/i", installerPath, "/quiet", "/norestart"], {
    stdio: "inherit",
  });
}

// ------------------- Dependency Checks -------------------
async function checkAndInstallDependencies() {
  // --- Python 3 ---
  let pythonCmd = null;
  if (checkCommand("python3")) pythonCmd = "python3";
  else if (checkCommand("py -3")) pythonCmd = "py -3";
  else if (checkCommand("python")) pythonCmd = "python";

  if (!pythonCmd) {
    if (process.platform === "win32") {
      const { installPy } = await inquirer.prompt([
        {
          type: "confirm",
          name: "installPy",
          message: "Python 3 missing. Install now?",
          default: true,
        },
      ]);
      if (installPy) await installPythonWindows();
      if (checkCommand("python3")) pythonCmd = "python3";
      else if (checkCommand("py -3")) pythonCmd = "py -3";
      else if (checkCommand("python")) pythonCmd = "python";
      if (!pythonCmd) {
        console.error("❌ Python installation failed.");
        process.exit(1);
      }
    } else {
      console.error(
        "❌ Python 3 is missing. Install with: sudo apt install python3 python3-venv python3-pip (Linux) or brew install python3 (macOS)"
      );
      process.exit(1);
    }
  }
  console.log(`✅ Found Python: ${pythonCmd}`);

  // --- Node.js & npm ---
  if (!checkCommand("node") || !checkCommand("npm")) {
    if (process.platform === "win32") {
      const { installNode } = await inquirer.prompt([
        {
          type: "confirm",
          name: "installNode",
          message: "Node.js missing. Install now?",
          default: true,
        },
      ]);
      if (installNode) await installNodeWindows();
      if (!checkCommand("node") || !checkCommand("npm")) {
        console.error("❌ Node installation failed.");
        process.exit(1);
      }
    } else {
      console.error(
        "❌ Node.js/npm missing. Install with: sudo apt install nodejs npm (Linux) or brew install node (macOS)"
      );
      process.exit(1);
    }
  }
  console.log(`✅ Found Node.js: ${execSync("node -v").toString().trim()}`);
  console.log(`✅ Found npm: ${execSync("npm -v").toString().trim()}`);

  // --- Node Packages ---
  const missingPackages = [];
  try {
    require.resolve("inquirer");
  } catch {
    missingPackages.push("inquirer");
  }
  try {
    require.resolve("cross-env");
  } catch {
    missingPackages.push("cross-env");
  }

  if (missingPackages.length > 0) {
    const { installPkgs } = await inquirer.prompt([
      {
        type: "confirm",
        name: "installPkgs",
        message: `Missing Node packages: ${missingPackages.join(
          ", "
        )}. Install now?`,
        default: true,
      },
    ]);
    if (installPkgs) installNodePackages(missingPackages);
    else {
      console.error("❌ Required Node packages missing. Exiting.");
      process.exit(1);
    }
  }
}

// ------------------- Main Installer -------------------
(async () => {
  console.log("🚀 Welcome to the Modix Installer");

  await checkAndInstallDependencies();

  const { userOS } = await inquirer.prompt([
    {
      type: "list",
      name: "userOS",
      message: "Select your operating system:",
      choices: ["Windows", "Linux/macOS"],
    },
  ]);
  console.log(`✅ Selected OS: ${userOS}`);

  const backendDir = path.join(__dirname, "../backend");
  const venvDir = path.join(backendDir, "venv");
  const requirementsFile = path.join(backendDir, "requirements.txt");
  const nodeModulesDir = path.join(__dirname, "../node_modules");

  const { confirmVenv } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmVenv",
      message: "Setup Python backend venv?",
      default: true,
    },
  ]);

  if (confirmVenv) {
    if (fs.existsSync(venvDir))
      fs.rmSync(venvDir, { recursive: true, force: true });
    console.log("🐍 Creating Python virtual environment...");
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
    console.log("🔹 Installing backend Python dependencies...");
    execSync(`"${pythonVenv}" -m pip install --upgrade pip`, {
      stdio: "inherit",
      shell: true,
    });
    execSync(`"${pythonVenv}" -m pip install -r "${requirementsFile}"`, {
      stdio: "inherit",
      shell: true,
    });
    console.log("✅ Backend dependencies installed.");
  }

  const { confirmNode } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmNode",
      message: "Install Node frontend dependencies?",
      default: true,
    },
  ]);
  if (confirmNode && !fs.existsSync(nodeModulesDir)) {
    console.log("📦 Installing Node frontend dependencies...");
    execSync("npm install", { stdio: "inherit", shell: true });
  }

  const frontendPort = await getFreePort(3000);
  const backendPort = await getFreePort(2010);
  console.log(`✅ Frontend: ${frontendPort}, Backend: ${backendPort}`);

  const { confirmLaunch } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmLaunch",
      message: "Launch Modix now?",
      default: true,
    },
  ]);
  if (confirmLaunch) {
    console.log("🚀 Launching frontend + backend...");
    execSync(
      `npx cross-env PORT=${frontendPort} API_PORT=${backendPort} npm run dev`,
      { stdio: "inherit", shell: true }
    );
  } else {
    console.log(
      `⚠️ Installation complete. Run \`npx cross-env PORT=${frontendPort} API_PORT=${backendPort} npm run dev\` to start later.`
    );
  }
})();
