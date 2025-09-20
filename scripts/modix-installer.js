#!/usr/bin/env node
/**
 * 🚀 Modix Advanced Installer v1.1.2
 * Supported OS: Windows & Linux only
 * Fully packaged version only — no dev/unpacked mode
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
  const chalk = (await import("chalk")).default;
  const ora = (await import("ora")).default;

  const VERSION = "v1.1.2";

  if (!["win32", "linux"].includes(process.platform)) {
    console.error(chalk.red.bold("❌ Modix Installer only supports Windows and Linux."));
    process.exit(1);
  }

  function log(step, msg) {
    const icons = { info: "🔹", ok: "✅", warn: "⚠️", err: "❌", run: "⚡" };
    const colors = {
      info: chalk.cyan,
      ok: chalk.green,
      warn: chalk.yellow,
      err: chalk.red,
      run: chalk.magenta,
    };
    console.log(colors[step] ? colors[step](`${icons[step]} ${msg}`) : msg);
  }

  console.clear();
  console.log(chalk.blueBright("================================================="));
  console.log(chalk.green.bold("        🚀 Welcome to Modix Installer          "));
  console.log(chalk.yellow(`                 Version ${VERSION}                `));
  console.log(chalk.cyan("  Supported OS: Windows & Linux only"));
  console.log(chalk.blueBright("================================================="));
  console.log(chalk.magenta(" Developed by OV3RLORD & the Modix Team"));
  console.log(chalk.magenta(" Website: https://modix.store"));
  console.log(chalk.magenta(" Discord: https://discord.gg/chYMJTGn"));
  console.log(chalk.blueBright("=================================================\n"));

  const backendDir = path.join(__dirname, "../backend");
  const venvDir = path.join(backendDir, "venv");
  const checksumFile = path.join(__dirname, "../.install_checksums.json");

  const prevChecksums = fs.existsSync(checksumFile)
    ? JSON.parse(fs.readFileSync(checksumFile, "utf8"))
    : {};

  // ---------------- Backend Setup (optional, hidden) ----------------
  // We keep Python venv for internal use but user doesn't interact with it
  if (!fs.existsSync(venvDir)) {
    const spinner = ora("Creating Python virtual environment...").start();
    execSync(`${process.platform === "win32" ? "py -3" : "python3"} -m venv "${venvDir}"`, { stdio: "ignore", shell: true });
    spinner.succeed("Python virtual environment ready ✅");
  } else {
    log("ok", "Python virtual environment already exists ✅");
  }

  fs.writeFileSync(checksumFile, JSON.stringify(prevChecksums, null, 2));

  // ---------------- Launcher ----------------
  if (process.platform === "win32") {
    // Windows -> look for EXE
    const exePath = path.join(__dirname, "../dist/Modix Panel-0.1.0.exe");
    if (!fs.existsSync(exePath)) {
      log("err", "Modix .exe not found! Make sure it's in dist/");
      process.exit(1);
    }

    const launcherPath = path.join(__dirname, "../launch_modix.bat");
    fs.writeFileSync(
      launcherPath,
      `@echo off\n` +
      `echo 🚀 Starting Modix ${VERSION}...\n` +
      `start "" "${exePath}"`
    );

    const shortcut = path.join(os.homedir(), "Desktop", "Modix.lnk");
    execSync(`powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('${shortcut}');$s.TargetPath='${launcherPath}';$s.Save()"`);
    log("ok", "Windows launcher + Desktop shortcut created ✅");

    const { launch } = await inquirer.prompt([
      { type: "confirm", name: "launch", message: `Do you want to launch Modix ${VERSION} now?`, default: true }
    ]);
    if (launch) {
      log("run", "Launching Modix...");
      spawn("cmd.exe", ["/c", `start ${launcherPath}`], { detached: true });
    }
  } else {
    // Linux -> AppImage only
    const appImagePath = path.join(__dirname, "../dist/Modix Panel-0.1.0.AppImage");
    if (!fs.existsSync(appImagePath)) {
      log("err", "AppImage not found! Make sure it's in dist/");
      process.exit(1);
    }

    fs.chmodSync(appImagePath, "755");
    log("ok", `AppImage ready: ${appImagePath} ✅`);

    const { launch } = await inquirer.prompt([
      { type: "confirm", name: "launch", message: `Do you want to launch Modix ${VERSION} now?`, default: true }
    ]);
    if (launch) {
      log("run", "Launching Modix AppImage...");
      spawn("sh", ["-c", `${appImagePath} &`], { detached: true });
    }
  }

  console.log(chalk.greenBright("\n================================================="));
  console.log(chalk.green.bold(` ✅ Modix ${VERSION} installation complete`));
  console.log(chalk.cyan("    Developed by OV3RLORD & the Modix Team"));
  console.log(chalk.cyan("    Website: https://modix.store"));
  console.log(chalk.cyan("    Discord: https://discord.gg/chYMJTGn"));
  console.log(chalk.greenBright("=================================================\n"));

})();
