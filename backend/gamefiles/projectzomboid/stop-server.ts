const stopServer = async () => {
  if (!API_BASE) return;
  try {
    const res = await fetch(`${API_BASE}/stop-server`, { method: "POST" });
    const data = await res.json();
    if (data.error) addLog(`[Error] ${data.error}`, "system");
    if (data.message) addLog(`[Info] ${data.message}`, "system");
    fetchStatus();
  } catch (err: any) {
    addLog(`[Error] Failed to stop server: ${err.message}`, "system");
  }
};
