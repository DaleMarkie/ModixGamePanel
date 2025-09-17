// server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = 2010;

let serverProcess: ChildProcessWithoutNullStreams | null = null;
let activeGame: string | null = null;
let activeOS: string | null = null;

// Get shell script path
function getScriptPath(gameId: string, os: string) {
  return path.join(
    __dirname,
    "projectzomboid",
    os === "windows" ? "start-windows-server.sh" : "start-linux-server.sh"
  );
}

// Status
app.get(
  "/api/terminal/projectzomboid/:gameId/:os/status",
  (req: Request, res: Response) => {
    const { gameId, os } = req.params;
    if (serverProcess && gameId === activeGame && os === activeOS) {
      res.json({ status: "running" });
    } else {
      res.json({ status: "stopped" });
    }
  }
);

// Start server
app.post(
  "/api/terminal/projectzomboid/:gameId/:os/start-server",
  (req: Request, res: Response) => {
    const { gameId, os } = req.params;
    if (serverProcess) {
      return res
        .status(400)
        .json({ success: false, message: "Server already running" });
    }

    const script = getScriptPath(gameId, os);

    serverProcess = spawn("bash", [script], { cwd: path.dirname(script) });
    activeGame = gameId;
    activeOS = os;

    serverProcess.stdout.on("data", (data) => {
      console.log(`[SERVER-OUT] ${data.toString()}`);
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`[SERVER-ERR] ${data.toString()}`);
    });

    serverProcess.on("close", (code) => {
      console.log(`[SERVER] Process exited with code ${code}`);
      serverProcess = null;
      activeGame = null;
      activeOS = null;
    });

    res.json({ success: true, message: "Server started" });
  }
);

// Stop server
app.post(
  "/api/terminal/projectzomboid/:gameId/:os/stop-server",
  (req: Request, res: Response) => {
    if (!serverProcess) {
      return res
        .status(400)
        .json({ success: false, message: "No server running" });
    }
    serverProcess.kill("SIGTERM");
    res.json({ success: true, message: "Server stopping" });
  }
);

// SSE log stream
app.get(
  "/api/terminal/projectzomboid/:gameId/:os/log-stream",
  (req: Request, res: Response) => {
    const { gameId, os } = req.params;
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const sendLog = (data: Buffer | string) => {
      if (serverProcess && gameId === activeGame && os === activeOS) {
        res.write(`data: ${data.toString()}\n\n`);
      }
    };

    if (serverProcess) {
      serverProcess.stdout.on("data", sendLog);
      serverProcess.stderr.on("data", sendLog);
    }

    req.on("close", () => res.end());
  }
);

app.listen(PORT, () => {
  console.log(`Node.js Project Zomboid backend listening on port ${PORT}`);
});
