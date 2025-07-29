import React, { useState, useEffect } from "react";
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
  open: "text-green-400",
  closed: "text-red-500",
  checking: "text-yellow-400",
  error: "text-gray-400",
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
    <div className="bg-zinc-900 text-white min-h-screen p-6 space-y-10">
      <div>
        <h1 className="text-3xl font-semibold mb-4">
          Port Checker & Docker Manager
        </h1>

        {/* Docker Containers */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-medium">Docker Containers</h2>
          <button
            onClick={loadContainers}
            disabled={loadingContainers}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition disabled:opacity-50"
          >
            {loadingContainers ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSyncAlt />
            )}
            Refresh
          </button>
        </div>

        {loadingContainers ? (
          <p className="text-zinc-400">Loading containers...</p>
        ) : containers.length === 0 ? (
          <p className="text-zinc-500">No containers found.</p>
        ) : (
          <div className="overflow-x-auto border border-zinc-700 rounded-md">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-zinc-800 text-zinc-300">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Image</th>
                  <th className="px-4 py-2 text-left">Port</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.map(({ name, image, port, status }) => (
                  <tr
                    key={name}
                    className="border-t border-zinc-800 hover:bg-zinc-800 transition"
                  >
                    <td className="px-4 py-2">{name}</td>
                    <td className="px-4 py-2 text-zinc-400">{image}</td>
                    <td className="px-4 py-2">{port}</td>
                    <td
                      className={`px-4 py-2 flex items-center gap-2 ${statusColors[status]}`}
                    >
                      {status === "open" ? (
                        <FaCheckCircle />
                      ) : (
                        <FaTimesCircle />
                      )}
                      <span className="capitalize">{status}</span>
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleAction(name, "restart")}
                        className="p-2 rounded bg-blue-600 hover:bg-blue-500 transition"
                        title="Restart"
                      >
                        <FaSyncAlt />
                      </button>
                      <button
                        onClick={() => handleAction(name, "stop")}
                        className="p-2 rounded bg-red-600 hover:bg-red-500 transition"
                        title="Stop"
                      >
                        <FaStopCircle />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Port Check */}
      <div>
        <h2 className="text-xl font-medium mb-3">Manual Port Check</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <input
            type="text"
            placeholder="Host or IP"
            value={manualHost}
            onChange={(e) => setManualHost(e.target.value)}
            className="bg-zinc-800 text-white px-4 py-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Port"
            value={manualPort}
            onChange={(e) => setManualPort(e.target.value)}
            min={1}
            max={65535}
            className="bg-zinc-800 text-white px-4 py-2 rounded w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={checkPort}
            disabled={manualChecking || !manualHost || !manualPort}
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition disabled:opacity-50"
          >
            {manualChecking ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSearch />
            )}
            Check
          </button>
        </div>

        {manualStatus && manualStatus !== "checking" && (
          <p
            className={`mt-4 text-sm ${
              manualStatus === "open" ? "text-green-400" : "text-red-400"
            }`}
          >
            {manualStatus === "open"
              ? `Port ${manualPort} on ${manualHost} is open.`
              : `Port ${manualPort} on ${manualHost} is closed.`}
          </p>
        )}
      </div>
    </div>
  );
}
