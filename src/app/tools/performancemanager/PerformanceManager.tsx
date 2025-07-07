import React, { useEffect, useState, useRef } from "react";
import "./PerformanceManager.css";

const UsageBar = ({ percent, color }: { percent: number; color: string }) => (
  <div className="usageBarContainer">
    <div
      className="usageBar"
      style={{ width: `${percent}%`, backgroundColor: color }}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
    />
  </div>
);

const PerformanceManager = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const cpuCanvasRef = useRef<HTMLCanvasElement>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Replace this mock data with your real API call
      const data = await fetch("/api/performance").then((res) => res.json());
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // (Optional) Draw CPU graph on canvas - omitted for brevity

  return (
    <main className="main">
      <header>
        <h1 className="header">Modix Performance Monitor</h1>
      </header>

      <section className="controls">
        <button
          className="btn"
          onClick={fetchStats}
          disabled={loading}
          aria-label="Refresh Performance Stats"
        >
          Refresh
        </button>
        <button
          className="btn"
          onClick={() => setAutoRefresh(!autoRefresh)}
          aria-pressed={autoRefresh}
          aria-label="Toggle Auto Refresh"
        >
          {autoRefresh ? "Pause Auto Refresh" : "Start Auto Refresh"}
        </button>
      </section>

      {loading && <p>Loading stats...</p>}

      {stats && (
        <>
          <section className="grid" aria-live="polite">
            <article className="cpuSection" aria-label="CPU Usage">
              <h2>CPU Usage</h2>
              <div className="cpuCores">
                {stats.cpu.usagePerCore.map((usage: number, idx: number) => (
                  <div className="cpuCore" key={idx}>
                    <strong>Core {idx + 1}</strong>
                    <UsageBar percent={usage} color="#80deea" />
                    <span>{usage}%</span>
                  </div>
                ))}
              </div>
              <div className="cpuLoadAverages">
                Load Averages: {stats.cpu.loadAverage.join(", ")}
              </div>
              <canvas
                className="cpuGraph"
                ref={cpuCanvasRef}
                aria-hidden="true"
              />
            </article>

            <article className="memorySection" aria-label="Memory Usage">
              <h2>Memory Usage</h2>
              <div className="memoryStats">
                <p>Total: {stats.memory.total} MB</p>
                <p>Used: {stats.memory.used} MB</p>
                <p>Free: {stats.memory.free} MB</p>
                <p>Buffers: {stats.memory.buffers} MB</p>
                <p>Cache: {stats.memory.cache} MB</p>
                <p>Swap Total: {stats.memory.swapTotal} MB</p>
                <p>Swap Used: {stats.memory.swapUsed} MB</p>
              </div>
              <UsageBar
                percent={(stats.memory.used / stats.memory.total) * 100}
                color="#81c784"
              />
            </article>

            <article className="diskSection" aria-label="Disk Usage">
              <h2>Disk Usage</h2>
              {stats.disks.map((disk: any) => (
                <div className="diskInfo" key={disk.name}>
                  <strong>{disk.name}</strong>
                  <p>
                    {disk.used} / {disk.total} GB used ({disk.percent}%)
                  </p>
                  <UsageBar percent={disk.percent} color="#ffb74d" />
                </div>
              ))}
            </article>

            <article className="networkSection" aria-label="Network Interfaces">
              <h2>Network Traffic</h2>
              {stats.network.map((iface: any) => (
                <div className="networkIface" key={iface.name}>
                  <strong>{iface.name}</strong>
                  <p>
                    RX: {iface.rxMBps} MB/s | TX: {iface.txMBps} MB/s
                  </p>
                  <UsageBar
                    percent={Math.min(100, (iface.rxMBps / 100) * 100)}
                    color="#80deea"
                  />
                  <UsageBar
                    percent={Math.min(100, (iface.txMBps / 100) * 100)}
                    color="#4dd0e1"
                  />
                </div>
              ))}
            </article>

            <article className="processesSection" aria-label="Processes">
              <h2>Processes ({stats.totalProcesses} total)</h2>
              <p>Top CPU-consuming processes:</p>
              <ul>
                {stats.topProcesses.map((proc: any) => (
                  <li key={proc.pid}>
                    <strong>{proc.name}</strong> (PID: {proc.pid}) - CPU:{" "}
                    {proc.cpuPercent}%
                    <UsageBar percent={proc.cpuPercent} color="#ef9a9a" />
                  </li>
                ))}
              </ul>
            </article>

            <article className="uptimeSection" aria-label="Server Uptime">
              <h2>Server Uptime</h2>
              <p>{stats.uptime}</p>
            </article>
          </section>

          {/* DDoS Attack Monitoring Section */}
          <section
            className="ddosSectionContainer"
            aria-label="DDoS Attack Monitoring"
          >
            <header className="ddosHeader">
              <h2>DDoS Attack Monitoring</h2>
              <span
                className={`ddosStatusBadge ${
                  stats.ddos?.attackDetected ? "ddosActive" : "ddosInactive"
                }`}
                aria-live="polite"
              >
                {stats.ddos?.attackDetected ? "Attack Detected" : "No Attack"}
              </span>
            </header>

            {!stats.ddos || !stats.ddos.attackDetected ? (
              <p className="ddosNoAttackMsg">
                No active Distributed Denial of Service attacks detected on this
                server.
              </p>
            ) : (
              <div className="ddosDetailsGrid">
                <div className="ddosDetailItem">
                  <strong>Type:</strong>
                  <span>{stats.ddos.attackType}</span>
                </div>
                <div className="ddosDetailItem">
                  <strong>Packet Rate:</strong>
                  <span>
                    {stats.ddos.packetRate.toLocaleString()} packets/sec
                  </span>
                </div>
                <div className="ddosDetailItem">
                  <strong>Duration:</strong>
                  <span>{stats.ddos.durationSeconds} seconds</span>
                </div>
                <div className="ddosDetailItem">
                  <strong>Bandwidth Spike:</strong>
                  <span>{stats.ddos.bandwidthSpikePercent}%</span>
                </div>
                <div className="ddosDetailItem ddosSourceIPs">
                  <strong>Source IPs:</strong>
                  <ul>
                    {stats.ddos.sourceIPs.map((ip: string, i: number) => (
                      <li key={i}>{ip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <footer className="footer">
        <p>Modix Game Panel © 2025 — Performance Monitor</p>
      </footer>
    </main>
  );
};

export default PerformanceManager;
