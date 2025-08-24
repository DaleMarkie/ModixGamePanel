import { getRunningProcess } from "./start-server";

export default async function handler(req, res) {
  const runningProcess = getRunningProcess();
  if (runningProcess) {
    res.json({ status: "running" });
  } else {
    res.json({ status: "stopped" });
  }
}
