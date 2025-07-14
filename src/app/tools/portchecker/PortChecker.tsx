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
  open: "text-green-600",
  closed: "text-red-600",
  checking: "text-blue-600",
  error: "text-yellow-600",
};

export default function PortChecker() {
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
    <div className="max-w-3xl mx-auto p-8 font-sans space-y-12 bg-white rounded-lg shadow-md">
      <h1 className="text-4xl font-extrabold text-gray-900 border-b pb-4 mb-8">
        Port Checker & Docker Manager
      </h1>

      {/* Docker Containers */}
      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            Docker Containers
          </h2>
          <button
            onClick={loadContainers}
            disabled={loadingContainers}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Refresh containers"
          >
            {loadingContainers ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaSyncAlt className="mr-2" />
            )}
            Refresh
          </button>
        </div>

        {loadingContainers ? (
          <p className="text-gray-600 italic">Loading containers...</p>
        ) : containers.length === 0 ? (
          <p className="text-gray-600 italic">No containers found.</p>
        ) : (
          <table className="w-full border border-gray-300 rounded-md overflow-hidden">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">
                  Image
                </th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">
                  Port
                </th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">
                  Status
                </th>
                <th className="py-3 px-4 text-center text-gray-700 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {containers.map(({ name, image, port, status }) => (
                <tr
                  key={name}
                  className="even:bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {name}
                  </td>
                  <td className="py-3 px-4 text-gray-800">{image}</td>
                  <td className="py-3 px-4 font-mono text-gray-900">{port}</td>
                  <td
                    className={`py-3 px-4 font-semibold ${statusColors[status]} flex items-center`}
                  >
                    {status === "open" ? (
                      <FaCheckCircle className="inline mr-2" />
                    ) : (
                      <FaTimesCircle className="inline mr-2" />
                    )}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </td>
                  <td className="py-3 px-4 text-center space-x-4">
                    <button
                      onClick={() => handleAction(name, "restart")}
                      className="text-blue-600 hover:text-blue-800 focus:outline-none"
                      aria-label={`Restart container ${name}`}
                      title="Restart"
                    >
                      <FaSyncAlt size={20} />
                    </button>
                    <button
                      onClick={() => handleAction(name, "stop")}
                      className="text-red-600 hover:text-red-800 focus:outline-none"
                      aria-label={`Stop container ${name}`}
                      title="Stop"
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
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Manual Port Check
        </h2>
        <div className="flex gap-4 max-w-md">
          <input
            type="text"
            placeholder="Host or IP"
            value={manualHost}
            onChange={(e) => setManualHost(e.target.value)}
            className="flex-grow border border-gray-300 rounded-md px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Port"
            value={manualPort}
            onChange={(e) => setManualPort(e.target.value)}
            min={1}
            max={65535}
            className="w-24 border border-gray-300 rounded-md px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={checkPort}
            disabled={manualChecking || !manualHost || !manualPort}
            className="inline-flex items-center px-5 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {manualChecking ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaSearch className="mr-2" />
            )}
            Check
          </button>
        </div>

        {manualStatus && manualStatus !== "checking" && (
          <p
            className={`mt-5 font-semibold ${
              manualStatus === "open" ? "text-green-600" : "text-red-600"
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
