#!/usr/bin/env node
/**
 * Modix Advanced Installer v1.1.2 - Fixed venv handling
 */

const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

(async () => {
  const inquirer = (await import("inquirer")).default;
  const chalk = (await import("chalk")).default;
  const ora = (await import("ora")).default;

  const VERSION = "v1.1.2";

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
  console.log(chalk.green.bold(`🚀 Modix Installer v${VERSION}`));

  const backendDir = path.join(__dirname, "../backend");
  const venvDir = path.join(backendDir, "venv");

  // --- Function to create or repair venv ---
  function createOrRepairVenv() {
    try {
      // Test pip in venv
      execSync(`"${venvDir}/bin/python3" -m pip --version`, {
        stdio: "ignore",
      });
      log("ok", "Python virtual environment is healthy ✅");
    } catch {
      log("warn", "Broken venv detected, recreating...");
      fs.rmSync(venvDir, { recursive: true, force: true });
      execSync(`python3 -m venv "${venvDir}"`, { stdio: "inherit" });
      execSync(`"${venvDir}/bin/python3" -m ensurepip --upgrade`, {
        stdio: "inherit",
      });
      execSync(
        `"${venvDir}/bin/python3" -m pip install --upgrade pip setuptools wheel`,
        { stdio: "inherit" }
      );
      log("ok", "Python virtual environment repaired ✅");
    }
  }

  createOrRepairVenv();

  // --- Install backend dependencies ---
  const spinner = ora("Installing backend dependencies...").start();
  try {
    execSync(
      `"${venvDir}/bin/python3" -m pip install -r "${backendDir}/requirements.txt"`,
      { stdio: "inherit" }
    );
    spinner.succeed("Backend dependencies installed ✅");
  } catch (e) {
    spinner.fail("Failed to install backend dependencies ❌");
    console.error(e);
    process.exit(1);
  }

  // --- OS-specific launcher ---
  if (process.platform === "win32") {
    log("info", "Windows detected - create launcher manually if needed");
  } else {
    log("info", "Linux detected - make sure AppImage exists in dist/");
  }

  log("ok", `Modix v${VERSION} setup complete!`);
})();
