import React, { useState, useCallback, useEffect } from "react";
import "./Games.css";

const gamesList = [
  {
    name: "Project Zomboid",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg",
    id: "projectzomboid",
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

const GameBanner = ({ game, onSelect, activeGame, onStop }) => {
  const isDisabled = !game.canHost;
  const isActive = activeGame === game.id;

  return (
    <div
      className={`game-banner ${isDisabled ? "disabled" : ""} ${
        isActive ? "active" : ""
      }`}
    >
      <img src={game.icon} alt={`${game.name} banner`} />
      <div className="banner-overlay">
        <h3>
          {game.name}{" "}
          {isActive && <span className="status-badge">🟢 Running</span>}
        </h3>

        <div className="requirements">
          <h4>
            Server Requirements <span className="linux-tag">Linux 🐧</span>
          </h4>
          <div className="tags">
            {Object.entries(game.specs).map(([key, spec]) => (
              <span
                key={key}
                className={`tag ${spec.ok ? "ok" : "fail"}`}
              >
                {spec.label} {spec.ok ? "✅" : "❌"}
              </span>
            ))}
          </div>
        </div>

        {!isActive ? (
          <button
            disabled={isDisabled}
            className="host-btn"
            type="button"
            onClick={() => !isDisabled && onSelect(game)}
          >
            {isDisabled ? "🚫 Unavailable" : "➕ Create Server"}
          </button>
        ) : (
          <button
            className="stop-btn"
            type="button"
            onClick={() => onStop(game)}
          >
            🛑 Stop Server
          </button>
        )}
      </div>
    </div>
  );
};

const Games = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGame, setActiveGame] = useState(null);

  // Load active game from localStorage (or API later)
  useEffect(() => {
    const stored = localStorage.getItem("activeGame");
    if (stored) setActiveGame(stored);
  }, []);

  const handleSelect = useCallback((game) => {
    localStorage.setItem("activeGame", game.id);
    setActiveGame(game.id);
    console.log("Selected game:", game.name);
    window.location.href = "/terminal";
  }, []);

  const handleStop = useCallback((game) => {
    localStorage.removeItem("activeGame");
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
