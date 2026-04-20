"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaWindows,
  FaLinux,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaDownload,
  FaSearch,
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

const INITIAL_GAMES: Game[] = [
  {
    id: "108600",
    name: "Project Zomboid",
    installed: false,
    installing: false,
    progress: 0,
    logs: [],
    expanded: false,
  },
  {
    id: "304930",
    name: "Rust",
    installed: false,
    installing: false,
    progress: 0,
    logs: [],
    expanded: false,
  },
  {
    id: "244850",
    name: "Space Engineers",
    installed: false,
    installing: false,
    progress: 0,
    logs: [],
    expanded: false,
  },
];

const InstallPage: React.FC = () => {
  const [osInfo, setOsInfo] = useState({ name: "Unknown", supported: true });
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [search, setSearch] = useState("");

  const logsRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---------------- FIXED OS DETECTION ----------------
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();

    const isWindows = ua.includes("win");
    const isLinux = ua.includes("linux");
    const isChromeOS =
      ua.includes("cros") || ua.includes("crios") || ua.includes("chromeos");

    if (isWindows) {
      setOsInfo({ name: "Windows", supported: true });
    } else if (isChromeOS) {
      setOsInfo({ name: "Chrome OS", supported: true });
    } else if (isLinux) {
      setOsInfo({ name: "Linux", supported: true });
    } else {
      setOsInfo({ name: "Unknown", supported: false });
    }
  }, []);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    games.forEach((game) => {
      const el = logsRefs.current[game.id];
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [games]);

  // cleanup interval (IMPORTANT for Chrome OS tabs)
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const toggleExpand = (id: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, expanded: !g.expanded } : g))
    );
  };

  // ---------------- INSTALL ----------------
  const startInstall = (id: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setGames((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, installing: true, progress: 0, logs: [] } : g
      )
    );

    let progress = 0;

    intervalRef.current = setInterval(() => {
      progress = Math.min(progress + Math.floor(Math.random() * 10 + 5), 100);

      setGames((prev) =>
        prev.map((g) => {
          if (g.id !== id) return g;

          const newLogs = [
            ...g.logs,
            `Downloading... ${progress}%`,
            progress > 40 && progress < 100 ? "Applying patches..." : "",
            progress > 85 ? "Finalizing installation..." : "",
          ].filter(Boolean);

          if (progress >= 100 && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          return {
            ...g,
            progress,
            logs: newLogs,
            installed: progress >= 100,
            installing: progress < 100,
          };
        })
      );
    }, 700);
  };

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="install-page">
      <header className="page-header">
        <h1>🎮 Modix Game Installer</h1>
        <p>Install games via SteamCMD with real backend integration soon.</p>
      </header>

      {/* OS STATUS */}
      <div
        className={`os-alert ${osInfo.supported ? "supported" : "unsupported"}`}
      >
        {osInfo.name === "Windows" && <FaWindows />}
        {osInfo.name === "Linux" && <FaLinux />}
        {osInfo.name === "Chrome OS" && <FaLinux />}
        {osInfo.name} detected —{" "}
        {osInfo.supported ? "supported" : "limited support"}
      </div>

      {/* SEARCH */}
      <div className="search-bar">
        <FaSearch />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games..."
        />
      </div>

      {/* GRID */}
      <section className="install-grid">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className={`card ${game.expanded ? "expanded" : ""}`}
          >
            <div className="card-header" onClick={() => toggleExpand(game.id)}>
              <h3>{game.name}</h3>

              {game.installed ? (
                <FaCheckCircle className="installed" />
              ) : game.installing ? (
                <FaExclamationCircle className="installing" />
              ) : (
                <FaTimesCircle />
              )}
            </div>

            {!game.installed && !game.installing && (
              <button
                className="install-btn"
                onClick={() => startInstall(game.id)}
              >
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
                <span>{game.progress}%</span>
              </div>
            )}

            {game.expanded && (
              <div
                className="logs"
                ref={(el) => {
                  logsRefs.current[game.id] = el;
                }}
              >
                {game.logs.length ? (
                  game.logs.map((l, i) => <div key={i}>{l}</div>)
                ) : (
                  <p>No logs yet...</p>
                )}
              </div>
            )}
          </div>
        ))}
      </section>

      <div className="coming-soon-banner">
        <FaClock /> Backend installs coming soon (real SteamCMD integration)
      </div>
    </main>
  );
};

export default InstallPage;
