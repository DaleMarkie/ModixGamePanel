import React, { useState, useEffect } from "react";
import "./PortCheck.css";
import {
  FaSyncAlt,
  FaStopCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
} from "react-icons/fa";

type Status = "open" | "closed" | "checking" | "error";

interface Container {
  name: string;
  image: string;
  port: number;
  status: Status;
}

const statusColors: Record<Status, string> = {
  open: "status-open",
  closed: "status-closed",
  checking: "status-checking",
  error: "status-error",
};

export default function PortCheck() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loadingContainers, setLoadingContainers] = useState(false);
  const [manualHost, setManualHost] = useState("");
  const [manualPort, setManualPort] = useState("");
  const [manualStatus, setManualStatus] = useState<Status | null>(null);
  const [manualChecking, setManualChecking] = useState(false);

  const loadContainers = async () => {
    setLoadingContainers(true);
    await new Promise((r) => setTimeout(r, 1000));
    setContainers([
      {
        name: "pz-server-1",
        image: "projectzomboid:latest",
        port: 27015,
        status: "open",
      },
      {
        name: "pz-server-2",
        image: "projectzomboid:latest",
        port: 27016,
        status: "closed",
      },
    ]);
    setLoadingContainers(false);
  };

  useEffect(() => {
    loadContainers();
  }, []);

  const handleAction = async (name: string, action: "restart" | "stop") => {
    alert(`${action} triggered on ${name}`);
    loadContainers();
  };

  const checkPort = async () => {
    if (!manualHost || !manualPort) return;
    setManualChecking(true);
    setManualStatus("checking");
    await new Promise((r) => setTimeout(r, 1200));
    setManualStatus(Math.random() > 0.5 ? "open" : "closed");
    setManualChecking(false);
  };

  return (
    <div className="port-check-container">
      <h1 className="title">Port Checker & Docker Manager</h1>

      {/* Docker Containers */}
      <section>
        <div className="section-header">
          <h2>Docker Containers</h2>
          <button
            onClick={loadContainers}
            disabled={loadingContainers}
            aria-label="Refresh containers"
            className="btn btn-refresh"
          >
            {loadingContainers ? (
              <FaSpinner className="icon-spin" />
            ) : (
              <FaSyncAlt />
            )}{" "}
            Refresh
          </button>
        </div>

        {loadingContainers ? (
          <p className="text-muted">Loading containers...</p>
        ) : containers.length === 0 ? (
          <p className="text-muted">No containers found.</p>
        ) : (
          <table className="containers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Image</th>
                <th>Port</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {containers.map(({ name, image, port, status }) => (
                <tr key={name} className="table-row">
                  <td className="name">{name}</td>
                  <td>{image}</td>
                  <td className="port">{port}</td>
                  <td className={`status ${statusColors[status]}`}>
                    {status === "open" ? (
                      <FaCheckCircle className="icon-inline" />
                    ) : (
                      <FaTimesCircle className="icon-inline" />
                    )}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => handleAction(name, "restart")}
                      aria-label={`Restart container ${name}`}
                      title="Restart"
                      className="btn-icon btn-blue"
                    >
                      <FaSyncAlt size={20} />
                    </button>
                    <button
                      onClick={() => handleAction(name, "stop")}
                      aria-label={`Stop container ${name}`}
                      title="Stop"
                      className="btn-icon btn-red"
                    >
                      <FaStopCircle size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Manual Port Check */}
      <section>
        <h2 className="section-title">Manual Port Check</h2>
        <div className="manual-check-form">
          <input
            type="text"
            placeholder="Host or IP"
            value={manualHost}
            onChange={(e) => setManualHost(e.target.value)}
            className="input-text"
          />
          <input
            type="number"
            placeholder="Port"
            value={manualPort}
            onChange={(e) => setManualPort(e.target.value)}
            min={1}
            max={65535}
            className="input-number"
          />
          <button
            onClick={checkPort}
            disabled={manualChecking || !manualHost || !manualPort}
            className="btn btn-check"
          >
            {manualChecking ? (
              <FaSpinner className="icon-spin" />
            ) : (
              <FaSearch />
            )}{" "}
            Check
          </button>
        </div>

        {manualStatus && manualStatus !== "checking" && (
          <p
            className={`manual-status ${
              manualStatus === "open" ? "status-open" : "status-closed"
            }`}
            aria-live="polite"
          >
            {manualStatus === "open"
              ? `Port ${manualPort} on ${manualHost} is open.`
              : `Port ${manualPort} on ${manualHost} is closed.`}
          </p>
        )}
      </section>
    </div>
  );
}
