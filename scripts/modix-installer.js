#!/usr/bin/env node
/**
 * 🚀 Modix Advanced Installer v1.1.2
 * Supported OS: Windows & Linux only
 * Developed by OV3RLORD & the Modix Team
 * Website: https://modix.store
 * Discord: https://discord.gg/chYMJTGn
 */

const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const net = require("net");

(async () => {
  const inquirer = (await import("inquirer")).default;

  const VERSION = "v1.1.2";

  if (!["win32", "linux"].includes(process.platform)) {
    console.error("❌ Modix Installer only supports Windows and Linux.");
    process.exit(1);
  }

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

  function hashFile(file) {
    try {
      return fs.readFileSync(file, "utf8").trim();
    } catch {
      return null;
    }
  }

  console.clear();
  console.log("=================================================");
  console.log("         🚀 Welcome to Modix Installer          ");
  console.log(`                 Version ${VERSION}                `);
  console.log(" Supported OS: Windows & Linux only");
  console.log("=================================================");
  console.log(" Developed by OV3RLORD & the Modix Team");
  console.log(" Website: https://modix.store");
  console.log(" Discord: https://discord.gg/chYMJTGn");
  console.log("=================================================\n");

  const backendDir = path.join(__dirname, "../backend");
  const venvDir = path.join(backendDir, "venv");
  const requirementsFile = path.join(backendDir, "requirements.txt");
  const checksumFile = path.join(__dirname, "../.install_checksums.json");

  const prevChecksums = fs.existsSync(checksumFile)
    ? JSON.parse(fs.readFileSync(checksumFile, "utf8"))
    : {};

  const reqHash = hashFile(requirementsFile);
  if (reqHash !== prevChecksums.requirements) {
    if (fs.existsSync(venvDir)) fs.rmSync(venvDir, { recursive: true, force: true });
    log("run", "Creating Python virtual environment...");
    execSync(
      `${process.platform === "win32" ? "py -3" : "python3"} -m venv "${venvDir}"`,
      { stdio: "inherit", shell: true }
    );

    const pythonVenv =
      process.platform === "win32"
        ? path.join(venvDir, "Scripts", "python.exe")
        : path.join(venvDir, "bin", "python3");

    log("run", "Installing backend dependencies...");
    execSync(`"${pythonVenv}" -m pip install --upgrade pip`, { stdio: "inherit", shell: true });
    execSync(`"${pythonVenv}" -m pip install -r "${requirementsFile}"`, { stdio: "inherit", shell: true });
    log("ok", "Backend setup complete ✅");
    prevChecksums.requirements = reqHash;
  } else {
    log("ok", "Backend already up-to-date ✅");
  }

  const pkgLock = hashFile(path.join(__dirname, "../package-lock.json"));
  if (pkgLock !== prevChecksums.packageLock) {
    log("run", "Installing frontend dependencies...");
    execSync("npm ci", { stdio: "inherit", shell: true });
    log("ok", "Frontend setup complete ✅");
    prevChecksums.packageLock = pkgLock;
  } else {
    log("ok", "Frontend already up-to-date ✅");
  }

  // ------------------- Ports & .env -------------------
  const frontendPort = await getFreePort(3000);
  const backendPort = await getFreePort(2010);
  const currentOS = process.platform; // "win32" or "linux"

  fs.writeFileSync(
    path.join(__dirname, "../.env"),
    `PORT=${frontendPort}\nAPI_PORT=${backendPort}\nREACT_APP_OS=${currentOS}\n`
  );

  log("ok", `Environment ready → Frontend:${frontendPort} | Backend:${backendPort} | OS:${currentOS}`);

  // ------------------- Launcher scripts -------------------
  const pythonVenv =
    process.platform === "win32"
      ? path.join(venvDir, "Scripts", "python.exe")
      : path.join(venvDir, "bin", "python3");

  let launcherPath;
  if (process.platform === "win32") {
    launcherPath = path.join(__dirname, "../launch_modix.bat");
    fs.writeFileSync(
      launcherPath,
      `@echo off\n` +
        `echo 🚀 Starting Modix ${VERSION}...\n` +
        `start "" "${pythonVenv}" -m uvicorn backend.main:app --host 127.0.0.1 --port ${backendPort}\n` +
        `npx cross-env PORT=${frontendPort} API_PORT=${backendPort} npm run dev\n`
    );

    const shortcut = path.join(os.homedir(), "Desktop", "Modix.lnk");
    execSync(
      `powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('${shortcut}');$s.TargetPath='${launcherPath}';$s.Save()"`
    );
    log("ok", `Windows launcher + Desktop shortcut created`);
  } else {
    launcherPath = path.join(__dirname, "../launch_modix.sh");
    fs.writeFileSync(
      launcherPath,
      `#!/bin/bash\n` +
        `echo "🚀 Starting Modix ${VERSION}..."\n` +
        `"${pythonVenv}" -m uvicorn backend.main:app --host 127.0.0.1 --port ${backendPort} &\n` +
        `npx cross-env PORT=${frontendPort} API_PORT=${backendPort} npm run dev\n`
    );
    fs.chmodSync(launcherPath, "755");
    log("ok", `Linux launcher created: ${launcherPath}`);
  }

  fs.writeFileSync(checksumFile, JSON.stringify(prevChecksums, null, 2));

  const { launch } = await inquirer.prompt([
    {
      type: "confirm",
      name: "launch",
      message: `Do you want to launch Modix ${VERSION} now?`,
      default: true,
    },
  ]);

  if (launch) {
    log("run", "Launching Modix in background...");
    if (process.platform === "win32") {
      spawn("cmd.exe", ["/c", `start ${launcherPath}`], { detached: true });
    } else {
      spawn("sh", ["-c", `${launcherPath} &`], { detached: true });
    }
  }

  console.log("\n=================================================");
  console.log(` ✅ Modix ${VERSION} installation complete`);
  console.log("    Developed by OV3RLORD & the Modix Team");
  console.log("    Website: https://modix.store");
  console.log("    Discord: https://discord.gg/chYMJTGn");
  console.log("=================================================\n");
})();
