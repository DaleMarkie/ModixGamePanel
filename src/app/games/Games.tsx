// Games.jsx
import React, { useState, useEffect, useCallback } from "react";
import "./Games.css";

const gamesList = [
  {
    name: "Arma 3",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/107410/header.jpg",
    id: "arma3",
    canHost: false,
    specs: {
      cpu: "Intel Core i5-4460 / AMD FX 4300 or better",
      ram: "8GB",
      storage: "45GB",
      os: "Windows 7 SP1 or newer",
    },
  },
  {
    name: "ARK: Survival Evolved",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
    id: "ark",
    canHost: false,
    specs: {
      cpu: "Intel Core i5-2400/AMD FX-8320 or better",
      ram: "8GB",
      storage: "60GB",
      os: "Windows/Linux",
    },
  },
  {
    name: "Counter-Strike: Global Offensive",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
    id: "csgo",
    canHost: false,
    specs: {
      cpu: "Intel Core 2 Duo E6600 or AMD Phenom X3 8750",
      ram: "4GB",
      storage: "15GB",
      os: "Windows/Linux",
    },
  },
  {
    name: "Counter-Strike: Source",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/240/header.jpg",
    id: "css",
    canHost: false,
    specs: {
      cpu: "1.7 GHz Processor",
      ram: "512MB",
      storage: "15GB",
      os: "Windows/Linux/macOS",
    },
  },
  {
    name: "DayZ",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
    id: "dayz",
    canHost: false,
    specs: {
      cpu: "Intel i5 or better",
      ram: "12GB",
      storage: "16GB",
      os: "Windows 10 / Linux",
    },
  },
  {
    name: "Don't Starve Together",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/322330/header.jpg",
    id: "dst",
    canHost: false,
    specs: {
      cpu: "1.7 GHz",
      ram: "2GB",
      storage: "3GB",
      os: "Windows/Linux/macOS",
    },
  },
  {
    name: "Factorio",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/427520/header.jpg",
    id: "factorio",
    canHost: false,
    specs: {
      cpu: "2.0 GHz Dual-Core",
      ram: "4GB",
      storage: "3GB",
      os: "Windows/Linux/macOS",
    },
  },
  {
    name: "Garry's Mod",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/4000/header.jpg",
    id: "gmod",
    canHost: false,
    specs: {
      cpu: "Dual-core 2.0 GHz or better",
      ram: "4GB",
      storage: "15GB",
      os: "Windows/Linux/macOS",
    },
  },
  {
    name: "Killing Floor 2",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/232090/header.jpg",
    id: "kf2",
    canHost: false,
    specs: {
      cpu: "Quad-core 2.4 GHz",
      ram: "6GB",
      storage: "25GB",
      os: "Windows/Linux",
    },
  },
  {
    name: "Left 4 Dead 2",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/550/header.jpg",
    id: "l4d2",
    canHost: false,
    specs: {
      cpu: "3.0 GHz",
      ram: "2GB",
      storage: "13GB",
      os: "Windows/Linux/macOS",
    },
  },
  {
    name: "Minecraft",
    icon: "https://logo.com/image-cdn/images/kts928pd/production/e1d61cc6d5f05c33c1cd0fbf96c51554671750ba-1140x620.png?q=72&fm=webp",
    id: "mc",
    canHost: false,
    specs: {
      cpu: "Intel i3 or better",
      ram: "4GB",
      storage: "2GB",
      os: "Windows/Linux",
    },
  },
  {
    name: "Minecraft Bedrock Edition",
    icon: "https://i.redd.it/iqvo2xlr1wob1.jpg",
    id: "mcbedrock",
    canHost: false,
    specs: {
      cpu: "Intel i3 or better",
      ram: "4GB",
      storage: "2GB",
      os: "Windows",
    },
  },
  {
    name: "Minecraft Java Edition",
    icon: "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png",
    id: "mcjava",
    canHost: false,
    specs: {
      cpu: "Intel i3 or better",
      ram: "4GB",
      storage: "2GB",
      os: "Windows/Linux/macOS",
    },
  },
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
  {
    name: "RedM",
    icon: "https://cdn2.steamgriddb.com/icon/eb06b9db06012a7a4179b8f3cb5384d3.ico", // (Note: placeholder URL, replace if you want a different icon)
    id: "redm",
    canHost: false,
    specs: {
      cpu: "Intel Core i5-6600K or AMD Ryzen 5 2600",
      ram: "8GB",
      storage: "50GB",
      os: "Windows 10 64-bit",
    },
  },
  {
    name: "Rust",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    id: "rust",
    canHost: false,
    specs: {
      cpu: "Intel i7 or Ryzen 7",
      ram: "16GB",
      storage: "20GB",
      os: "Windows 10 64-bit / Linux",
    },
  },
  {
    name: "Satisfactory",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/526870/header.jpg",
    id: "satisfactory",
    canHost: false,
    specs: {
      cpu: "3.0 GHz Quad-Core",
      ram: "8GB",
      storage: "20GB",
      os: "Windows",
    },
  },
  {
    name: "FiveM",
    icon: "https://logos-world.net/wp-content/uploads/2021/03/FiveM-Symbol.png",
    id: "fivem",
    canHost: false,
    specs: {
      cpu: "3.2 GHz Quad-Core",
      ram: "6GB",
      storage: "10GB",
      os: "Windows or Linux",
    },
  },
  {
    name: "Space Engineers",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/244850/header.jpg",
    id: "spaceengineers",
    canHost: false,
    specs: {
      cpu: "3.0 GHz Quad-Core",
      ram: "8GB",
      storage: "20GB",
      os: "Windows",
    },
  },
  {
    name: "Team Fortress 2",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/440/header.jpg",
    id: "tf2",
    canHost: false,
    specs: {
      cpu: "1.7 GHz Processor",
      ram: "512MB",
      storage: "15GB",
      os: "Windows/Linux/macOS",
    },
  },
  {
    name: "Terraria",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg",
    id: "terraria",
    canHost: false,
    specs: {
      cpu: "2.0 GHz",
      ram: "2.5GB",
      storage: "200MB",
      os: "Windows/Linux/macOS",
    },
  },
  {
    name: "Unturned",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/304930/header.jpg",
    id: "unturned",
    canHost: false,
    specs: {
      cpu: "2.4 GHz Dual-Core",
      ram: "4GB",
      storage: "4GB",
      os: "Windows/Linux",
    },
  },
  {
    name: "Valheim",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
    id: "valheim",
    canHost: false,
    specs: {
      cpu: "2.6 GHz Dual Core",
      ram: "8GB",
      storage: "1GB",
      os: "Windows/Linux",
    },
  },
];

const YourSpecs = {
  cpu: "Intel i7-9700K",
  ram: "16GB",
  storage: "500GB SSD",
  os: "Ubuntu 22.04",
};

// -- rest of your code unchanged --

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

const SpecsBox = ({ title, specs }) => (
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

const Modal = ({ selectedGame, onClose, onSave }) => {
  const [serverName, setServerName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusableElements = e.currentTarget.querySelectorAll(
          "input, textarea, button:not([disabled])"
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (!focusableElements.length) return;
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [onClose]);

  const validate = () => {
    const errs = {};
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
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          aria-label="Close modal"
          className="modal-close-btn"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <h2 id="modal-title">🚀 Set Up {selectedGame.name} Server</h2>
        <p className="game-description">{selectedGame.description}</p>
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
          placeholder="Catchy server description to attract players..."
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
            type="button"
          >
            🚀 Host Server
          </button>
          <button className="btn-secondary" onClick={onClose} type="button">
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelect = useCallback((game) => {
    setSelectedGame(game);
  }, []);

  const closeModal = useCallback(() => setSelectedGame(null), []);

  const save = useCallback(
    ({ serverName, description }) => {
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
