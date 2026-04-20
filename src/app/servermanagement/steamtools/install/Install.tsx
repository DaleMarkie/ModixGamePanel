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
  const [osInfo, setOsInfo] = useState({ name: "Unknown", supported: false });
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [search, setSearch] = useState("");

  const logsRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ---------------- DETECT OS ----------------
  useEffect(() => {
    const platform = navigator.platform.toLowerCase();

    if (platform.includes("win")) {
      setOsInfo({ name: "Windows", supported: true });
    } else if (platform.includes("linux")) {
      setOsInfo({ name: "Linux", supported: true });
    } else {
      setOsInfo({ name: platform, supported: false });
    }
  }, []);

  // ---------------- AUTO SCROLL LOGS ----------------
  useEffect(() => {
    games.forEach((game) => {
      const el = logsRefs.current[game.id];
      if (el) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }, [games]);

  // ---------------- TOGGLE EXPAND ----------------
  const toggleExpand = (id: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, expanded: !g.expanded } : g))
    );
  };

  // ---------------- INSTALL SIMULATION ----------------
  const startInstall = (id: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setGames((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, installing: true, progress: 0, logs: [] } : g
      )
    );

    let progress = 0;

    intervalRef.current = setInterval(() => {
      progress = Math.min(progress + Math.floor(Math.random() * 12 + 5), 100);

      setGames((prev) =>
        prev.map((g) => {
          if (g.id !== id) return g;

          const newLogs = [
            ...g.logs,
            `Downloading... ${progress}%`,
            progress >= 50 && progress < 100 ? "Applying patches..." : "",
            progress >= 90 ? "Finalizing installation..." : "",
          ].filter(Boolean);

          if (progress >= 100 && intervalRef.current) {
            clearInterval(intervalRef.current);
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
    }, 600);
  };

  // ---------------- FILTER ----------------
  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="install-page">
      <header className="page-header">
        <h1>🎮 Modix Game Installer</h1>
        <p>
          Manage SteamCMD & install popular games like Project Zomboid, Rust,
          and Space Engineers.
        </p>
      </header>

      {/* OS STATUS */}
      <div
        className={`os-alert ${osInfo.supported ? "supported" : "unsupported"}`}
      >
        {osInfo.supported ? (
          <>
            <FaWindows /> {osInfo.name} detected — supported.
          </>
        ) : (
          <>
            <FaLinux /> {osInfo.name} detected — limited support.
          </>
        )}
      </div>

      {/* SEARCH */}
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
                <span className="progress-text">{game.progress}%</span>
              </div>
            )}

            {game.expanded && (
              <div
                className="logs"
                ref={(el) => {
                  logsRefs.current[game.id] = el;
                }}
              >
                {game.logs.length === 0 ? (
                  <p className="log-placeholder">No logs yet...</p>
                ) : (
                  game.logs.map((line, idx) => <div key={idx}>{line}</div>)
                )}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <div className="coming-soon-banner">
        <FaClock /> Full backend integration coming soon — real installs and
        logs!
      </div>
    </main>
  );
};

export default InstallPage;
