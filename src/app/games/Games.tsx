"use client";

import React, { useState, useEffect, useMemo } from "react";
import "./Games.css";

import { FaDiscord, FaYoutube, FaGlobe, FaSteamSquare } from "react-icons/fa";

interface Game {
  id: string;
  name: string;
  image: string;
  description: string;
  cpu: number;
  ram: number;
  disk: number;

  discord?: string;
  youtube?: string;
  website?: string;

  workshop?: string;
}

const API = "http://localhost:2010";

const GAMES: Game[] = [
  // =========================
  // ⭐ ALWAYS FIRST
  // =========================
  {
    id: "projectzomboid",
    name: "Project Zomboid",
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
    description: "Hardcore zombie survival dedicated server",
    cpu: 2,
    ram: 4,
    disk: 6,
    workshop: "https://steamcommunity.com/app/108600/workshop/",
  },

  // =========================
  // 🔤 ALPHABETICAL ORDER
  // =========================

  {
    id: "ark_se",
    name: "ARK: Survival Evolved",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
    description: "Dinosaur survival sandbox",
    cpu: 8,
    ram: 16,
    disk: 80,
    workshop: "https://steamcommunity.com/app/346110/workshop/",
  },
  {
    id: "arma3",
    name: "ARMA 3",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/107410/header.jpg",
    description: "Military simulation sandbox",
    cpu: 8,
    ram: 16,
    disk: 50,
    workshop: "https://steamcommunity.com/app/107410/workshop/",
  },
  {
    id: "barotrauma",
    name: "Barotrauma",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/602960/header.jpg",
    description: "Underwater co-op survival sim",
    cpu: 4,
    ram: 8,
    disk: 15,
    workshop: "https://steamcommunity.com/app/602960/workshop/",
  },
  {
    id: "cs2",
    name: "Counter-Strike 2",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
    description: "Competitive FPS server",
    cpu: 4,
    ram: 6,
    disk: 20,
    workshop: "https://steamcommunity.com/app/730/workshop/",
  },
  {
    id: "conan_exiles",
    name: "Conan Exiles",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/440900/header.jpg",
    description: "Open-world survival MMO",
    cpu: 6,
    ram: 12,
    disk: 50,
    workshop: "https://steamcommunity.com/app/440900/workshop/",
  },
  {
    id: "dayz",
    name: "DayZ",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
    description: "Hardcore zombie survival",
    cpu: 6,
    ram: 12,
    disk: 40,
    workshop: "https://steamcommunity.com/app/221100/workshop/",
  },
  {
    id: "eco",
    name: "Eco",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/382310/header.jpg",
    description: "Ecological survival simulation",
    cpu: 4,
    ram: 8,
    disk: 20,
  },
  {
    id: "gmod",
    name: "Garry's Mod",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/4000/header.jpg",
    description: "Sandbox physics server",
    cpu: 2,
    ram: 4,
    disk: 10,
    workshop: "https://steamcommunity.com/app/4000/workshop/",
  },
  {
    id: "insurgency",
    name: "Insurgency",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/222880/header.jpg",
    description: "Hardcore tactical shooter",
    cpu: 4,
    ram: 8,
    disk: 20,
    workshop: "https://steamcommunity.com/app/222880/workshop/",
  },
  {
    id: "insurgency_sandstorm",
    name: "Insurgency: Sandstorm",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/581320/header.jpg",
    description: "Modern tactical FPS",
    cpu: 6,
    ram: 12,
    disk: 40,
    workshop: "https://steamcommunity.com/app/581320/workshop/",
  },
  {
    id: "l4d2",
    name: "Left 4 Dead 2",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/550/header.jpg",
    description: "Co-op zombie shooter",
    cpu: 2,
    ram: 3,
    disk: 15,
    workshop: "https://steamcommunity.com/app/550/workshop/",
  },
  {
    id: "minecraft",
    name: "Minecraft",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/322330/header.jpg",
    description: "Sandbox building survival",
    cpu: 2,
    ram: 4,
    disk: 5,
  },
  {
    id: "rimworld",
    name: "RimWorld",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/294100/header.jpg",
    description: "Colony simulation & storytelling",
    cpu: 2,
    ram: 4,
    disk: 5,
    workshop: "https://steamcommunity.com/app/294100/workshop/",
  },
  {
    id: "rust",
    name: "Rust",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    description: "PvP survival sandbox",
    cpu: 6,
    ram: 10,
    disk: 30,
    workshop: "https://steamcommunity.com/app/252490/workshop/",
  },
  {
    id: "satisfactory",
    name: "Satisfactory",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/526870/header.jpg",
    description: "Factory automation sandbox",
    cpu: 4,
    ram: 8,
    disk: 25,
    workshop: "https://steamcommunity.com/app/526870/workshop/",
  },
  {
    id: "space_engineers",
    name: "Space Engineers",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/244850/header.jpg",
    description: "Space sandbox engineering",
    cpu: 6,
    ram: 12,
    disk: 40,
    workshop: "https://steamcommunity.com/app/244850/workshop/",
  },
  {
    id: "squad",
    name: "Squad",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/393380/header.jpg",
    description: "Realistic tactical FPS",
    cpu: 8,
    ram: 16,
    disk: 60,
    workshop: "https://steamcommunity.com/app/393380/workshop/",
  },
  {
    id: "starbound",
    name: "Starbound",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/211820/header.jpg",
    description: "2D space survival sandbox",
    cpu: 2,
    ram: 4,
    disk: 10,
    workshop: "https://steamcommunity.com/app/211820/workshop/",
  },
  {
    id: "tf2",
    name: "Team Fortress 2",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/440/header.jpg",
    description: "Class-based FPS server",
    cpu: 2,
    ram: 3,
    disk: 15,
    workshop: "https://steamcommunity.com/app/440/workshop/",
  },
  {
    id: "terraria",
    name: "Terraria",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg",
    description: "2D sandbox adventure",
    cpu: 2,
    ram: 2,
    disk: 5,
    workshop: "https://steamcommunity.com/app/105600/workshop/",
  },
  {
    id: "the_isle_evrima",
    name: "The Isle: Evrima",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/376210/header.jpg",
    description: "Dinosaur survival realism server",
    cpu: 6,
    ram: 10,
    disk: 25,
    workshop: "https://steamcommunity.com/app/376210/workshop/",
  },
  {
    id: "unturned",
    name: "Unturned",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/304930/header.jpg",
    description: "Low-poly zombie survival",
    cpu: 2,
    ram: 4,
    disk: 10,
    workshop: "https://steamcommunity.com/app/304930/workshop/",
  },
  {
    id: "valheim",
    name: "Valheim",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
    description: "Viking survival co-op",
    cpu: 4,
    ram: 8,
    disk: 10,
    workshop: "https://steamcommunity.com/app/892970/workshop/",
  },
  {
    id: "7dtd",
    name: "7 Days to Die",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg",
    description: "Zombie survival crafting",
    cpu: 6,
    ram: 12,
    disk: 40,
    workshop: "https://steamcommunity.com/app/251570/workshop/",
  },
];

export default function Games() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeGame, setActiveGame] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetch(`${API}/api/games/active`)
      .then((r) => r.json())
      .then((d) => setActiveGame(d.active_game))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return GAMES.filter((g) =>
      (g.name + g.description).toLowerCase().includes(debounced.toLowerCase())
    );
  }, [debounced]);

  const setActive = async (id: string) => {
    const newActive = activeGame === id ? null : id;
    setActiveGame(newActive);

    await fetch(`${API}/api/games/active`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: newActive }),
    });
  };

  const installGame = async (id: string) => {
    alert(`Feature not fully developed. Install triggered for ${id}`);
  };

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🎮 Modix Game Control Panel</h1>

        <p className="page-description">
          This system controls server profiles. Active game switches backend
          configuration.
        </p>

        <input
          className="search-input"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="games-grid">
        {filtered.map((game) => {
          const isActive = activeGame === game.id;

          return (
            <div
              key={game.id}
              className={`game-card ${isActive ? "active" : ""}`}
            >
              <div className="image-wrapper">
                <img src={game.image} />

                <div className="socials">
                  {game.discord && (
                    <a href={game.discord} target="_blank">
                      <FaDiscord />
                    </a>
                  )}
                  {game.youtube && (
                    <a href={game.youtube} target="_blank">
                      <FaYoutube />
                    </a>
                  )}
                  {game.website && (
                    <a href={game.website} target="_blank">
                      <FaGlobe />
                    </a>
                  )}
                  {game.workshop && (
                    <a href={game.workshop} target="_blank">
                      <FaSteamSquare />
                    </a>
                  )}
                </div>
              </div>

              <div className="game-info">
                <h3>{game.name}</h3>
                <p>{game.description}</p>

                <div className="requirements">
                  <div className="req cpu">CPU {game.cpu}</div>
                  <div className="req ram">RAM {game.ram}GB</div>
                  <div className="req disk">DISK {game.disk}GB</div>
                </div>

                <div className="action-row">
                  <button
                    onClick={() => setActive(game.id)}
                    className={isActive ? "active-btn" : "inactive-btn"}
                  >
                    {isActive ? "Active Game" : "Set Active"}
                  </button>

                  <button
                    onClick={() => installGame(game.id)}
                    className="install-btn"
                  >
                    Install
                  </button>
                </div>

                {isActive && (
                  <div className="active-badge">🟢 Active Server Profile</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
