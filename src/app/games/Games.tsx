"use client";

import React, { useState, useEffect, useMemo } from "react";
import "./Games.css";

interface Game {
  id: string;
  name: string;
  image: string;
  description: string;
  cpu: number;
  ram: number;
  disk: number;
}

const API = "http://localhost:2010";

const GAMES: Game[] = [
  {
    id: "projectzomboid",
    name: "Project Zomboid",
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
    description: "Hardcore zombie survival dedicated server",
    cpu: 2,
    ram: 4,
    disk: 6,
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
    id: "valheim",
    name: "Valheim",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
    description: "Viking survival co-op",
    cpu: 4,
    ram: 8,
    disk: 10,
  },
  {
    id: "cs2",
    name: "Counter-Strike 2",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
    description: "Competitive FPS server",
    cpu: 4,
    ram: 6,
    disk: 20,
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

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🎮 Modix Game Control Panel</h1>

        <p className="page-description">
          This system controls the terminal and server configuration layer. When
          a game is set to <b>Active</b>, all backend services dynamically
          switch to that game profile.
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
              <img src={game.image} />

              <div className="game-info">
                <h3>{game.name}</h3>
                <p>{game.description}</p>

                <div className="requirements">
                  <div className="req cpu">CPU {game.cpu}</div>
                  <div className="req ram">RAM {game.ram}GB</div>
                  <div className="req disk">DISK {game.disk}GB</div>
                </div>

                <button
                  onClick={() => setActive(game.id)}
                  className={isActive ? "active-btn" : "inactive-btn"}
                >
                  {isActive ? "Active Game" : "Set Active Game"}
                </button>

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
