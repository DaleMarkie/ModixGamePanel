"use client";
import "./PortChecker.css";
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";

interface ContainerPortCheckResult {
  containerName: string;
  image: string;
  internalPort: number;
  hostPort: number;
  isReachable: boolean;
  ip: string;
  status: "open" | "closed" | "error";
  message?: string;
}

interface ManualPortStatus extends ContainerPortCheckResult {}

interface RangeScanResult {
  port: number;
  status: "open" | "closed" | "error";
  latencyMs?: number;
}

const POLL_INTERVAL = 30_000; // 30 seconds

const StatusBadge = ({
  status,
}: {
  status: ContainerPortCheckResult["status"] | RangeScanResult["status"];
}) => {
  const statusMap = {
    open: { label: "Open", emoji: "✅", className: "badge--open" },
    closed: { label: "Closed", emoji: "❌", className: "badge--closed" },
    error: { label: "Error", emoji: "⚠️", className: "badge--error" },
  };

  const info = statusMap[status];
  if (!info) return null;

  return (
    <span
      className={`badge ${info.className}`}
      aria-label={`${info.label} port`}
      role="status"
    >
      {info.emoji} {info.label}
    </span>
  );
};

const TAB_KEYS = {
  DOCKER: "docker",
  MANUAL: "manual",
  RANGE: "range",
  GEOIP: "geoip",
} as const;

type TabKey = keyof typeof TAB_KEYS;

const PortChecker = () => {
  // Docker containers
  const [containers, setContainers] = useState<ContainerPortCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual port check
  const [manualHost, setManualHost] = useState("");
  const [manualPort, setManualPort] = useState("");
  const [manualStatus, setManualStatus] = useState<ManualPortStatus | null>(
    null
  );
  const [manualLoading, setManualLoading] = useState(false);

  // Port range scan
  const [rangeHost, setRangeHost] = useState("");
  const [rangeStartPort, setRangeStartPort] = useState(27015);
  const [rangeEndPort, setRangeEndPort] = useState(27025);
  const [rangeResults, setRangeResults] = useState<RangeScanResult[]>([]);
  const [rangeLoading, setRangeLoading] = useState(false);

  // GeoIP lookup
  const [geoIpHost, setGeoIpHost] = useState("");
  const [geoIpResult, setGeoIpResult] = useState<any>(null);
  const [geoIpLoading, setGeoIpLoading] = useState(false);
  const [geoIpError, setGeoIpError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<TabKey>(TAB_KEYS.DOCKER);

  // Polling ref for Docker fetch
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch docker container port info
  const fetchDockerInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/docker-port-check");
      if (!res.ok) throw new Error(`API error: ${res.statusText}`);
      const data = await res.json();
      if (!data.containers) throw new Error("Malformed response");
      setContainers(data.containers);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setContainers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDockerInfo();

    pollRef.current = setInterval(fetchDockerInfo, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchDockerInfo]);

  // Manual port check
  const checkManualPort = async () => {
    if (!manualHost || !manualPort) return;
    setManualLoading(true);
    setManualStatus(null);
    try {
      const res = await fetch(
        `/api/port-check?host=${encodeURIComponent(
          manualHost
        )}&port=${encodeURIComponent(manualPort)}`
      );
      if (!res.ok) throw new Error(`API error: ${res.statusText}`);
      const data = await res.json();
      setManualStatus({
        containerName: "Manual",
        image: "N/A",
        internalPort: Number(manualPort),
        hostPort: Number(manualPort),
        ip: manualHost,
        isReachable: data.open,
        status: data.open ? "open" : "closed",
      });
    } catch (err: any) {
      setManualStatus({
        containerName: "Manual",
        image: "N/A",
        internalPort: Number(manualPort),
        hostPort: Number(manualPort),
        ip: manualHost,
        isReachable: false,
        status: "error",
        message: err.message,
      });
    } finally {
      setManualLoading(false);
    }
  };

  // Port range scan
  const scanPortRange = async () => {
    if (!rangeHost || rangeStartPort <= 0 || rangeEndPort <= 0) return;
    if (rangeEndPort < rangeStartPort) {
      alert("End port must be greater than or equal to start port");
      return;
    }

    setRangeLoading(true);
    setRangeResults([]);

    const results: RangeScanResult[] = [];
    for (let port = rangeStartPort; port <= rangeEndPort; port++) {
      try {
        const res = await fetch(
          `/api/port-check?host=${encodeURIComponent(rangeHost)}&port=${port}`
        );
        if (!res.ok) throw new Error(`API error: ${res.statusText}`);
        const data = await res.json();

        // Optional latency ping
        let latencyMs: number | undefined;
        try {
          const pingRes = await fetch(
            `/api/ping?host=${encodeURIComponent(rangeHost)}&port=${port}`
          );
          if (pingRes.ok) {
            const pingData = await pingRes.json();
            latencyMs = pingData.latencyMs;
          }
        } catch {}

        results.push({
          port,
          status: data.open ? "open" : "closed",
          latencyMs,
        });
      } catch {
        results.push({ port, status: "error" });
      }
      // Progressive update to display results live
      setRangeResults([...results]);
    }
    setRangeLoading(false);
  };

  // GeoIP lookup
  const lookupGeoIP = async () => {
    if (!geoIpHost) return;
    setGeoIpLoading(true);
    setGeoIpResult(null);
    setGeoIpError(null);
    try {
      const res = await fetch(`/api/geoip-lookup?host=${encodeURIComponent(geoIpHost)}`);
      if (!res.ok) throw new Error(`API error: ${res.statusText}`);
      const data = await res.json();
      setGeoIpResult(data);
    } catch (err: any) {
      setGeoIpError(err.message || "Lookup failed");
    } finally {
      setGeoIpLoading(false);
    }
  };

  // Docker container control (restart/stop)
  const containerControl = async (containerName: string, action: "restart" | "stop") => {
    try {
      const res = await fetch(`/api/docker-container-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ containerName, action }),
      });
      if (!res.ok) throw new Error(`Failed to ${action} container`);
      await fetchDockerInfo();
    } catch (err: any) {
      alert(err.message || `Error during ${action}`);
    }
  };

  // Keyboard shortcuts: manual check Enter
  const onManualKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !manualLoading && manualHost && manualPort) {
      checkManualPort();
    }
  };

  // Keyboard shortcuts: range scan Enter
  const onRangeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      !rangeLoading &&
      rangeHost &&
      rangeStartPort > 0 &&
      rangeEndPort > 0
    ) {
      scanPortRange();
    }
  };

  // Tabs UI data
  const tabs = useMemo(
    () => [
      { key: TAB_KEYS.DOCKER, label: "Docker Containers" },
      { key: TAB_KEYS.MANUAL, label: "Manual Check" },
      { key: TAB_KEYS.RANGE, label: "Port Range Scan" },
      { key: TAB_KEYS.GEOIP, label: "GeoIP Lookup" },
    ],
    []
  );

  return (
    <section className="port-checker" aria-label="Port Checker Tool">
      <h1>Port Checker</h1>
      <nav className="tabs" role="tablist" aria-label="Port Checker Tabs">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`${key}-panel`}
            id={`${key}-tab`}
            className={`tab-button ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
            tabIndex={activeTab === key ? 0 : -1}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Docker Containers Tab */}
      {activeTab === TAB_KEYS.DOCKER && (
        <section
          id={`${TAB_KEYS.DOCKER}-panel`}
          role="tabpanel"
          aria-labelledby={`${TAB_KEYS.DOCKER}-tab`}
          tabIndex={0}
          className="tab-panel"
        >
          {loading && <p>Loading Docker containers...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!loading && !error && containers.length === 0 && (
            <p>No Docker containers found or no port info available.</p>
          )}
          {!loading && !error && containers.length > 0 && (
            <table className="container-table" role="grid" aria-label="Docker Containers">
              <thead>
                <tr>
                  <th>Container Name</th>
                  <th>Image</th>
                  <th>Internal Port</th>
                  <th>Host Port</th>
                  <th>Host IP</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((c) => (
                  <tr key={c.containerName}>
                    <td>{c.containerName}</td>
                    <td>{c.image}</td>
                    <td>{c.internalPort}</td>
                    <td>{c.hostPort}</td>
                    <td>{c.ip}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => containerControl(c.containerName, "restart")}
                        aria-label={`Restart container ${c.containerName}`}
                      >
                        🔄 Restart
                      </button>
                      <button
                        type="button"
                        onClick={() => containerControl(c.containerName, "stop")}
                        aria-label={`Stop container ${c.containerName}`}
                      >
                        ⏹ Stop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Manual Port Check Tab */}
      {activeTab === TAB_KEYS.MANUAL && (
        <section
          id={`${TAB_KEYS.MANUAL}-panel`}
          role="tabpanel"
          aria-labelledby={`${TAB_KEYS.MANUAL}-tab`}
          tabIndex={0}
          className="tab-panel"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!manualLoading) checkManualPort();
            }}
          >
            <label htmlFor="manual-host">Host (IP or Domain):</label>
            <input
              id="manual-host"
              type="text"
              value={manualHost}
              onChange={(e) => setManualHost(e.target.value)}
              required
              placeholder="e.g., 192.168.1.1"
              aria-required="true"
              autoComplete="off"
            />
            <label htmlFor="manual-port">Port:</label>
            <input
              id="manual-port"
              type="number"
              value={manualPort}
              onChange={(e) => setManualPort(e.target.value)}
              onKeyDown={onManualKeyDown}
              min={1}
              max={65535}
              required
              aria-required="true"
              placeholder="e.g., 27015"
            />
            <button type="submit" disabled={manualLoading}>
              {manualLoading ? "Checking..." : "Check Port"}
            </button>
          </form>

          {manualStatus && (
            <div
              className={`manual-status status-${manualStatus.status}`}
              role="region"
              aria-live="polite"
            >
              <p>
                Port {manualStatus.hostPort} on {manualStatus.ip} is{" "}
                <strong>{manualStatus.status.toUpperCase()}</strong>.
              </p>
              {manualStatus.message && (
                <p className="error-message">{manualStatus.message}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Port Range Scan Tab */}
      {activeTab === TAB_KEYS.RANGE && (
        <section
          id={`${TAB_KEYS.RANGE}-panel`}
          role="tabpanel"
          aria-labelledby={`${TAB_KEYS.RANGE}-tab`}
          tabIndex={0}
          className="tab-panel"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!rangeLoading) scanPortRange();
            }}
          >
            <label htmlFor="range-host">Host (IP or Domain):</label>
            <input
              id="range-host"
              type="text"
              value={rangeHost}
              onChange={(e) => setRangeHost(e.target.value)}
              required
              placeholder="e.g., example.com"
              aria-required="true"
              autoComplete="off"
            />
            <label htmlFor="range-start-port">Start Port:</label>
            <input
              id="range-start-port"
              type="number"
              value={rangeStartPort}
              onChange={(e) => setRangeStartPort(Number(e.target.value))}
              onKeyDown={onRangeKeyDown}
              min={1}
              max={65535}
              required
              aria-required="true"
            />
            <label htmlFor="range-end-port">End Port:</label>
            <input
              id="range-end-port"
              type="number"
              value={rangeEndPort}
              onChange={(e) => setRangeEndPort(Number(e.target.value))}
              onKeyDown={onRangeKeyDown}
              min={1}
              max={65535}
              required
              aria-required="true"
            />
            <button type="submit" disabled={rangeLoading}>
              {rangeLoading ? "Scanning..." : "Scan Range"}
            </button>
          </form>

          {rangeResults.length > 0 && (
            <table className="range-results" role="grid" aria-label="Port Range Scan Results">
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Status</th>
                  <th>Latency (ms)</th>
                </tr>
              </thead>
              <tbody>
                {rangeResults.map(({ port, status, latencyMs }) => (
                  <tr key={port}>
                    <td>{port}</td>
                    <td>
                      <StatusBadge status={status} />
                    </td>
                    <td>{latencyMs ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* GeoIP Lookup Tab */}
      {activeTab === TAB_KEYS.GEOIP && (
        <section
          id={`${TAB_KEYS.GEOIP}-panel`}
          role="tabpanel"
          aria-labelledby={`${TAB_KEYS.GEOIP}-tab`}
          tabIndex={0}
          className="tab-panel"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!geoIpLoading && geoIpHost) lookupGeoIP();
            }}
          >
            <label htmlFor="geoip-host">Host (IP or Domain):</label>
            <input
              id="geoip-host"
              type="text"
              value={geoIpHost}
              onChange={(e) => setGeoIpHost(e.target.value)}
              required
              placeholder="e.g., 8.8.8.8"
              aria-required="true"
              autoComplete="off"
            />
            <button type="submit" disabled={geoIpLoading}>
              {geoIpLoading ? "Looking up..." : "Lookup GeoIP"}
            </button>
          </form>

          {geoIpError && <p className="error-message">Error: {geoIpError}</p>}

          {geoIpResult && (
            <pre
              className="geoip-result"
              aria-live="polite"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {JSON.stringify(geoIpResult, null, 2)}
            </pre>
          )}
        </section>
      )}
    </section>
  );
};

export default PortChecker;
