"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface TrafficData {
  status: string;
  traffic: number[];
  ips: string[];
}

export default function DdosManager() {
  const [data, setData] = useState<TrafficData>({
    status: "stopped",
    traffic: [],
    ips: []
  });

  // Fetch traffic data
  const fetchTraffic = async () => {
    try {
      const res = await axios.get<TrafficData>("/api/ddos/traffic");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Poll every 2 seconds
  useEffect(() => {
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-zinc-900 text-white rounded-lg shadow-lg w-full max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">DDoS Traffic Monitor</h2>

      <div className="mb-4">
        <span
          className={`px-2 py-1 rounded ${
            data.status === "running" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {data.status?.toUpperCase() || "STOPPED"}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Traffic (last 10 intervals)</h3>
        <div className="flex space-x-2 overflow-x-auto">
          {data.traffic.map((val, idx) => (
            <div
              key={idx}
              className="h-16 w-6 bg-blue-500 flex items-end justify-center"
              style={{ height: `${val / 10}px` }}
              title={`Traffic: ${val}`}
            ></div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Attacking IPs</h3>
        {data.ips.length === 0 ? (
          <p className="text-zinc-400">No attacks detected</p>
        ) : (
          <ul className="max-h-48 overflow-y-auto">
            {data.ips.map((ip, idx) => (
              <li key={idx} className="text-red-400">
                {ip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
