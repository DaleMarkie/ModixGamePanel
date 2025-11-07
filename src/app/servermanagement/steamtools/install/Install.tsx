"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaWindows,
  FaLinux,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaDownload,
} from "react-icons/fa";
import "./Install.css";

interface Game {
  id: string;
  name: string;
  installed: boolean;
  installing: boolean;
  progress: number;
  logs: string[];
  expanded: boolean;
}

const InstallPage: React.FC = () => {
  const [osInfo, setOsInfo] = useState({ name: "Unknown", supported: false });
  const [game, setGame] = useState<Game>({
    id: "108600",
    name: "Project Zomboid",
    installed: false,
    installing: false,
    progress: 0,
    logs: [],
    expanded: false,
  });

  const logsRef = useRef<HTMLDivElement | null>(null);

  // Detect OS
  useEffect(() => {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes("win"))
      setOsInfo({ name: "Windows", supported: true });
    else if (platform.includes("linux"))
      setOsInfo({ name: "Linux", supported: false });
    else setOsInfo({ name: platform, supported: false });
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsRef.current?.scrollTo({
      top: logsRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [game.logs]);

  const toggleExpand = () => {
    setGame((prev) => ({ ...prev, expanded: !prev.expanded }));
  };

  const startInstall = () => {
    setGame((prev) => ({
      ...prev,
      installing: true,
      progress: 0,
      logs: ["Initializing SteamCMD..."],
    }));

    let progress = 0;
    const interval = setInterval(() => {
      setGame((prev) => {
        progress = Math.min(progress + Math.floor(Math.random() * 12 + 5), 100);
        const logs = [
          ...prev.logs,
          `Downloading Project Zomboid... ${progress}%`,
          progress >= 50 && progress < 100 ? "Applying patches..." : "",
          progress >= 90 ? "Finalizing installation..." : "",
        ].filter(Boolean);

        if (progress >= 100) clearInterval(interval);

        return {
          ...prev,
          progress,
          logs,
          installing: progress < 100,
          installed: progress >= 100,
        };
      });
    }, 600);
  };

  return (
    <main className="install-page">
      <header className="page-header">
        <h1>🎮 Project Zomboid Installer</h1>
        <p>Easily install Project Zomboid via SteamCMD and track progress live.</p>
      </header>

      <div
        className={`os-alert ${osInfo.supported ? "supported" : "unsupported"}`}
      >
        {osInfo.supported ? (
          <>
            <FaWindows /> {osInfo.name} detected — fully supported.
          </>
        ) : (
          <>
            <FaLinux /> {osInfo.name} detected — Windows recommended. Linux is experimental.
          </>
        )}
      </div>

      <section className="install-card">
        <div className="card-header" onClick={toggleExpand}>
          <h2>{game.name}</h2>
          <div className="status-icon">
            {game.installed ? (
              <FaCheckCircle className="installed" />
            ) : game.installing ? (
              <FaExclamationCircle className="installing" />
            ) : (
              <FaTimesCircle className="not-installed" />
            )}
          </div>
        </div>

        {!game.installed && !game.installing && (
          <button className="install-btn" onClick={startInstall}>
            <FaDownload /> Install
          </button>
        )}

        {game.installing && (
          <div className="progress-wrapper">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${game.progress}%` }}
              />
            </div>
            <span className="progress-text">{game.progress}%</span>
          </div>
        )}

        {game.expanded && (
          <div className="logs" ref={logsRef}>
            {game.logs.length ? (
              game.logs.map((line, idx) => <div key={idx}>{line}</div>)
            ) : (
              <p className="log-placeholder">No logs yet...</p>
            )}
          </div>
        )}
      </section>

      <footer className="install-footer">
        Full backend integration coming soon — real SteamCMD installs and logs!
      </footer>
    </main>
  );
};

export default InstallPage;
