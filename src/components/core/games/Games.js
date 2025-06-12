import React, { useState } from "react";
import "./Games.css";

const gamesList = [
  {
    name: "Project Zomboid",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg",
    id: "pz",
    specs: {
      cpu: "Intel i5 or better",
      ram: "8GB",
      storage: "5GB",
      os: "Windows/Linux 🐧",
    },
  },
  {
    name: "Minecraft",
    icon: "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png",
    id: "mc",
    specs: {
      cpu: "Intel i3 or better",
      ram: "4GB",
      storage: "2GB",
      os: "Windows/Linux",
    },
  },
  {
    name: "Rust",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    id: "rust",
    specs: {
      cpu: "Intel i7 or Ryzen 7",
      ram: "16GB",
      storage: "20GB",
      os: "Windows 10 64-bit / Linux",
    },
  },
  {
    name: "DayZ",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
    id: "dayz",
    specs: {
      cpu: "Intel i5 or better",
      ram: "12GB",
      storage: "16GB",
      os: "Windows 10 / Linux",
    },
  },
];

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [serverName, setServerName] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelect = (game) => {
    if (game.id !== "pz") return;
    setSelectedGame(game);
    setServerName("");
    setDescription("");
  };

  const closeModal = () => setSelectedGame(null);

  const save = () => {
    if (!serverName.trim()) return alert("Enter a server name.");
    console.log("HOST GAME:", selectedGame.name);
    console.log("Server Name:", serverName);
    console.log("Description:", description);
    closeModal();
  };

  const filteredGames = gamesList.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="games-hosting-page">
      <h1 className="games-title">🎮 Host a Game Server</h1>

      <input
        type="text"
        className="search-bar"
        placeholder="🔍 Search games..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="game-banner-list">
        {filteredGames.length ? (
          filteredGames.map((game) => (
            <div
              key={game.id}
              className={`game-banner ${game.id !== "pz" ? "disabled" : ""}`}
              onClick={() => handleSelect(game)}
            >
              <img src={game.icon} alt={game.name} />
              <div className="banner-overlay">
                <h3>{game.name}</h3>
                <button disabled={game.id !== "pz"}>
                  {game.id === "pz" ? "➕ Create Server" : "🚫 Unavailable"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-games-msg">❌ No games match your search.</p>
        )}
      </div>

      {selectedGame && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">🚀 Set Up {selectedGame.name} Server</h2>

            <div className="specs-container">
              <div className="specs-box">
                <h4>🔧 Required Specs</h4>
                <ul>
                  <li><strong>CPU:</strong> {selectedGame.specs.cpu}</li>
                  <li><strong>RAM:</strong> {selectedGame.specs.ram}</li>
                  <li><strong>Storage:</strong> {selectedGame.specs.storage}</li>
                  <li><strong>OS:</strong> <span className="os-tag">{selectedGame.specs.os}</span></li>
                </ul>
              </div>
              <div className="specs-box">
                <h4>🖥️ Your Specs</h4>
                <ul>
                  <li><strong>CPU:</strong> Intel i7-9700K</li>
                  <li><strong>RAM:</strong> 16GB</li>
                  <li><strong>Storage:</strong> 500GB SSD</li>
                  <li><strong>OS:</strong> <span className="os-tag">Ubuntu 22.04</span></li>
                </ul>
              </div>
            </div>

            <label>📝 Server Name</label>
            <input
              type="text"
              placeholder="e.g. UK PvP Zomboid Server"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
            />

            <label>📣 Description</label>
            <textarea
              rows={3}
              placeholder="Catchy server description to attract players..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-primary" onClick={save}>🚀 Host Server</button>
              <button className="btn-secondary" onClick={closeModal}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;
