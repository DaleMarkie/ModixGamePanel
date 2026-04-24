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
  installId?: string;
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
  const wsRef = useRef<WebSocket | null>(null);

  // ---------------- OS DETECTION ----------------
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes("win")) {
      setOsInfo({ name: "Windows", supported: true });
    } else if (ua.includes("linux")) {
      setOsInfo({ name: "Linux", supported: true });
    } else if (ua.includes("cros")) {
      setOsInfo({ name: "Chrome OS", supported: true });
    } else {
      setOsInfo({ name: "Unknown", supported: false });
    }
  }, []);

  // ---------------- AUTO SCROLL LOGS ----------------
  useEffect(() => {
    games.forEach((game) => {
      const el = logsRefs.current[game.id];
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [games]);

  // ---------------- TOGGLE EXPAND ----------------
  const toggleExpand = (id: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, expanded: !g.expanded } : g))
    );
  };

  // ---------------- REAL STEAM INSTALL ----------------
  const startInstall = async (game: Game) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // reset state
    setGames((prev) =>
      prev.map((g) =>
        g.id === game.id
          ? {
              ...g,
              installing: true,
              progress: 0,
              logs: [],
              installed: false,
            }
          : g
      )
    );

    // 1. call backend to start install
    const res = await fetch("http://localhost:2010/api/steam/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId: game.id }),
    });

    const data = await res.json();
    const installId = data.installId;

    // 2. open websocket for live logs
    const ws = new WebSocket(
      `ws://localhost:2010/api/steam/ws/install/${installId}`
    );

    wsRef.current = ws;

    ws.onmessage = (event) => {
      const line = event.data;

      setGames((prev) =>
        prev.map((g) => {
          if (g.id !== game.id) return g;

          const logs = [...g.logs, line];

          // simple progress guess (SteamCMD doesn't always give % reliably)
          let progress = g.progress;
          if (line.includes("Downloading")) progress = Math.min(progress + 2, 95);
          if (line.includes("Success") || line.includes("fully installed")) progress = 100;

          return {
            ...g,
            logs,
            progress,
            installed: progress === 100,
            installing: progress < 100,
          };
        })
      );
    };

    ws.onclose = () => {
      setGames((prev) =>
        prev.map((g) =>
          g.id === game.id ? { ...g, installing: false } : g
        )
      );
    };
  };

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="install-page">
      <header className="page-header">
        <h1>🎮 Modix Game Installer</h1>
        <p>Real SteamCMD backend installation system</p>
      </header>

      {/* OS STATUS */}
      <div className={`os-alert ${osInfo.supported ? "supported" : "unsupported"}`}>
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
          <div key={game.id} className={`card ${game.expanded ? "expanded" : ""}`}>
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
              <button className="install-btn" onClick={() => startInstall(game)}>
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
        <FaClock /> SteamCMD backend installation active
      </div>
    </main>
  );
};

export default InstallPage;