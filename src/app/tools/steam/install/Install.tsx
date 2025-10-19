"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  FaExclamationTriangle,
  FaWindows,
  FaLinux,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaDownload,
} from "react-icons/fa";
import "./Install.css";

interface InstallStatus {
  installed: boolean;
  installing: boolean;
  progress: number;
  logs: string[];
}

export default function InstallPage() {
  const [osInfo, setOsInfo] = useState<{ name: string; supported: boolean }>({
    name: "Unknown",
    supported: false,
  });

  const [steamCMD, setSteamCMD] = useState<InstallStatus>({
    installed: false,
    installing: false,
    progress: 0,
    logs: [],
  });

  const [pzServer, setPzServer] = useState<InstallStatus>({
    installed: false,
    installing: false,
    progress: 0,
    logs: [],
  });

  const logsRefSteam = useRef<HTMLDivElement>(null);
  const logsRefPZ = useRef<HTMLDivElement>(null);

  // Detect OS
  useEffect(() => {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes("win")) setOsInfo({ name: "Windows", supported: true });
    else if (platform.includes("linux")) setOsInfo({ name: "Linux", supported: false });
    else setOsInfo({ name: platform, supported: false });
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsRefSteam.current?.scrollTo({ top: logsRefSteam.current.scrollHeight, behavior: "smooth" });
  }, [steamCMD.logs]);

  useEffect(() => {
    logsRefPZ.current?.scrollTo({ top: logsRefPZ.current.scrollHeight, behavior: "smooth" });
  }, [pzServer.logs]);

  // Simulate install
  const startInstall = (target: "steamCMD" | "pzServer") => {
    const setter = target === "steamCMD" ? setSteamCMD : setPzServer;
    setter((prev) => ({ ...prev, installing: true, progress: 0, logs: [] }));

    const interval = setInterval(() => {
      setter((prev) => {
        const nextProgress = Math.min(prev.progress + Math.floor(Math.random() * 10 + 5), 100);
        const nextLogs = [
          ...prev.logs,
          `Downloading... ${nextProgress}%`,
          nextProgress >= 50 && nextProgress < 100 ? "Applying patches..." : "",
          nextProgress >= 90 ? "Finalizing installation..." : "",
        ].filter(Boolean);
        return { ...prev, progress: nextProgress, logs: nextLogs, installed: nextProgress >= 100 };
      });
    }, 800);

    setTimeout(() => clearInterval(interval), 9000);
  };

  const getStatusIcon = (status: InstallStatus) => {
    if (status.installing) return <FaExclamationCircle className="icon-pulse" />;
    if (status.installed) return <FaCheckCircle className="icon-success" />;
    return <FaTimesCircle className="icon-fail" />;
  };

  const renderCard = (title: string, status: InstallStatus, installFn: () => void, logsRef: React.RefObject<HTMLDivElement>) => (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
        {getStatusIcon(status)}
      </div>

      {!status.installed && !status.installing && (
        <button className="install-btn" onClick={installFn}>
          <FaDownload /> Install
        </button>
      )}

      {status.installing && (
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${status.progress}%` }} />
          </div>
          <span className="progress-text">{status.progress}%</span>
        </div>
      )}

      <div className="logs" ref={logsRef}>
        {status.logs.length === 0 ? (
          <p className="log-placeholder">No logs yet...</p>
        ) : (
          status.logs.map((line, idx) => <div key={idx}>{line}</div>)
        )}
      </div>
    </div>
  );

  return (
    <main className="install-page">
      <header className="page-header">
        <h1>🛠️ Modix Installer Panel</h1>
        <p>
          This panel will allow you to install and monitor SteamCMD & Project Zomboid Server.
        </p>
      </header>

      <div className={`os-alert ${osInfo.supported ? "supported" : "unsupported"}`}>
        {osInfo.supported ? (
          <><FaWindows /> {osInfo.name} detected — fully supported.</>
        ) : (
          <><FaLinux /> {osInfo.name} detected — Windows recommended. Linux support is experimental.</>
        )}
      </div>

      <section className="install-grid">
        {renderCard("SteamCMD", steamCMD, () => startInstall("steamCMD"), logsRefSteam)}
        {renderCard("Project Zomboid Server", pzServer, () => startInstall("pzServer"), logsRefPZ)}
      </section>

      <div className="coming-soon-banner">
        <FaClock /> Feature coming soon — full backend integration in next update.
      </div>
    </main>
  );
}
