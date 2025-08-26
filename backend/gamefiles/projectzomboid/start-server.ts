import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import express from "express";

const app = express();
app.use(express.json());

let runningProcess: any = null;
const LOGS: { text: string; type: "info" | "error" | "system" }[] = [];

const appendLog = (
  text: string,
  type: "info" | "error" | "system" = "system"
) => {
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${timestamp}] ${text}`;
  console.log(entry);
  LOGS.push({ text: entry, type });
  if (LOGS.length > 500) LOGS.shift();
};

// Determine script path based on OS
const getScriptPath = (osType: string) =>
  osType === "linux"
    ? path.resolve("backend/gamefiles/projectzomboid/linux/server.sh")
    : path.resolve("backend/gamefiles/projectzomboid/windows/server.bat");

// Start server
app.post("/start-server", (req, res) => {
  const osType = req.query.os === "windows" ? "windows" : "linux";

  if (runningProcess) {
    appendLog(`[ERROR] Server is already running`, "error");
    return res.status(400).json({ error: "Server already running" });
  }

  const scriptPath = getScriptPath(osType);
  if (!fs.existsSync(scriptPath)) {
    appendLog(`[ERROR] Server script not found: ${scriptPath}`, "error");
    return res.status(404).json({ error: `Server script not found` });
  }

  appendLog(`[INFO] Starting ${osType} server...`);

  try {
    runningProcess =
      osType === "linux"
        ? spawn("bash", [scriptPath], { cwd: path.dirname(scriptPath) })
        : spawn("cmd.exe", ["/c", scriptPath], {
            cwd: path.dirname(scriptPath),
          });

    runningProcess.stdout.on("data", (data: Buffer) => {
      data
        .toString()
        .split(/\r?\n/)
        .forEach((line) => line && appendLog(line, "info"));
    });

    runningProcess.stderr.on("data", (data: Buffer) => {
      data
        .toString()
        .split(/\r?\n/)
        .forEach((line) => line && appendLog(line, "error"));
    });

    runningProcess.on("exit", (code: number) => {
      appendLog(`[SYSTEM] Server stopped with code ${code}`, "system");
      runningProcess = null;
    });

    res.json({ status: "running", message: `Server started on ${osType}` });
  } catch (err: any) {
    runningProcess = null;
    appendLog(`[ERROR] Failed to start server: ${err.message}`, "error");
    res.status(500).json({ error: err.message });
  }
});

// Stop server
app.post("/stop-server", (req, res) => {
  if (!runningProcess) {
    appendLog(`[ERROR] No server running to stop`, "error");
    return res.status(400).json({ error: "Server is not running" });
  }

  runningProcess.kill();
  runningProcess = null;
  appendLog(`[INFO] Server stopped manually`, "system");
  res.json({ status: "stopped", message: "Server stopped successfully" });
});

// Server status
app.get("/server-status", (req, res) => {
  res.json({ status: runningProcess ? "running" : "stopped" });
});

// SSE log stream
app.get("/log-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  LOGS.forEach((log) => res.write(`data: ${JSON.stringify(log)}\n\n`));

  const sendLog = (log: { text: string; type: string }) =>
    res.write(`data: ${JSON.stringify(log)}\n\n`);

  const stdoutListener = (data: Buffer) =>
    data
      .toString()
      .split(/\r?\n/)
      .forEach((line) => line && sendLog({ text: line, type: "info" }));

  const stderrListener = (data: Buffer) =>
    data
      .toString()
      .split(/\r?\n/)
      .forEach((line) => line && sendLog({ text: line, type: "error" }));

  if (runningProcess) {
    runningProcess.stdout.on("data", stdoutListener);
    runningProcess.stderr.on("data", stderrListener);
  }

  const interval = setInterval(() => res.write(":\n"), 10000);

  req.on("close", () => {
    clearInterval(interval);
    if (runningProcess) {
      runningProcess.stdout.off("data", stdoutListener);
      runningProcess.stderr.off("data", stderrListener);
    }
  });
});

app.listen(2010, () =>
  console.log("Project Zomboid backend running on port 2010")
);
