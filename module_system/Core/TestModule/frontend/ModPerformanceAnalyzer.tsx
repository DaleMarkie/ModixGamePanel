import React, { useState, useEffect } from "react";

// Types for Mod Performance Data
interface ModPerformanceData {
  modId: string;
  modName: string;
  cpuPercent: number; // CPU usage %
  memoryMB: number; // Memory usage in MB
  diskIOKBps: number; // Disk I/O KB/s
  networkKBps: number; // Network I/O KB/s
  lastUpdated: string; // ISO date string
  impactRating?: "Low" | "Medium" | "High" | "Critical"; // Impact assessment
  notes?: string; // Optional notes about the mod
  dependencies?: string[]; // Mod dependencies
  version?: string; // Mod version string
}

// Simulated Docker containers or game servers
const fakeContainers = [
  { id: "container1", name: "Project Zomboid Server 1" },
  { id: "container2", name: "Project Zomboid Server 2" },
  { id: "container3", name: "Rust Server Alpha" },
];

// Simulated mod performance data keyed by container id
const fakeModDataByContainer: Record<string, ModPerformanceData[]> = {
  container1: [
    {
      modId: "mod1",
      modName: "SuperWeapons",
      cpuPercent: 15.2,
      memoryMB: 200,
      diskIOKBps: 180,
      networkKBps: 75,
      lastUpdated: new Date().toISOString(),
      impactRating: "Medium",
      notes: "Heavy AI computations with weapon balancing logic.",
      dependencies: ["mod-base"],
      version: "2.3.4",
    },
    {
      modId: "mod2",
      modName: "BetterGraphics",
      cpuPercent: 5.8,
      memoryMB: 120,
      diskIOKBps: 60,
      networkKBps: 10,
      lastUpdated: new Date().toISOString(),
      impactRating: "Low",
      notes: "Mostly texture and shader overrides.",
      dependencies: [],
      version: "1.8.1",
    },
  ],
  container2: [
    {
      modId: "mod3",
      modName: "ExtraZombies",
      cpuPercent: 25.5,
      memoryMB: 300,
      diskIOKBps: 220,
      networkKBps: 90,
      lastUpdated: new Date().toISOString(),
      impactRating: "High",
      notes: "Spawning thousands of actors impacts CPU and memory.",
      dependencies: ["mod-ai-enhancer"],
      version: "4.0.0",
    },
    {
      modId: "mod4",
      modName: "NightMode",
      cpuPercent: 3.2,
      memoryMB: 80,
      diskIOKBps: 40,
      networkKBps: 5,
      lastUpdated: new Date().toISOString(),
      impactRating: "Low",
      dependencies: [],
      version: "1.0.5",
    },
  ],
  container3: [
    {
      modId: "mod5",
      modName: "UltraPhysics",
      cpuPercent: 10.1,
      memoryMB: 250,
      diskIOKBps: 100,
      networkKBps: 60,
      lastUpdated: new Date().toISOString(),
      impactRating: "Medium",
      notes: "Advanced particle simulation and physics engine.",
      dependencies: ["physics-core"],
      version: "3.2.7",
    },
  ],
};

// Utility to get color based on impact rating
const impactColor = (rating?: string) => {
  switch (rating) {
    case "Critical":
      return "text-red-700 font-bold";
    case "High":
      return "text-red-500";
    case "Medium":
      return "text-yellow-400";
    case "Low":
      return "text-green-400";
    default:
      return "text-gray-400";
  }
};

// Main component
export default function ModPerformanceAnalyzer() {
  const [modData, setModData] = useState<ModPerformanceData[]>([]);
  const [sortBy, setSortBy] = useState<keyof ModPerformanceData>("cpuPercent");
  const [selectedContainer, setSelectedContainer] = useState(
    fakeContainers[0].id
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Simulate fetching mod data on container change
  useEffect(() => {
    // Simulate API delay
    const timeout = setTimeout(() => {
      setModData(fakeModDataByContainer[selectedContainer] || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [selectedContainer]);

  // Periodic update simulation to mimic live data
  useEffect(() => {
    const interval = setInterval(() => {
      setModData((oldData) =>
        oldData.map((mod) => ({
          ...mod,
          cpuPercent: Math.min(
            100,
            Math.max(0, mod.cpuPercent + (Math.random() - 0.5) * 5)
          ),
          memoryMB: Math.max(
            10,
            mod.memoryMB + Math.round((Math.random() - 0.5) * 10)
          ),
          diskIOKBps: Math.max(
            0,
            mod.diskIOKBps + Math.round((Math.random() - 0.5) * 15)
          ),
          networkKBps: Math.max(
            0,
            mod.networkKBps + Math.round((Math.random() - 0.5) * 10)
          ),
          lastUpdated: new Date().toISOString(),
        }))
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort data
  const filteredData = modData.filter((mod) =>
    mod.modName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    // Sort numerically or alphabetically based on field type
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === "number" && typeof valB === "number")
      return valB - valA;
    if (typeof valA === "string" && typeof valB === "string")
      return valA.localeCompare(valB);
    return 0;
  });

  return (
    <div className="bg-[#0d1117] text-gray-100 min-h-screen p-6 max-w-7xl mx-auto font-sans">
      <h1 className="text-4xl font-bold mb-4">
        Mod Performance & Impact Analyzer
      </h1>

      <div className="flex flex-wrap gap-6 items-center mb-8">
        {/* Server selector */}
        <div>
          <label className="block mb-1 font-semibold">Select Game Server</label>
          <select
            value={selectedContainer}
            onChange={(e) => setSelectedContainer(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-60"
          >
            {fakeContainers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort selector */}
        <div>
          <label className="block mb-1 font-semibold">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as keyof ModPerformanceData)
            }
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-48"
          >
            <option value="cpuPercent">CPU Usage (%)</option>
            <option value="memoryMB">Memory Usage (MB)</option>
            <option value="diskIOKBps">Disk I/O (KB/s)</option>
            <option value="networkKBps">Network I/O (KB/s)</option>
            <option value="modName">Mod Name (A-Z)</option>
            <option value="impactRating">Impact Rating</option>
          </select>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <label className="block mb-1 font-semibold">Search Mods</label>
          <input
            type="text"
            placeholder="Type to filter mods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Mod performance table */}
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700">
        <table className="min-w-full table-fixed">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left w-2/12">Mod Name</th>
              <th className="px-4 py-3 text-right w-1/12">CPU %</th>
              <th className="px-4 py-3 text-right w-1/12">Memory (MB)</th>
              <th className="px-4 py-3 text-right w-1/12">Disk I/O KB/s</th>
              <th className="px-4 py-3 text-right w-1/12">Network KB/s</th>
              <th className="px-4 py-3 text-left w-1/12">Impact</th>
              <th className="px-4 py-3 text-left w-3/12">Notes</th>
              <th className="px-4 py-3 text-left w-2/12">Dependencies</th>
              <th className="px-4 py-3 text-center w-1/12">Version</th>
              <th className="px-4 py-3 text-center w-1/12">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-500">
                  No mods found.
                </td>
              </tr>
            )}
            {sortedData.map((mod) => (
              <tr
                key={mod.modId}
                className="border-t border-gray-700 hover:bg-gray-800 transition-colors duration-200"
              >
                <td className="px-4 py-2 font-semibold">{mod.modName}</td>
                <td className="px-4 py-2 text-right">
                  {mod.cpuPercent.toFixed(1)}
                </td>
                <td className="px-4 py-2 text-right">{mod.memoryMB}</td>
                <td className="px-4 py-2 text-right">{mod.diskIOKBps}</td>
                <td className="px-4 py-2 text-right">{mod.networkKBps}</td>
                <td className={`px-4 py-2 ${impactColor(mod.impactRating)}`}>
                  {mod.impactRating || "Unknown"}
                </td>
                <td className="px-4 py-2 italic text-gray-400">
                  {mod.notes || "-"}
                </td>
                <td className="px-4 py-2 text-gray-300">
                  {mod.dependencies && mod.dependencies.length > 0
                    ? mod.dependencies.join(", ")
                    : "-"}
                </td>
                <td className="px-4 py-2 text-center">{mod.version || "-"}</td>
                <td className="px-4 py-2 text-center text-gray-500 text-sm">
                  {new Date(mod.lastUpdated).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
