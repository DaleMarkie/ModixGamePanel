"use client";

import React, { useState, useCallback, useEffect } from "react";
import "./Games.css";

type GameSpec = { label: string; ok: boolean };
type Game = {
  name: string;
  icon: string;
  id: string;
  os: "linux" | "windows";
  canHost: boolean;
  comingSoon: boolean;
  specs: { cpu: GameSpec; ram: GameSpec; storage: GameSpec };
};

const gamesList: Game[] = [
  {
    name: "Project Zomboid",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg",
    id: "pz-linux",
    os: "linux",
    canHost: true,
    comingSoon: false,
    specs: {
      cpu: { label: "CPU: 4+ cores", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 5 GB", ok: true },
    },
  },
  {
    name: "Project Zomboid",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg",
    id: "pz-windows",
    os: "windows",
    canHost: true,
    comingSoon: false,
    specs: {
      cpu: { label: "CPU: 4+ cores", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 5 GB", ok: true },
    },
  },
];

const formatDuration = (ms: number) => {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  return `${h ? h + "h " : ""}${m ? m + "m " : ""}${s}s`;
};

const GameBanner: React.FC<{
  game: Game;
  onSelect: (game: Game) => void;
  onStop: (game: Game) => void;
  activeGame: string | null;
  status: string;
  loading: boolean;
  uptime: number;
}> = ({ game, onSelect, onStop, activeGame, status, loading, uptime }) => {
  const isActive = activeGame === game.id;
  const anotherRunning = activeGame && !isActive;

  return (
    <div
      className={`game-banner ${anotherRunning ? "disabled" : ""} ${
        isActive ? "active" : ""
      }`}
    >
      <img src={game.icon} alt={game.name} />
      <div className="banner-overlay">
        <h3>
          {game.name} ({game.os.toUpperCase()})
          {isActive && (
            <span className={`status-badge ${status}`}>
              {status === "running"
                ? `🟢 Running (${formatDuration(uptime)})`
                : "🔴 Stopped"}
            </span>
          )}
        </h3>

        <div className="requirements always-visible">
          <h4>Server Requirements</h4>
          {Object.values(game.specs).map((spec, i) => (
            <span key={i} className={`tag ${spec.ok ? "ok" : "fail"}`}>
              {spec.label} {spec.ok ? "✅" : "❌"}
            </span>
          ))}
        </div>

        {!isActive ? (
          <button
            disabled={loading || anotherRunning || game.comingSoon}
            className="host-btn start"
            onClick={() => onSelect(game)}
          >
            {loading ? "⏳ Starting..." : "➕ Start Server"}
          </button>
        ) : (
          <div className="server-actions">
            <button
              disabled={loading}
              className="stop-btn stop"
              onClick={() => onStop(game)}
            >
              {loading ? "⏳ Stopping..." : "🛑 Stop Server"}
            </button>
            {status === "running" && (
              <button
                className="terminal-btn"
                onClick={() => (window.location.href = "/terminal")}
              >
                🖥️ View Terminal
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Games: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [status, setStatus] = useState("stopped");
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const storedGame = localStorage.getItem("selectedGame");
    const storedTime = localStorage.getItem("serverStartTime");
    if (storedGame) setActiveGame(storedGame);
    if (storedTime) setStartTime(Number(storedTime));
  }, []);

  useEffect(() => {
    if (status === "running" && startTime) {
      const interval = setInterval(
        () => setUptime(Date.now() - startTime),
        1000
      );
      return () => clearInterval(interval);
    }
  }, [status, startTime]);

  const startServer = useCallback(
    async (game: Game) => {
      if (activeGame && activeGame !== game.id) return;
      setLoading(true);
      try {
        await fetch("/api/start-server", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id, os: game.os }),
        });
        setStatus("running");
        const now = Date.now();
        setStartTime(now);
        localStorage.setItem("selectedGame", game.id);
        localStorage.setItem("serverStartTime", now.toString());
        setActiveGame(game.id);
      } catch (err) {
        console.error(err);
        alert("Failed to start server. Check backend logs.");
      } finally {
        setLoading(false);
      }
    },
    [activeGame]
  );

  const stopServer = useCallback(async (game: Game) => {
    setLoading(true);
    try {
      await fetch("/api/stop-server", { method: "POST" });
      setStatus("stopped");
      setActiveGame(null);
      setStartTime(null);
      localStorage.removeItem("selectedGame");
      localStorage.removeItem("serverStartTime");
    } catch (err) {
      console.error(err);
      alert("Failed to stop server. Check backend logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className="games-hosting-page">
      <header className="page-header fancy">
        <h1 className="page-title">🚀 My Servers</h1>
        <p className="page-description">
          Start/stop Project Zomboid servers. Only one server runs at a time.
        </p>
      </header>

      <section className="category">
        <h2>Project Zomboid</h2>
        <div className="game-banner-list">
          {gamesList.map((game) => (
            <GameBanner
              key={game.id}
              game={game}
              onSelect={startServer}
              onStop={stopServer}
              activeGame={activeGame}
              status={status}
              loading={loading}
              uptime={uptime}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Games;
