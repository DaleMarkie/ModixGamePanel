"use client";

import React, { useState, useEffect } from "react";
import {
  FaSteam,
  FaDiscord,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "./Games.css";

interface Game {
  id: string;
  name: string;
  image: string;
  supported: boolean;
  description: string;
  steamUrl?: string;
  discordUrl?: string;
  minRequirements: {
    CPU: number;
    RAM: number;
    Disk: number;
    OS: string;
  };
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [search, setSearch] = useState("");

  const [userSpecs, setUserSpecs] = useState({
    cpuCores: 0,
    ramGB: 0,
    os: "",
  });

  const setActiveGameNow = async (gameId: string | null) => {
    setActiveGame(gameId);
    if (gameId) localStorage.setItem("activeGameId", gameId);

    try {
      await fetch("/api/filemanager/active-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId }),
      });
    } catch (err) {
      console.error("Failed to update active game", err);
    }
  };

  useEffect(() => {
    const cpuCores = navigator.hardwareConcurrency || 0;
    const ramGB = navigator.deviceMemory || 0;
    const os = navigator.userAgent.toLowerCase();

    setUserSpecs({ cpuCores, ramGB, os });
  }, []);

  useEffect(() => {
    const list: Game[] = [
      {
        id: "projectzomboid",
        name: "Project Zomboid",
        image:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
        supported: true,
        description:
          "Hardcore zombie survival with deep simulation and multiplayer servers.",
        steamUrl: "https://store.steampowered.com/app/108600/Project_Zomboid/",
        discordUrl: "https://discord.com/invite/theindiestone",
        minRequirements: {
          CPU: 2,
          RAM: 4,
          Disk: 5,
          OS: "Linux",
        },
      },

      // 🚧 PLANNED GAMES
      {
        id: "rust",
        name: "Rust",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
        supported: false,
        description:
          "Survival PvP game with base building (planned Linux support).",
        steamUrl: "https://store.steampowered.com/app/252490/Rust/",
        discordUrl: "https://discord.com/invite/playrust",
        minRequirements: {
          CPU: 4,
          RAM: 8,
          Disk: 25,
          OS: "Linux",
        },
      },
      {
        id: "dayz",
        name: "DayZ",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
        supported: false,
        description: "Open-world survival game (Linux support planned).",
        steamUrl: "https://store.steampowered.com/app/221100/DayZ/",
        discordUrl: "https://discord.com/invite/dayz",
        minRequirements: {
          CPU: 4,
          RAM: 8,
          Disk: 20,
          OS: "Linux",
        },
      },
      {
        id: "theisle",
        name: "The Isle",
        image:
          "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/376210/header.jpg",
        supported: false,
        description: "Dinosaur survival game (planned support).",
        steamUrl: "https://store.steampowered.com/app/376210/The_Isle/",
        discordUrl: "https://discord.gg/theisle",
        minRequirements: {
          CPU: 4,
          RAM: 8,
          Disk: 30,
          OS: "Linux",
        },
      },
    ];

    setGames(list);
  }, []);

  const isLinux = userSpecs.os.includes("linux");

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (game: Game) => {
    if (!game.supported) return;

    if (!isLinux) {
      alert("❌ Linux required.");
      return;
    }

    setSelectedGame(game);
    setShowModal(true);
    setActiveGameNow(game.id);
  };

  const checkRequirement = (label: string, required: number | string) => {
    switch (label) {
      case "CPU":
        return userSpecs.cpuCores >= (required as number);
      case "RAM":
        return userSpecs.ramGB >= (required as number);
      case "OS":
        return isLinux;
      default:
        return true;
    }
  };

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🐧 Linux Game Servers Only</h1>

        {!isLinux && (
          <p style={{ color: "red" }}>❌ Not on Linux — hosting disabled</p>
        )}

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
            className={`game-card ${!game.supported ? "disabled" : ""}`}
          >
            <div className="game-thumb">
              <img src={game.image} alt={game.name} />

              <div className="overlay">
                {game.supported ? (
                  <button
                    className="launch-btn"
                    onClick={() => openModal(game)}
                    disabled={!isLinux}
                  >
                    {isLinux ? "🚀 Launch" : "❌ Linux Required"}
                  </button>
                ) : (
                  <span className="planned-badge">🚧 Planned</span>
                )}
              </div>
            </div>

            <div className="game-details">
              <h3>{game.name}</h3>
              <p>{game.description}</p>

              <div className="game-buttons">
                {game.steamUrl && (
                  <a href={game.steamUrl} target="_blank">
                    <FaSteam /> Steam
                  </a>
                )}
                {game.discordUrl && (
                  <a href={game.discordUrl} target="_blank">
                    <FaDiscord /> Discord
                  </a>
                )}
              </div>

              {activeGame === game.id && game.supported && (
                <span className="active-badge">Active</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedGame.name}</h3>

            <p>Minimum Requirements</p>

            <ul>
              {Object.entries(selectedGame.minRequirements).map(
                ([key, value]) => {
                  const met = checkRequirement(key, value);

                  return (
                    <li key={key}>
                      {key}: {value}{" "}
                      {met ? (
                        <FaCheckCircle color="limegreen" />
                      ) : (
                        <FaTimesCircle color="red" />
                      )}
                    </li>
                  );
                }
              )}
            </ul>

            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
