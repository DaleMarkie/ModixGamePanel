import React, { useState, useCallback, useEffect } from "react";
import "./Games.css";

const gamesList = [
  {
    name: "Project Zomboid",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg",
    id: "pz",
    canHost: true,
    specs: {
      cpu: { label: "CPU: 4+ cores", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 5 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "RimWorld",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/294100/header.jpg",
    id: "rimworld",
    canHost: true,
    specs: {
      cpu: { label: "CPU: 2.6 GHz Quad-Core", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 2 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
];

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const clearSearch = () => setSearchTerm("");
  return (
    <div className="search-bar-wrapper">
      <input
        aria-label="Search games"
        type="text"
        className="search-bar"
        placeholder="🔍 Search games..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          aria-label="Clear search"
          onClick={clearSearch}
          className="clear-search"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};

const GameBanner = ({
  game,
  onSelect,
  onStop,
  activeGame,
  status,
  loading,
}) => {
  const isActive = activeGame === game.id;
  const anotherRunning = activeGame && !isActive;

  return (
    <div
      className={`game-banner ${
        anotherRunning ? "disabled" : ""
      } ${isActive ? "active" : ""}`}
    >
      <img src={game.icon} alt={`${game.name} banner`} />

      <div className="banner-overlay">
        <h3>
          {game.name}
          {status === "running" && isActive && (
            <span className="status-badge running">🟢 Running</span>
          )}
          {status === "stopped" && isActive && (
            <span className="status-badge stopped">🔴 Stopped</span>
          )}
        </h3>

        {/* 🔥 Overlay badge when live */}
        {isActive && status === "running" && (
          <div className="running-overlay">
            🔥 {game.name} Server LIVE
          </div>
        )}

        <details className="requirements">
          <summary>Server Requirements</summary>
          <div className="tags">
            {Object.entries(game.specs).map(([key, spec]) => (
              <span key={key} className={`tag ${spec.ok ? "ok" : "fail"}`}>
                {spec.label} {spec.ok ? "✅" : "❌"}
              </span>
            ))}
          </div>
        </details>

        {!isActive ? (
          <button
            disabled={loading || anotherRunning}
            className="host-btn start"
            type="button"
            onClick={() => !anotherRunning && onSelect(game)}
          >
            {anotherRunning
              ? "🚫 Unavailable (Another server running)"
              : loading
              ? "⏳ Starting..."
              : "➕ Start Server"}
          </button>
        ) : (
          <button
            disabled={loading}
            className="stop-btn stop"
            type="button"
            onClick={() => onStop(game)}
          >
            {loading ? "⏳ Stopping..." : "🛑 Stop Server"}
          </button>
        )}
      </div>
    </div>
  );
};

const Games = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGame, setActiveGame] = useState(null);
  const [status, setStatus] = useState("stopped");
  const [loading, setLoading] = useState(false);

  // Poll server status
  useEffect(() => {
    const interval = setInterval(async () => {
      if (activeGame) {
        try {
          const res = await fetch(`/api/server-status?game=${activeGame}`);
          const data = await res.json();
          setStatus(data.status); // expects {status: "running"|"stopped"}
        } catch (err) {
          console.error("Status check failed:", err);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeGame]);

  // Load previously selected game
  useEffect(() => {
    const stored = localStorage.getItem("selectedGame");
    if (stored) setActiveGame(stored);
  }, []);

  const stopServer = async (gameId) => {
    try {
      setLoading(true);
      await fetch(`/api/stop-server?game=${gameId}`, { method: "POST" });
      setStatus("stopped");
      console.log(`[INFO] Backend stopped server: ${gameId}`);
    } catch (err) {
      console.error(`[ERROR] Failed to stop ${gameId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const startServer = async (gameId) => {
    try {
      setLoading(true);
      await fetch(`/api/start-server?game=${gameId}`, { method: "POST" });
      setStatus("running");
      console.log(`[INFO] Backend started server: ${gameId}`);
    } catch (err) {
      console.error(`[ERROR] Failed to start ${gameId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback(
    async (game) => {
      // if another server already running, block it
      if (activeGame && activeGame !== game.id) {
        console.warn("Another server is running, cannot start a new one.");
        return;
      }

      await startServer(game.id);

      localStorage.setItem("selectedGame", game.id);
      setActiveGame(game.id);

      // Let Terminal know
      window.dispatchEvent(new Event("storage"));

      console.log("Selected game:", game.name);
      window.location.href = "/terminal";
    },
    [activeGame]
  );

  const handleStop = useCallback(async (game) => {
    await stopServer(game.id);
    localStorage.removeItem("selectedGame");
    setActiveGame(null);
    console.log("Stopped server for:", game.name);
  }, []);

  const filteredGames = gamesList.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="games-hosting-page">
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <section
        className="game-banner-list"
        aria-label="Available games to host"
      >
        {filteredGames.length ? (
          filteredGames.map((game) => (
            <GameBanner
              key={game.id}
              game={game}
              onSelect={handleSelect}
              onStop={handleStop}
              activeGame={activeGame}
              status={status}
              loading={loading}
            />
          ))
        ) : (
          <p className="no-games-msg" role="alert">
            ❌ No games match your search.
          </p>
        )}
      </section>
    </main>
  );
};

export default Games;
