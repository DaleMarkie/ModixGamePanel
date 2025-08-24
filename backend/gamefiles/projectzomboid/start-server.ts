import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import express from "express";

const app = express();
app.use(express.json());

let runningProcess: any = null;

// Utility: get script path based on OS
const getScriptPath = (osType: string) => {
  return osType === "linux"
    ? path.resolve("backend/gamefiles/projectzomboid/linux/server.sh")
    : path.resolve("backend/gamefiles/projectzomboid/windows/server.bat");
};

// Start server
app.post("/start-server", (req, res) => {
  const osType = req.query.os === "windows" ? "windows" : "linux";

  if (runningProcess) {
    return res.status(400).json({ error: "Server is already running" });
  }

  const scriptPath = getScriptPath(osType);
  if (!fs.existsSync(scriptPath)) {
    return res
      .status(404)
      .json({ error: `Server script not found: ${scriptPath}` });
  }

  try {
    runningProcess =
      osType === "linux"
        ? spawn("bash", [scriptPath], { cwd: path.dirname(scriptPath) })
        : spawn("cmd.exe", ["/c", scriptPath], {
            cwd: path.dirname(scriptPath),
          });

    runningProcess.stdout.on("data", (data) => {
      console.log(`[SERVER]: ${data}`);
    });

    runningProcess.stderr.on("data", (data) => {
      console.error(`[SERVER ERROR]: ${data}`);
    });

    runningProcess.on("exit", (code) => {
      console.log(`[SYSTEM] Server stopped with code ${code}`);
      runningProcess = null;
    });

    res.json({ status: "running", message: "Server started successfully" });
  } catch (err: any) {
    runningProcess = null;
    res.status(500).json({ error: `Failed to start server: ${err.message}` });
  }
});

// Stop server
app.post("/stop-server", (req, res) => {
  if (!runningProcess) {
    return res.status(400).json({ error: "Server is not running" });
  }

  runningProcess.kill();
  runningProcess = null;
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

  const sendData = (data: string) => res.write(`data: ${data}\n\n`);
  const stdoutListener = (data: Buffer) => sendData(data.toString());
  const stderrListener = (data: Buffer) =>
    sendData(`[ERROR] ${data.toString()}`);

  if (runningProcess) {
    runningProcess.stdout.on("data", stdoutListener);
    runningProcess.stderr.on("data", stderrListener);
  }

  const interval = setInterval(() => res.write(":\n"), 10000); // keep alive

  req.on("close", () => {
    clearInterval(interval);
    if (runningProcess) {
      runningProcess.stdout.off("data", stdoutListener);
      runningProcess.stderr.off("data", stderrListener);
    }
  });
});

app.listen(2010, () =>
  console.log("Project Zomboid API listening on port 2010")
);
