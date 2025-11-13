"use client";

import React, { useState, useEffect } from "react";
import { FaSteam, FaDiscord } from "react-icons/fa";
import "./Games.css";

interface Game {
  id: string;
  name: string;
  image: string;
  supported: boolean;
  batchPath?: string;
  description: string;
  steamUrl?: string;
  discordUrl?: string;
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [batchPath, setBatchPath] = useState("");
  const [search, setSearch] = useState("");

  // --- Sync active game with backend ---
  const setActiveGameNow = async (gameId: string) => {
    setActiveGame(gameId);
    localStorage.setItem("activeGameId", gameId);

    // Call backend to save active game
    try {
      await fetch("/api/filemanager/active-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId }),
      });
    } catch (err) {
      console.error("Failed to update active game on backend", err);
    }
  };

  useEffect(() => {
    const list: Game[] = [
      {
        id: "108600",
        name: "Project Zomboid",
        image:
          "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
        supported: true,
        description:
          "Ultimate zombie survival — manage your own apocalyptic world with friends.",
        steamUrl: "https://store.steampowered.com/app/108600/Project_Zomboid/",
        discordUrl: "https://discord.com/invite/theindiestone",
      },
      {
        id: "dayz",
        name: "DayZ",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
        supported: true,
        description: "Survive in a deadly post-apocalyptic world.",
        steamUrl: "https://store.steampowered.com/app/221100/DayZ/",
        discordUrl: "https://discord.com/invite/dayz",
      },
      {
        id: "294100",
        name: "RimWorld",
        image:
          "https://shared.cloudflare.steampowered.com/store_item_assets/steam/apps/294100/header.jpg",
        supported: true,
        description:
          "A colony simulator powered by AI storytelling — manage colonists, survive, and build.",
        steamUrl: "https://store.steampowered.com/app/294100/RimWorld/",
        discordUrl: "https://discord.com/invite/rimworld",
      },
    ];

    const saved = localStorage.getItem("gamesPaths");
    const activeId = localStorage.getItem("activeGameId");

    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = list.map((g) => {
        const savedGame = parsed.find((sg: Game) => sg.id === g.id);
        return savedGame ? { ...g, batchPath: savedGame.batchPath } : g;
      });
      setGames(merged);
      if (activeId) setActiveGame(activeId);
      else {
        const active = merged.find((g) => g.batchPath);
        if (active) setActiveGame(active.id);
      }
    } else {
      setGames(list);
      if (activeId) setActiveGame(activeId);
    }
  }, []);

  const filteredGames = games
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.id === activeGame) return -1;
      if (b.id === activeGame) return 1;
      return a.name.localeCompare(b.name);
    });

  const openModal = (game: Game) => {
    if (!game.supported) return;
    setSelectedGame(game);
    setBatchPath(game.batchPath || "");
    setShowModal(true);
    setActiveGameNow(game.id);
  };

  const createSession = () => {
    if (!batchPath.trim()) return alert("Please provide the batch file path!");
    const updatedGames = games.map((g) =>
      g.id === selectedGame?.id ? { ...g, batchPath } : g
    );
    setGames(updatedGames);
    localStorage.setItem("gamesPaths", JSON.stringify(updatedGames));
    setActiveGameNow(selectedGame?.id || null);
    setShowModal(false);
    alert(`Session for ${selectedGame?.name} created!`);
  };

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🎮 Supported Games</h1>
        <p className="subtitle">
          Select a game below to manage and launch your dedicated server.
        </p>

        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="games-grid">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className={`game-card ${!game.supported ? "coming-soon" : ""}`}
          >
            <div className="game-thumb">
              <img src={game.image} alt={game.name} />
              <div className="overlay">
                {game.supported ? (
                  <button
                    className={`launch-btn ${
                      activeGame === game.id ? "active" : ""
                    }`}
                    onClick={() => openModal(game)}
                  >
                    {activeGame === game.id
                      ? "🟢 Active Game"
                      : "🚀 Make Active"}
                  </button>
                ) : (
                  <span className="coming-soon-text">⏳ Coming Soon</span>
                )}
              </div>
            </div>

            <div className="game-details">
              <h3>{game.name}</h3>
              <p>{game.description}</p>

              <div className="game-buttons">
                {game.steamUrl && (
                  <a
                    href={game.steamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="steam-btn"
                  >
                    <FaSteam /> Steam
                  </a>
                )}
                {game.discordUrl && (
                  <a
                    href={game.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="discord-btn"
                  >
                    <FaDiscord /> Discord
                  </a>
                )}
              </div>

              {activeGame === game.id && (
                <span className="active-badge">Active Session</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-left">
              <img src={selectedGame.image} alt={selectedGame.name} />
            </div>
            <div className="modal-right">
              <h3>{selectedGame.name}</h3>
              <p>Minimum requirements for server:</p>
              <ul>
                <li>CPU: Quad Core</li>
                <li>RAM: 8 GB</li>
                <li>Disk: 5 GB free</li>
                <li>OS: Windows 10+</li>
              </ul>

              <label>Batch file path:</label>
              <input
                type="text"
                value={batchPath}
                onChange={(e) => setBatchPath(e.target.value)}
                className="input-field"
                placeholder="C:/Servers/start_server.bat"
              />

              <div className="modal-actions">
                <button className="confirm-btn" onClick={createSession}>
                  ✅ Create Session
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  ✖ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
