import React, { useState, useEffect } from "react";

const fakeTrafficData = [
  { time: "12:00", inbound: 200, outbound: 180 },
  { time: "12:05", inbound: 300, outbound: 280 },
  { time: "12:10", inbound: 250, outbound: 220 },
  { time: "12:15", inbound: 400, outbound: 380 },
  { time: "12:20", inbound: 350, outbound: 320 },
  { time: "12:25", inbound: 450, outbound: 420 },
];

const width = 450; // 25% smaller from 600
const height = 150; // 25% smaller from 200
const padding = 30; // 25% smaller from 40

const maxY = Math.max(
  ...fakeTrafficData.map((d) => Math.max(d.inbound, d.outbound))
);

function scaleX(index: number) {
  return (
    padding + (index * (width - padding * 2)) / (fakeTrafficData.length - 1)
  );
}

function scaleY(value: number) {
  return height - padding - (value * (height - padding * 2)) / maxY;
}

function linePath(data: number[]) {
  return data
    .map((point, i) => `${i === 0 ? "M" : "L"}${scaleX(i)} ${scaleY(point)}`)
    .join(" ");
}

const DdosManager = () => {
  const [attackStatus, setAttackStatus] = useState("No attacks detected");
  const [suspiciousIPs, setSuspiciousIPs] = useState<
    { ip: string; threatLevel: string }[]
  >([]);
  const [dockerContainers, setDockerContainers] = useState<
    { id: string; name: string; status: string; underAttack: boolean }[]
  >([]);
  const [traffic, setTraffic] = useState(fakeTrafficData);

  // Fetch real Docker containers and suspicious IPs from Modix API
  useEffect(() => {
    async function fetchData() {
      try {
        const containersRes = await fetch("/api/docker/containers");
        const containersData = await containersRes.json();
        setDockerContainers(containersData);

        const ipsRes = await fetch("/api/ddos/suspicious-ips");
        const ipsData = await ipsRes.json();
        setSuspiciousIPs(ipsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // fallback to empty or existing data on failure
      }
    }
    fetchData();

    // Optionally refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update attack status based on containers
  useEffect(() => {
    const underAttackCount = dockerContainers.filter(
      (c) => c.underAttack
    ).length;
    if (underAttackCount > 0) {
      setAttackStatus(
        `⚠️ ${underAttackCount} Docker container(s) under attack!`
      );
    } else {
      setAttackStatus("No attacks detected");
    }
  }, [dockerContainers]);

  // Block IP handler - Ideally send this to your backend
  function blockIp(ip: string) {
    // Example: POST to backend to block IP
    fetch("/api/ddos/block-ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    }).then(() => {
      // Optimistic UI update
      setSuspiciousIPs((prev) => prev.filter((item) => item.ip !== ip));
      alert(`Blocked IP: ${ip}`);
    });
  }

  // Toggle attack status for a container (simulate mitigation) - could POST to API
  function toggleMitigation(id: string) {
    setDockerContainers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, underAttack: !c.underAttack } : c))
    );
  }

  return (
    <div className="ddos-page p-6 bg-gray-900 text-white min-h-screen max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-extrabold mb-6 tracking-wide">
        DDoS Protection Control Hub
      </h1>
      <p className="mb-6 text-gray-400 max-w-xl leading-relaxed">
        Welcome to the DDoS Protection Control Hub — your centralized dashboard
        for proactive defense and real-time monitoring of distributed
        denial-of-service attacks targeting your Dockerized game servers. Here,
        you can visualize network traffic patterns, identify Docker containers
        currently under threat, review suspicious IP addresses attempting to
        breach your servers, and execute swift mitigation actions such as
        blocking malicious IPs or toggling attack states on individual
        containers. Stay ahead of threats and maintain optimal server
        performance with this comprehensive security control center.
      </p>

      <section className="attack-status mb-8">
        <h2 className="text-xl font-semibold mb-2">Current Status</h2>
        <p className="text-lg text-gray-300">{attackStatus}</p>
      </section>

      <section className="traffic-chart mb-8 bg-gray-800 rounded-lg p-4 shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Network Traffic Overview</h2>
        <svg
          width={width}
          height={height}
          className="mx-auto"
          style={{ backgroundColor: "#111" }}
        >
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
              x={scaleX(i)}
              y={height - 10}
              fill="#888"
              fontSize={10}
              textAnchor="middle"
              className="select-none"
            >
              {d.time}
            </text>
          ))}

          {[0, 0.25, 0.5, 0.75, 1].map((v) => {
            const val = Math.round(maxY * (1 - v));
            return (
              <text
                key={v}
                x={5}
                y={padding + v * (height - padding * 2)}
                fill="#888"
                fontSize={10}
                alignmentBaseline="middle"
                className="select-none"
              >
                {val}
              </text>
            );
          })}

          <path
            d={linePath(traffic.map((d) => d.inbound))}
            fill="none"
            stroke="#00ff99"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path
            d={linePath(traffic.map((d) => d.outbound))}
            fill="none"
            stroke="#ff4466"
            strokeWidth={2}
            strokeLinecap="round"
          />

          <circle
            cx={width - padding - 90}
            cy={padding - 12}
            r={5}
            fill="#00ff99"
          />
          <text
            x={width - padding - 80}
            y={padding - 10}
            fill="#00ff99"
            fontWeight="bold"
            fontSize={12}
            className="select-none"
          >
            Inbound
          </text>
          <circle
            cx={width - padding - 40}
            cy={padding - 12}
            r={5}
            fill="#ff4466"
          />
          <text
            x={width - padding - 30}
            y={padding - 10}
            fill="#ff4466"
            fontWeight="bold"
            fontSize={12}
            className="select-none"
          >
            Outbound
          </text>
        </svg>
      </section>

      <section className="docker-status mb-8">
        <h2 className="text-xl font-semibold mb-3">Docker Containers</h2>
        <ul>
          {dockerContainers.length === 0 && (
            <li className="text-gray-400 italic">
              No Docker containers detected.
            </li>
          )}
          {dockerContainers.map((dc) => (
            <li
              key={dc.id}
              className={`flex justify-between items-center p-3 mb-3 rounded-lg shadow-md transition-colors duration-300 ${
                dc.underAttack
                  ? "bg-red-700 animate-pulse shadow-red-800"
                  : "bg-green-700 shadow-green-800"
              }`}
            >
              <div>
                <strong className="text-lg">{dc.name}</strong>{" "}
                <span className="text-sm italic text-gray-300">
                  {dc.status}
                </span>
                {dc.underAttack && (
                  <span className="ml-2 inline-block px-2 py-0.5 text-xs font-bold uppercase rounded bg-red-900 text-red-300">
                    Under Attack
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleMitigation(dc.id)}
                className={`px-3 py-1 rounded font-semibold transition-colors duration-300 text-sm ${
                  dc.underAttack
                    ? "bg-green-600 hover:bg-green-800"
                    : "bg-yellow-600 hover:bg-yellow-800"
                }`}
                aria-label={
                  dc.underAttack ? "Mitigate Attack" : "Simulate Attack"
                }
              >
                {dc.underAttack ? "Mitigate" : "Simulate Attack"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="suspicious-ips mb-6">
        <h2 className="text-xl font-semibold mb-3">Suspicious IPs</h2>
        {suspiciousIPs.length === 0 ? (
          <p className="text-gray-400 italic">No suspicious IPs detected.</p>
        ) : (
          <ul className="space-y-2 max-h-56 overflow-y-auto">
            {suspiciousIPs.map(({ ip, threatLevel }) => (
              <li
                key={ip}
                className="flex justify-between items-center p-2 bg-gray-800 rounded shadow"
              >
                <span className="font-mono text-sm">{ip}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    threatLevel === "high"
                      ? "bg-red-600 text-red-200"
                      : threatLevel === "medium"
                      ? "bg-yellow-600 text-yellow-200"
                      : "bg-green-600 text-green-200"
                  }`}
                >
                  {threatLevel.toUpperCase()}
                </span>
                <button
                  onClick={() => blockIp(ip)}
                  className="ml-3 text-xs px-2 py-1 bg-red-700 hover:bg-red-800 rounded font-semibold"
                  aria-label={`Block IP ${ip}`}
                >
                  Block
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default DdosManager;
