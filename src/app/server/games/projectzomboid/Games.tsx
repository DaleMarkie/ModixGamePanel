"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import "./Games.css";

interface Specs {
  cpu: string;
  ram: string;
  storage: string;
  os: string;
}

interface Game {
  name: string;
  icon: string;
  id: string;
  canHost: boolean;
  specs: Specs;
  description?: string;
}

const gamesList: Game[] = [
  {
    name: "Project Zomboid",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg",
    id: "pz",
    canHost: true,
    specs: {
      cpu: "Intel i5 or better",
      ram: "8GB",
      storage: "5GB",
      os: "Windows/Linux 🐧",
    },
  },
  // ... include other games here as before
];

const YourSpecs: Specs = {
  cpu: "Intel i7-9700K",
  ram: "16GB",
  storage: "500GB SSD",
  os: "Ubuntu 22.04",
};

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  const clearSearch = () => setSearchTerm("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="search-bar-wrapper">
      <input
        aria-label="Search games"
        type="text"
        className="search-bar"
        placeholder="🔍 Search games..."
        value={searchTerm}
        onChange={handleChange}
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

interface GameBannerProps {
  game: Game;
  onSelect: (game: Game) => void;
}

const GameBanner: React.FC<GameBannerProps> = ({ game, onSelect }) => {
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
          aria-label={
            isDisabled
              ? `${game.name} unavailable`
              : `Create ${game.name} server`
          }
        >
          {isDisabled ? "🚫 Unavailable" : "➕ Create Server"}
        </button>
      </div>
    </button>
  );
};

interface SpecsBoxProps {
  title: string;
  specs: Specs;
}

const SpecsBox: React.FC<SpecsBoxProps> = ({ title, specs }) => (
  <div
    className="specs-box"
    role="region"
    aria-label={`${title} specifications`}
  >
    <h4>{title}</h4>
    <ul>
      {Object.entries(specs).map(([key, val]) => (
        <li key={key}>
          <strong>{key.toUpperCase()}:</strong>{" "}
          {key === "os" ? <span className="os-tag">{val}</span> : val}
        </li>
      ))}
    </ul>
  </div>
);

interface ModalProps {
  selectedGame: Game;
  onClose: () => void;
  onSave: (data: { serverName: string; description: string }) => void;
}

const Modal: React.FC<ModalProps> = ({ selectedGame, onClose, onSave }) => {
  const [serverName, setServerName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState<{
    serverName?: string;
    description?: string;
  }>({});

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Tab trapping logic can remain the same
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [onClose]);

  const validate = () => {
    const errs: { serverName?: string; description?: string } = {};
    if (!serverName.trim()) errs.serverName = "Server name is required.";
    if (description.length > 250)
      errs.description = "Description max 250 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ serverName: serverName.trim(), description: description.trim() });
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          aria-label="Close modal"
          className="modal-close-btn"
          onClick={onClose}
        >
          ×
        </button>
        <h2 id="modal-title">🚀 Set Up {selectedGame.name} Server</h2>
        {selectedGame.description && (
          <p className="game-description">{selectedGame.description}</p>
        )}
        <div className="specs-container">
          <SpecsBox title="🔧 Required Specs" specs={selectedGame.specs} />
          <SpecsBox title="🖥️ Your Specs" specs={YourSpecs} />
        </div>

        <label htmlFor="serverName">📝 Server Name</label>
        <input
          id="serverName"
          type="text"
          placeholder="e.g. UK PvP Zomboid Server"
          value={serverName}
          onChange={(e) => setServerName(e.target.value)}
          aria-describedby="serverName-error"
          aria-invalid={!!errors.serverName}
        />
        {errors.serverName && (
          <span className="error-msg" id="serverName-error">
            {errors.serverName}
          </span>
        )}

        <label htmlFor="description">📣 Description</label>
        <textarea
          id="description"
          rows={3}
          placeholder="Catchy server description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={250}
          aria-describedby="desc-help desc-error"
          aria-invalid={!!errors.description}
        />
        <div className="desc-footer">
          <small id="desc-help">{description.length}/250 characters</small>
          {errors.description && (
            <span className="error-msg" id="desc-error">
              {errors.description}
            </span>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!serverName.trim()}
          >
            🚀 Host Server
          </button>
          <button className="btn-secondary" onClick={onClose}>
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Games: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSelect = useCallback((game: Game) => {
    setSelectedGame(game);
  }, []);

  const closeModal = useCallback(() => setSelectedGame(null), []);

  const save = useCallback(
    ({
      serverName,
      description,
    }: {
      serverName: string;
      description: string;
    }) => {
      if (!selectedGame) return;
      console.log("HOST GAME:", selectedGame.name);
      console.log("Server Name:", serverName);
      console.log("Description:", description);
      closeModal();
    },
    [selectedGame, closeModal]
  );

  const filteredGames = gamesList.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="games-hosting-page">
      <header className="games-header">
        <h1 className="games-title">🎮 Host a Game Server</h1>
      </header>

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

      {selectedGame && (
        <Modal selectedGame={selectedGame} onClose={closeModal} onSave={save} />
      )}
    </main>
  );
};

export default Games;
