"use client";

import React, { useState, useEffect } from "react";
import "./Performance.css";

type ServerData = {
  cpu: {
    model: string;
    cores: string;
    clockSpeed: string;
    architecture: string;
    flags: string;
  };
  memory: { total: string; used: string; swapTotal: string; swapUsed: string };
  disk: { total: string; root: string; data: string };
  network: {
    primaryIP: string;
    publicIP: string;
    interface: string;
    rxTx: string;
  };
  os: {
    os: string;
    platform: string;
    kernel: string;
    uptime: string;
    hostname: string;
  };
  modix: {
    version: string;
    gitCommit: string;
    buildTime: string;
    environment: string;
    apiPort: string;
    frontendPort: string;
  };
  gpu: { model: string; driver: string; vram: string; cuda: string };
  extra: {
    timezone: string;
    locale: string;
    shell: string;
    python: string;
    nodejs: string;
  };
};

const defaultData: ServerData = {
  cpu: {
    model: "Loading...",
    cores: "Loading...",
    clockSpeed: "Loading...",
    architecture: "Loading...",
    flags: "Loading...",
  },
  memory: {
    total: "Loading...",
    used: "Loading...",
    swapTotal: "Loading...",
    swapUsed: "Loading...",
  },
  disk: { total: "Loading...", root: "Loading...", data: "Loading..." },
  network: {
    primaryIP: "Loading...",
    publicIP: "Loading...",
    interface: "Loading...",
    rxTx: "Loading...",
  },
  os: {
    os: "Loading...",
    platform: "Loading...",
    kernel: "Loading...",
    uptime: "Loading...",
    hostname: "Loading...",
  },
  modix: {
    version: "Loading...",
    gitCommit: "Loading...",
    buildTime: "Loading...",
    environment: "Loading...",
    apiPort: "Loading...",
    frontendPort: "Loading...",
  },
  gpu: {
    model: "Loading...",
    driver: "Loading...",
    vram: "Loading...",
    cuda: "Loading...",
  },
  extra: {
    timezone: "Loading...",
    locale: "Loading...",
    shell: "Loading...",
    python: "Loading...",
    nodejs: "Loading...",
  },
};

// FIX: safer + cleaner tooltip behavior
const InfoItem = ({
  label,
  value,
  tooltip,
  category,
}: {
  label: string;
  value: string;
  tooltip: string;
  category: string;
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`info-item ${category}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="label">{label || "Unknown"}</span>

      <span className="value">{value ?? "—"}</span>

      {hover && <div className="tooltip">{tooltip || "No details"}</div>}
    </div>
  );
};

const Card = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="card">
    <h2>{title}</h2>
    {children}
  </section>
);

// FIX: safe label formatting (prevents weird empty labels)
const formatLabel = (key: string) =>
  key
    ? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
    : "Unknown";

const Performance = () => {
  const [data, setData] = useState<ServerData>(defaultData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:2010/api/server-info")
      .then(async (res) => {
        if (!res.ok) throw new Error(`API error: ${res.statusText}`);
        const json = await res.json();
        setData(json);
        setError(null);
      })
      .catch((e) => {
        setError("Failed to load server info.");
        console.error(e);
      });
  }, []);

  const sections = [
    { title: "🧠 CPU", key: "cpu", items: data.cpu },
    { title: "💾 Memory", key: "memory", items: data.memory },
    { title: "🗃️ Disk", key: "disk", items: data.disk },
    { title: "🌐 Network", key: "network", items: data.network },
    { title: "⚙️ OS", key: "os", items: data.os },
    { title: "🚀 Modix", key: "modix", items: data.modix },
    { title: "🎮 GPU", key: "gpu", items: data.gpu },
    { title: "📦 Extra Info", key: "extra", items: data.extra },
  ];

  return (
    <div className="main">
      <header className="header">🖥️ Server Performance</header>

      <p className="description">
        Full overview of your system running Modix. Compact and readable.
      </p>

      {error && <div className="error-card">{error}</div>}

      <div className="grid-container">
        {sections.map((section) => (
          <Card key={section.title} title={section.title}>
            {Object.entries(section.items || {}).map(([key, val]) => (
              <InfoItem
                key={key}
                label={formatLabel(key)}
                value={String(val)}
                tooltip={`Details for ${key}`}
                category={section.key}
              />
            ))}
          </Card>
        ))}
      </div>

      <footer className="footer">&copy; 2025 Modix Game Panel</footer>
    </div>
  );
};

export default Performance;
