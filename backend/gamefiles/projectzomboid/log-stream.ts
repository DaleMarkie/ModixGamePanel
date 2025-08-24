import { getRunningProcess } from "../start-server";

export default function handler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const proc = getRunningProcess();
  if (!proc) {
    res.write(`data: [SYSTEM] No server running\n\n`);
    res.end();
    return;
  }

  const onStdout = (data) => res.write(`data: ${data.toString()}\n\n`);
  const onStderr = (data) => res.write(`data: [ERROR] ${data.toString()}\n\n`);

  proc.stdout.on("data", onStdout);
  proc.stderr.on("data", onStderr);

  req.on("close", () => {
    proc.stdout.off("data", onStdout);
    proc.stderr.off("data", onStderr);
  });
}
