"use client";

import React, { useState, useEffect } from "react";
import {
  FaSteam,
  FaDiscord,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
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
      console.error("Failed to update active game on backend", err);
    }
  };

  useEffect(() => {
    const cpuCores = navigator.hardwareConcurrency || 0;
    const ramGB = navigator.deviceMemory || 0;
    const os = navigator.platform || navigator.userAgent;
    setUserSpecs({ cpuCores, ramGB, os });
  }, []);

  useEffect(() => {
    const list: Game[] = [
      {
        id: "251570",
        name: "7 Days to Die",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg",
        supported: true,
        description:
          "Open-world zombie survival game with crafting, building, and RPG elements.",
        steamUrl: "https://store.steampowered.com/app/251570/7_Days_to_Die/",
        discordUrl: "https://discord.com/invite/7daystodie",
      },
      {
        id: "1909850",
        name: "Arma Reforger",
        image:
          "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1874880/capsule_616x353.jpg?t=1762168272",
        supported: true,
        description:
          "Modern military sandbox game — host your own dedicated servers and experience tactical multiplayer.",
        steamUrl: "https://store.steampowered.com/app/1909850/Arma_Reforger/",
        discordUrl: "https://discord.gg/arma",
      },
      {
        id: "107410",
        name: "Arma 3",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/107410/header.jpg",
        supported: true,
        description:
          "Military tactical shooter focused on realism and large-scale combat.",
        steamUrl: "https://store.steampowered.com/app/107410/Arma_3/",
        discordUrl: "https://discord.gg/arma",
      },
      {
        id: "346110",
        name: "ARK: Survival Evolved",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
        supported: true,
        description:
          "Dinosaur survival game with building, crafting, and extensive modding support.",
        steamUrl:
          "https://store.steampowered.com/app/346110/ARK_Survival_Evolved/",
        discordUrl: "https://discord.com/invite/ark",
      },
      {
        id: "440900",
        name: "Conan Exiles",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/440900/header.jpg",
        supported: true,
        description:
          "Survival game with building, crafting, and modding support.",
        steamUrl: "https://store.steampowered.com/app/440900/Conan_Exiles/",
        discordUrl: "https://discord.com/invite/conanexiles",
      },
      {
        id: "221100",
        name: "DayZ",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
        supported: true,
        description: "Survive in a deadly post-apocalyptic world.",
        steamUrl: "https://store.steampowered.com/app/221100/DayZ/",
        discordUrl: "https://discord.com/invite/dayz",
      },
      {
        id: "325980",
        name: "The Isle",
        image:
          "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/376210/header.jpg?t=1653237914",
        supported: true,
        description: "Multiplayer dinosaur survival game in an open world.",
        steamUrl: "https://store.steampowered.com/app/325980/The_Isle/",
        discordUrl: "https://discord.gg/theisle",
      },
      {
        id: "275850",
        name: "No Man's Sky",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/275850/header.jpg",
        supported: true,
        description:
          "Exploration and survival in a procedurally generated universe.",
        steamUrl: "https://store.steampowered.com/app/275850/No_Mans_Sky/",
        discordUrl: "https://discord.com/invite/nomanssky",
      },
      {
        id: "minecraft",
        name: "Minecraft",
        image:
          "https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png",
        supported: true,
        description: "Sandbox game about building, exploration, and survival.",
        steamUrl: "https://www.minecraft.net/",
        discordUrl: "https://discord.gg/minecraft",
      },
      {
        id: "294100",
        name: "RimWorld",
        image: "https://wallpapercave.com/wp/wp3935722.png",
        supported: true,
        description:
          "A colony simulator powered by AI storytelling — manage colonists, survive, and build.",
        steamUrl: "https://store.steampowered.com/app/294100/RimWorld/",
        discordUrl: "https://discord.com/invite/rimworld",
      },
      {
        id: "252490",
        name: "Rust",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
        supported: true,
        description:
          "Survival multiplayer game with crafting, building, and PvP elements.",
        steamUrl: "https://store.steampowered.com/app/252490/Rust/",
        discordUrl: "https://discord.com/invite/playrust",
      },
      {
        id: "526870",
        name: "Satisfactory",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/526870/header.jpg",
        supported: true,
        description: "Factory-building multiplayer game with mod support.",
        steamUrl: "https://store.steampowered.com/app/526870/Satisfactory/",
        discordUrl: "https://discord.com/invite/satisfactory",
      },
      {
        id: "513710",
        name: "SCUM",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/513710/header.jpg",
        supported: true,
        description: "Hardcore survival multiplayer game.",
        steamUrl: "https://store.steampowered.com/app/513710/SCUM/",
        discordUrl: "https://discord.com/invite/scum",
      },
      {
        id: "393380",
        name: "Squad",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/393380/header.jpg",
        supported: true,
        description:
          "Team-based military shooter emphasizing realism and cooperation.",
        steamUrl: "https://store.steampowered.com/app/393380/Squad/",
        discordUrl: "https://discord.gg/squad",
      },
      {
        id: "244850",
        name: "Space Engineers",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/244850/header.jpg",
        supported: true,
        description:
          "Sandbox game about engineering, construction, exploration, and survival in space and planets.",
        steamUrl: "https://store.steampowered.com/app/244850/Space_Engineers/",
        discordUrl: "https://discord.gg/spaceengineers",
      },
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
        id: "892970",
        name: "Valheim",
        image:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
        supported: true,
        description:
          "Viking-themed survival and exploration game in a procedurally-generated world.",
        steamUrl: "https://store.steampowered.com/app/892970/Valheim/",
        discordUrl: "https://discord.gg/valheim",
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
        const firstWithPath = merged.find((g) => g.batchPath);
        if (firstWithPath) setActiveGame(firstWithPath.id);
      }
    } else {
      setGames(list);
      if (activeId) setActiveGame(activeId);
    }
  }, []);

  // Cleaned filteredGames: only search + active game sorting
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
    const updated = games.map((g) =>
      g.id === selectedGame?.id ? { ...g, batchPath } : g
    );
    setGames(updated);
    localStorage.setItem("gamesPaths", JSON.stringify(updated));
    setActiveGameNow(selectedGame?.id || null);
    setShowModal(false);
    alert(`Session for ${selectedGame?.name} created!`);
  };

  const checkRequirement = (label: string) => {
    switch (label) {
      case "CPU":
        return userSpecs.cpuCores >= 4;
      case "RAM":
        return userSpecs.ramGB >= 8;
      case "OS":
        return userSpecs.os.toLowerCase().includes("win");
      default:
        return null;
    }
  };

  const requirementPercent = (label: string) => {
    switch (label) {
      case "CPU":
        return Math.min((userSpecs.cpuCores / 8) * 100, 100);
      case "RAM":
        return Math.min((userSpecs.ramGB / 16) * 100, 100);
      default:
        return 0;
    }
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

            <div className="modal-right modal-scrollbox">
              <h3>{selectedGame.name}</h3>
              <p className="req-title">Minimum Requirements</p>

              <div className="requirements-container">
                {[
                  { label: "CPU", required: 4, unit: "cores" },
                  { label: "RAM", required: 8, unit: "GB" },
                  { label: "Disk", required: 5, unit: "GB" },
                  { label: "OS", required: "Windows 10+", unit: "" },
                ].map((req) => {
                  const met = checkRequirement(req.label);
                  const reason =
                    req.label === "CPU"
                      ? `You have ${userSpecs.cpuCores} cores — at least ${req.required} are required.`
                      : req.label === "RAM"
                      ? `You have ${userSpecs.ramGB}GB — at least ${req.required}GB is required.`
                      : req.label === "OS"
                      ? `Your OS is detected as "${userSpecs.os}" — Windows 10 or newer is required.`
                      : `Cannot detect disk, but ${req.required}GB free is needed.`;

                  return (
                    <div key={req.label} className="requirement">
                      <div className="req-header">
                        <span>{req.label}</span>
                        {req.label !== "Disk" ? (
                          <span
                            className={`status-icon ${met ? "met" : "unmet"}`}
                          >
                            {met ? (
                              <FaCheckCircle color="limegreen" />
                            ) : (
                              <FaTimesCircle color="red" />
                            )}
                          </span>
                        ) : (
                          <FaInfoCircle color="gray" />
                        )}
                      </div>

                      {req.label !== "OS" && req.label !== "Disk" && (
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${met ? "met" : "unmet"}`}
                            style={{
                              width: `${requirementPercent(req.label)}%`,
                            }}
                          />
                        </div>
                      )}

                      <div className="req-details">
                        Required: {req.required} {req.unit}
                      </div>

                      {!met && <p className="req-warning">⚠ {reason}</p>}
                    </div>
                  );
                })}
              </div>

              <label>Batch file path:</label>
              <input
                type="text"
                value={batchPath}
                onChange={(e) => setBatchPath(e.target.value)}
                className="input-field"
                placeholder="C:/Servers/start_server.bat"
              />

              <div className="game-status operational">
                Fully Operational — Selecting this game automatically updates
                all pages.
              </div>

              <div className="modal-actions">
                <button className="confirm-btn" onClick={createSession}>
                  ✅ Activate Session
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
