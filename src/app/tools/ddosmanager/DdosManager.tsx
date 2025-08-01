import React, { useState, useEffect } from "react";

const width = 450;
const height = 150;
const padding = 30;

function scaleX(index: number, total: number) {
  return padding + (index * (width - padding * 2)) / (total - 1);
}

function scaleY(value: number, maxY: number) {
  return height - padding - (value * (height - padding * 2)) / maxY;
}

function linePath(data: number[], maxY: number, total: number) {
  return data
    .map(
      (point, i) =>
        `${i === 0 ? "M" : "L"}${scaleX(i, total)} ${scaleY(point, maxY)}`
    )
    .join(" ");
}

const DdosManager = () => {
  const [attackStatus, setAttackStatus] = useState("Loading...");
  const [suspiciousIPs, setSuspiciousIPs] = useState<
    { ip: string; threat_level: string }[]
  >([]);
  const [dockerContainers, setDockerContainers] = useState<
    { id: string; name: string; status: string; under_attack: boolean }[]
  >([]);
  const [traffic, setTraffic] = useState<
    { time: string; inbound: number; outbound: number }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res1 = await fetch("/api/performance/containers");
        const containersData = await res1.json();
        setDockerContainers(
          Array.isArray(containersData) ? containersData : []
        );

        const res2 = await fetch("/api/performance/suspicious-ips");
        const ipData = await res2.json();
        setSuspiciousIPs(Array.isArray(ipData) ? ipData : []);

        const res3 = await fetch("/api/performance/traffic");
        const trafficData = await res3.json();
        setTraffic(Array.isArray(trafficData) ? trafficData : []);
      } catch (error) {
        console.error("Failed to fetch performance data:", error);
        setAttackStatus("❌ Failed to load performance data.");
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const underAttackCount = dockerContainers.filter(
      (c) => c.under_attack
    ).length;
    if (underAttackCount > 0) {
      setAttackStatus(`⚠️ ${underAttackCount} container(s) under attack`);
    } else {
      setAttackStatus("✅ No attacks detected");
    }
  }, [dockerContainers]);

  function blockIp(ip: string) {
    fetch("/api/performance/block-ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    }).then(() => {
      setSuspiciousIPs((prev) => prev.filter((item) => item.ip !== ip));
    });
  }

  const maxY = Math.max(...traffic.flatMap((d) => [d.inbound, d.outbound]), 1);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen font-sans max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">DDoS Protection Control Hub</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Status</h2>
        <p className="text-lg text-gray-300">{attackStatus}</p>
      </section>

      <section className="mb-8 bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Traffic Overview</h2>
        <svg width={width} height={height} className="mx-auto bg-black rounded">
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <line
              key={v}
              x1={padding}
              y1={padding + v * (height - padding * 2)}
              x2={width - padding}
              y2={padding + v * (height - padding * 2)}
              stroke="#333"
              strokeDasharray="4 4"
            />
          ))}

          {traffic.map((d, i) => (
            <text
              key={i}
              x={scaleX(i, traffic.length)}
              y={height - 5}
              fill="#888"
              fontSize={10}
              textAnchor="middle"
            >
              {d.time}
            </text>
          ))}

          <path
            d={linePath(
              traffic.map((d) => d.inbound),
              maxY,
              traffic.length
            )}
            fill="none"
            stroke="#00ff99"
            strokeWidth={2}
          />
          <path
            d={linePath(
              traffic.map((d) => d.outbound),
              maxY,
              traffic.length
            )}
            fill="none"
            stroke="#ff4466"
            strokeWidth={2}
          />
        </svg>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Docker Containers</h2>
        <ul className="space-y-2">
          {dockerContainers.map((c) => (
            <li
              key={c.id}
              className={`flex justify-between items-center p-3 rounded-lg shadow ${
                c.under_attack ? "bg-red-700" : "bg-green-700"
              }`}
            >
              <div>
                <strong>{c.name}</strong>{" "}
                <span className="text-sm italic text-gray-200">{c.status}</span>
                {c.under_attack && (
                  <span className="ml-2 text-xs bg-red-900 px-2 py-0.5 rounded">
                    Under Attack
                  </span>
                )}
              </div>
              <button
                onClick={() =>
                  setDockerContainers((prev) =>
                    prev.map((x) =>
                      x.id === c.id
                        ? { ...x, under_attack: !x.under_attack }
                        : x
                    )
                  )
                }
                className={`px-3 py-1 text-sm rounded font-semibold ${
                  c.under_attack
                    ? "bg-green-600 hover:bg-green-800"
                    : "bg-yellow-600 hover:bg-yellow-800"
                }`}
              >
                {c.under_attack ? "Mitigate" : "Simulate"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Suspicious IPs</h2>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {suspiciousIPs.length === 0 && (
            <li className="text-gray-400 italic">
              No suspicious IPs detected.
            </li>
          )}
          {suspiciousIPs.map(({ ip, threat_level }) => (
            <li
              key={ip}
              className="flex justify-between items-center p-3 bg-gray-800 rounded"
            >
              <span className="font-mono text-sm">{ip}</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  threat_level === "high"
                    ? "bg-red-600 text-red-100"
                    : threat_level === "medium"
                    ? "bg-yellow-600 text-yellow-100"
                    : "bg-green-600 text-green-100"
                }`}
              >
                {threat_level.toUpperCase()}
              </span>
              <button
                onClick={() => blockIp(ip)}
                className="ml-4 text-xs px-2 py-1 bg-red-700 hover:bg-red-800 rounded"
              >
                Block
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default DdosManager;
