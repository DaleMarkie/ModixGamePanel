// frontend/src/pages/Games.jsx
import React, { useState, useCallback } from "react";
import "./Games.css";

const gamesList = [
  {
    name: "Project Zomboid",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg",
    id: "projectzomboid", // must match backend route
    canHost: true,
    specs: {
      cpu: "Intel i5 or better",
      ram: "8GB",
      storage: "5GB",
      os: "Windows/Linux 🐧",
    },
  },
  {
    name: "RimWorld",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/294100/header.jpg",
    id: "rimworld", // must match backend route
    canHost: true,
    specs: {
      cpu: "2.6 GHz Quad-Core",
      ram: "8GB",
      storage: "2GB",
      os: "Windows/Linux/macOS",
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

const GameBanner = ({ game, onSelect }) => {
  const isDisabled = !game.canHost;
  return (
    <button
      type="button"
      className={`game-banner ${isDisabled ? "disabled" : ""}`}
      onClick={() => !isDisabled && onSelect(game)}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
    >
      <img src={game.icon} alt={`${game.name} banner`} />
      <div className="banner-overlay">
        <h3>{game.name}</h3>
        <button
          disabled={isDisabled}
          className="host-btn"
          type="button"
          tabIndex={-1}
        >
          {isDisabled ? "🚫 Unavailable" : "➕ Create Server"}
        </button>
      </div>
    </button>
  );
};

const Games = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelect = useCallback((game) => {
    localStorage.setItem("selectedGame", game.id);
    console.log("Selected game:", game.name);
    // optionally redirect to terminal page
    window.location.href = "/terminal";
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
            <GameBanner key={game.id} game={game} onSelect={handleSelect} />
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
