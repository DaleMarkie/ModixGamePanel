"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaSteam, FaDiscord } from "react-icons/fa";
import "./Games.css";

interface Game {
  id: string;
  name: string;
  image: string;
  supported: boolean;
  description: string;
  steamUrl?: string;
  discordUrl?: string;
  cpu: number;
  ram: number;
  disk: number;
}

const GAMES: Game[] = [
  {
    id: "projectzomboid",
    name: "Project Zomboid",
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
    supported: true,
    description: "Hardcore zombie survival dedicated Linux server",
    steamUrl: "https://store.steampowered.com/app/108600/Project_Zomboid/",
    discordUrl: "https://discord.com/invite/theindiestone",
    cpu: 2,
    ram: 4,
    disk: 5,
  },
  {
    id: "rust",
    name: "Rust",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    supported: false,
    description: "PvP survival sandbox (SteamCMD required)",
    steamUrl: "https://store.steampowered.com/app/252490/Rust/",
    discordUrl: "https://discord.com/invite/playrust",
    cpu: 4,
    ram: 8,
    disk: 25,
  },
  {
    id: "dayz",
    name: "DayZ",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
    supported: false,
    description: "Open world survival server hosting",
    steamUrl: "https://store.steampowered.com/app/221100/DayZ/",
    discordUrl: "https://discord.com/invite/dayz",
    cpu: 4,
    ram: 8,
    disk: 20,
  },
  {
    id: "rimworld",
    name: "RimWorld",
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/294100/header.jpg",
    supported: true,
    description: "Colony simulation strategy game (Linux native)",
    steamUrl: "https://store.steampowered.com/app/294100/RimWorld/",
    cpu: 2,
    ram: 2,
    disk: 1,
  },
];

export default function Games() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showInstaller, setShowInstaller] = useState(false);

  const [userSpecs, setUserSpecs] = useState({
    cpu: 0,
    ram: 0,
    os: "",
  });

  /* ---------------- SYSTEM DETECT ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    setUserSpecs({
      cpu: navigator.hardwareConcurrency || 2,
      ram: (navigator as any).deviceMemory || 4,
      os: navigator.userAgent.toLowerCase(),
    });
  }, []);

  const isLinux = userSpecs.os.includes("linux");

  /* ---------------- DEBOUNCE ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- FILTER ---------------- */
  const filtered = useMemo(() => {
    return GAMES.filter((g) =>
      g.name.toLowerCase().includes(debounced.toLowerCase())
    );
  }, [debounced]);

  /* ---------------- REQUIREMENT CHECK ---------------- */
  const meetsReq = useCallback(
    (game: Game) =>
      userSpecs.cpu >= game.cpu && userSpecs.ram >= game.ram && isLinux,
    [userSpecs, isLinux]
  );

  /* ---------------- OPEN GAME ---------------- */
  const openGame = useCallback((game: Game) => {
    setSelectedGame(game);
    setShowModal(true);
  }, []);

  /* ---------------- CLEAN INSTALL SCRIPT ---------------- */
  const installScript = useMemo(() => {
    if (!selectedGame) return "";

    const g = selectedGame;

    const header = `#!/bin/bash
set -e

GAME="${g.name}"
DIR="$HOME/game-servers/${g.id}"
STEAM="$HOME/steamcmd"

echo "=================================="
echo "🐧 Installing $GAME"
echo "📁 Path: $DIR"
echo "=================================="

mkdir -p "$DIR"
mkdir -p "$STEAM"

echo "[1/5] Checking system..."
`;

    const deps = `
if ! command -v wget &> /dev/null; then
  sudo apt update && sudo apt install -y wget curl git unzip
fi

sudo apt install -y lib32gcc-s1 lib32stdc++6 tmux screen
echo "✔ Dependencies ready"
`;

    const steamcmd = `
echo "[2/5] SteamCMD..."

if [ ! -f "$STEAM/steamcmd.sh" ]; then
  cd "$STEAM"
  wget -q https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz
  tar -xzf steamcmd_linux.tar.gz
fi

echo "✔ SteamCMD ready"
`;

    const gameInstall =
      g.id === "projectzomboid"
        ? `
echo "[3/5] Installing Project Zomboid..."

sudo apt install -y openjdk-17-jre

$STEAM/steamcmd.sh +login anonymous \\
+force_install_dir "$DIR" \\
+app_update 380870 validate +quit
`
        : g.id === "rust"
        ? `
echo "[3/5] Installing Rust..."

$STEAM/steamcmd.sh +login anonymous \\
+force_install_dir "$DIR" \\
+app_update 258550 validate +quit
`
        : g.id === "dayz"
        ? `
echo "DayZ requires Windows server / experimental setup"
echo "Skipping auto install"
`
        : `
echo "[3/5] Generic install"
mkdir -p "$DIR"
`;

    const footer = `
echo "[4/5] Creating start script..."

cat <<EOF > "$DIR/start.sh"
#!/bin/bash
cd "$DIR"
echo "Starting $GAME server..."
EOF

chmod +x "$DIR/start.sh"

echo "[5/5] Writing log..."
echo "$GAME installed at $(date)" >> "$DIR/install.log"

echo ""
echo "=================================="
echo "✅ INSTALL COMPLETE"
echo "🚀 Run: ./start.sh"
echo "=================================="
`;

    return header + deps + steamcmd + gameInstall + footer;
  }, [selectedGame]);

  const copyScript = useCallback(() => {
    navigator.clipboard.writeText(installScript);
    alert("Copied!");
  }, [installScript]);

  /* ---------------- UI ---------------- */
  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🐧 Linux Game Server Hub</h1>

        {!isLinux && <p className="warn">⚠ Linux not detected</p>}

        <input
          className="search-input"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="games-grid">
        {filtered.map((game) => (
          <div key={game.id} className="game-card">
            <img src={game.image} alt={game.name} />

            <div className="game-info">
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

              <button onClick={() => openGame(game)}>🐧 Install Setup</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedGame.name}</h2>

            <p>
              Status: {meetsReq(selectedGame) ? "✔ Ready" : "⚠ Not recommended"}
            </p>

            <ul>
              <li>CPU: {selectedGame.cpu}</li>
              <li>RAM: {selectedGame.ram}</li>
              <li>Disk: {selectedGame.disk}</li>
              <li>Linux: {isLinux ? "✔" : "❌"}</li>
            </ul>

            <button onClick={() => setShowInstaller(true)}>
              Open Installer
            </button>

            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* INSTALLER */}
      {showInstaller && selectedGame && (
        <div className="modal-backdrop" onClick={() => setShowInstaller(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🐧 Installer</h2>

            <textarea className="script-box" readOnly value={installScript} />

            <button onClick={copyScript}>Copy Script</button>
            <button onClick={() => setShowInstaller(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
