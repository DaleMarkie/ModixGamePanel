"use client";

import React, { useState, useEffect } from "react";
import "./Games.css";

interface Game {
  id: number;
  name: string;
  image: string;
  supported: boolean;
  appId: string;
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  useEffect(() => {
    const list: Game[] = [
      {
        id: 1,
        name: "Project Zomboid",
        image:
          "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
        supported: true,
        appId: "108600",
      },
      {
        id: 2,
        name: "RimWorld",
        image:
          "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/294100/header.jpg",
        supported: true,
        appId: "294100",
      },
      {
        id: 3,
        name: "ARK: Survival Evolved",
        image:
          "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/346110/header.jpg",
        supported: false,
        appId: "346110",
      },
      {
        id: 4,
        name: "Unturned",
        image:
          "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/304930/header.jpg",
        supported: false,
        appId: "304930",
      },
      {
        id: 5,
        name: "Valheim",
        image:
          "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/892970/header.jpg",
        supported: false,
        appId: "892970",
      },
    ];
    setGames(list);

    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => setActiveGame(data.active_game?.appId ?? null))
      .catch(console.error);
  }, []);

  const handleSetActive = async (game: Game) => {
    if (!game.supported) return;
    const newAppId = activeGame === game.appId ? null : game.appId;
    setActiveGame(newAppId);

    try {
      const res = await fetch("/api/set-active-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: newAppId }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to set active game");
      window.dispatchEvent(
        new CustomEvent("activeGameChanged", { detail: newAppId })
      );
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend.");
    }
  };

  return (
    <div className="games-page">
      <div className="games-header">
        <h2>Supported Games</h2>
        <p>Select a supported game to update your panel and workshop mods.</p>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className={`game-card ${!game.supported ? "coming-soon-card" : ""}`}
          >
            <img src={game.image} alt={game.name} className="game-image" />
            <div className="game-info">
              <h3>{game.name}</h3>
              {game.supported ? (
                <button
                  className={`toggle-btn ${
                    activeGame === game.appId ? "active" : ""
                  }`}
                  onClick={() => handleSetActive(game)}
                >
                  {activeGame === game.appId ? "Active" : "Activate"}
                </button>
              ) : (
                <span className="coming-soon">Coming Soon</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
