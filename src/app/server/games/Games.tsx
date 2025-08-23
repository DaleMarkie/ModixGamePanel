import React, { useState, useCallback, useEffect } from "react";
import "./Games.css";

type GameSpec = {
  label: string;
  ok: boolean;
};

type Game = {
  name: string;
  icon: string;
  id: string;
  canHost: boolean;
  comingSoon: boolean;
  specs: {
    cpu: GameSpec;
    ram: GameSpec;
    storage: GameSpec;
    os: GameSpec;
  };
};

const gamesList: Game[] = [
  {
    name: "Project Zomboid",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg",
    id: "pz",
    canHost: true,
    comingSoon: false,
    specs: {
      cpu: { label: "CPU: 4+ cores", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 5 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "RimWorld",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/294100/header.jpg",
    id: "rimworld",
    canHost: true,
    comingSoon: false,
    specs: {
      cpu: { label: "CPU: 2.6 GHz Quad-Core", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 2 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "DayZ",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
    id: "dayz",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: 4-Core 3.0 GHz", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 16 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "Rust",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    id: "rust",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.4 GHz", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 20 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "Minecraft",
    icon: "https://cdn2.steamgriddb.com/file/sgdb-cdn/thumb/b8a5a1763dff9c51f7b4.png",
    id: "minecraft",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Dual-Core 2.6 GHz", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 4 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "FiveM",
    icon: "https://fivem.net/favicon.ico",
    id: "fivem",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.0 GHz", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 20 GB (depends on mods)", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "RedM",
    icon: "https://redm.net/favicon.ico",
    id: "redm",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.0 GHz", ok: true },
      ram: { label: "RAM: 8 GB", ok: true },
      storage: { label: "Storage: 30 GB (depends on mods)", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "ARK: Survival Evolved",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg",
    id: "ark",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.0 GHz", ok: true },
      ram: { label: "RAM: 8 GB (16 GB recommended)", ok: true },
      storage: { label: "Storage: 60 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "The Isle",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/376210/header.jpg",
    id: "theisle",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.2 GHz", ok: true },
      ram: { label: "RAM: 8 GB (16 GB recommended)", ok: true },
      storage: { label: "Storage: 25 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "Arma 3",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/107410/header.jpg",
    id: "arma3",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.0 GHz", ok: true },
      ram: { label: "RAM: 8–16 GB", ok: true },
      storage: { label: "Storage: 40 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "Squad",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/393380/header.jpg",
    id: "squad",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.2 GHz", ok: true },
      ram: { label: "RAM: 16 GB", ok: true },
      storage: { label: "Storage: 55 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "Palworld",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/header.jpg",
    id: "palworld",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.0 GHz", ok: true },
      ram: { label: "RAM: 16 GB", ok: true },
      storage: { label: "Storage: 40 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "Satisfactory",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/526870/header.jpg",
    id: "satisfactory",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.0 GHz", ok: true },
      ram: { label: "RAM: 8–16 GB", ok: true },
      storage: { label: "Storage: 20 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "Terraria",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg",
    id: "terraria",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: 2.0 GHz Dual-Core", ok: true },
      ram: { label: "RAM: 4 GB", ok: true },
      storage: { label: "Storage: 1 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "Factorio",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/427520/header.jpg",
    id: "factorio",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Dual-Core 3.0 GHz", ok: true },
      ram: { label: "RAM: 4 GB", ok: true },
      storage: { label: "Storage: 2 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "Conan Exiles",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/440900/header.jpg",
    id: "conanexiles",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.0 GHz", ok: true },
      ram: { label: "RAM: 8–16 GB", ok: true },
      storage: { label: "Storage: 50 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
  {
    name: "Mount & Blade II: Bannerlord",
    icon: "https://cdn.cloudflare.steamstatic.com/steam/apps/261550/header.jpg",
    id: "bannerlord",
    canHost: true,
    comingSoon: true,
    specs: {
      cpu: { label: "CPU: Quad-Core 3.2 GHz", ok: true },
      ram: { label: "RAM: 8–16 GB", ok: true },
      storage: { label: "Storage: 60 GB", ok: true },
      os: { label: "Linux only 🐧", ok: true },
    },
  },
];

// 🔍 Search Bar
const SearchBar: React.FC<{
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}> = ({ searchTerm, setSearchTerm }) => {
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

// 🎛️ Filter Bar
const FilterBar: React.FC<{
  filters: Record<string, boolean>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}> = ({ filters, setFilters }) => {
  const toggleFilter = (key: string) =>
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const filterOptions = [
    { key: "linuxOnly", label: "🐧 Linux Only" },
    { key: "ram8gb", label: "💾 RAM ≥ 8GB" },
    { key: "canHost", label: "🌐 Can Host" },
  ];

  return (
    <div className="filters-bar">
      {filterOptions.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`filter-btn ${filters[key] ? "active" : ""}`}
          onClick={() => toggleFilter(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

// ⏱ Format uptime duration
const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours > 0 ? `${hours}h` : null,
    minutes > 0 ? `${minutes}m` : null,
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(" ");
};

// 🎮 Game Banner
const GameBanner: React.FC<{
  game: Game;
  onSelect: (game: Game) => void;
  onStop: (game: Game) => void;
  activeGame: string | null;
  status: string;
  loading: boolean;
  uptime: number;
}> = ({ game, onSelect, onStop, activeGame, status, loading, uptime }) => {
  const isActive = activeGame === game.id;
  const anotherRunning = activeGame && !isActive;

  // Find the active game's name if something else is running
  const activeGameName = activeGame
    ? gamesList.find((g) => g.id === activeGame)?.name
    : null;

  return (
    <div
      className={`game-banner ${anotherRunning ? "disabled" : ""} ${
        isActive ? "active" : ""
      }`}
    >
      <img src={game.icon} alt={`${game.name} banner`} />

      {/* 🚧 Coming Soon Label */}
      {game.comingSoon && (
        <span className="coming-soon-label">🚧 Coming Soon</span>
      )}

      <div className="banner-overlay">
        <h3>
          {game.name}
          {status === "running" && isActive && (
            <span className="status-badge running">
              🟢 Running ({formatDuration(uptime)})
            </span>
          )}
          {status === "stopped" && isActive && (
            <span className="status-badge stopped">🔴 Stopped</span>
          )}
        </h3>

        {isActive && status === "running" && (
          <div className="running-overlay">🔥 {game.name} Server LIVE</div>
        )}

        <details className="requirements">
          <summary>Server Requirements</summary>
          <div className="tags">
            {Object.entries(game.specs).map(([key, spec]) => (
              <span key={key} className={`tag ${spec.ok ? "ok" : "fail"}`}>
                {spec.label} {spec.ok ? "✅" : "❌"}
              </span>
            ))}
          </div>
        </details>

        {!isActive ? (
          <button
            disabled={loading || !!anotherRunning || game.comingSoon}
            className="host-btn start"
            type="button"
            onClick={() =>
              !anotherRunning && !game.comingSoon && onSelect(game)
            }
          >
            {game.comingSoon
              ? "🚧 Not Available"
              : anotherRunning && activeGameName
              ? `🚫 Unavailable (${activeGameName} is running)`
              : loading
              ? "⏳ Starting..."
              : "➕ Start Server"}
          </button>
        ) : (
          <button
            disabled={loading}
            className="stop-btn stop"
            type="button"
            onClick={() => onStop(game)}
          >
            {loading ? "⏳ Stopping..." : "🛑 Stop Server"}
          </button>
        )}
      </div>
    </div>
  );
};

// 📌 Main Component
const Games: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    linuxOnly: false,
    ram8gb: false,
    canHost: false,
  });
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [status, setStatus] = useState("stopped");
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [uptime, setUptime] = useState(0);
  const [lastUptime, setLastUptime] = useState<number | null>(null);

  // Restore state
  useEffect(() => {
    const storedGame = localStorage.getItem("selectedGame");
    const storedStart = localStorage.getItem("serverStartTime");
    const storedLast = localStorage.getItem("serverLastUptime");

    if (storedGame) setActiveGame(storedGame);

    const checkServer = async () => {
      if (storedGame) {
        try {
          const res = await fetch(`/api/server-status?game=${storedGame}`);
          const data = await res.json();

          if (data.status === "running" && storedStart) {
            setStatus("running");
            setStartTime(Number(storedStart));
            setLastUptime(null);
          } else if (data.status === "stopped" && storedLast) {
            setStatus("stopped");
            setLastUptime(Number(storedLast));
            setStartTime(null);
          }
        } catch (err) {
          console.error("Failed to restore server status:", err);
        }
      }
    };

    checkServer();
  }, []);

  // Update uptime every second
  useEffect(() => {
    if (status === "running" && startTime) {
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setUptime(elapsed);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, startTime]);

  const startServer = async (gameId: string) => {
    try {
      setLoading(true);
      await fetch(`/api/start-server?game=${gameId}`, { method: "POST" });
      setStatus("running");

      const now = Date.now();
      setStartTime(now);
      setUptime(0);
      setLastUptime(null);

      localStorage.setItem("selectedGame", gameId);
      localStorage.setItem("serverStartTime", now.toString());
      localStorage.removeItem("serverLastUptime");

      console.log("[INFO] Backend started server:", gameId);
    } catch (err) {
      console.error(`[ERROR] Failed to start ${gameId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const stopServer = async (gameId: string) => {
    try {
      setLoading(true);
      await fetch(`/api/stop-server?game=${gameId}`, { method: "POST" });
      setStatus("stopped");

      if (startTime) {
        const finalUptime = Date.now() - startTime;
        setLastUptime(finalUptime);
        localStorage.setItem("serverLastUptime", finalUptime.toString());
      }

      localStorage.removeItem("serverStartTime");
      localStorage.removeItem("selectedGame");
      setActiveGame(null);
      setStartTime(null);

      console.log("[INFO] Backend stopped server:", gameId);
    } catch (err) {
      console.error(`[ERROR] Failed to stop ${gameId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback(
    async (game: Game) => {
      if (activeGame && activeGame !== game.id) {
        console.warn("Another server is running, cannot start a new one.");
        return;
      }
      await startServer(game.id);
      setActiveGame(game.id);

      window.dispatchEvent(new Event("storage"));
      window.location.href = "/terminal";
    },
    [activeGame]
  );

  const handleStop = useCallback(async (game: Game) => {
    await stopServer(game.id);
  }, []);

  // Search + filters
  const filteredGames = gamesList.filter((game) => {
    const matchesSearch = game.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesLinux =
      !filters.linuxOnly || game.specs.os.label.includes("Linux");
    const matchesRam = !filters.ram8gb || game.specs.ram.label.includes("8 GB");
    const matchesHost = !filters.canHost || game.canHost;

    return matchesSearch && matchesLinux && matchesRam && matchesHost;
  });

  return (
    <main className="games-hosting-page">
      <header className="page-header fancy">
        <h1 className="page-title">🚀 My Servers</h1>
        <p className="page-description">
          Manage and host your game servers with ease.
          <br />
          Start or stop servers, track uptime in real-time, and filter by system
          requirements.
          <strong>
            ⚠️ Only one server can run at a time on this demo server.
          </strong>
        </p>
      </header>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <FilterBar filters={filters} setFilters={setFilters} />

      <section
        className="game-banner-list"
        aria-label="Available games to host"
      >
        {filteredGames.length ? (
          filteredGames.map((game) => (
            <GameBanner
              key={game.id}
              game={game}
              onSelect={handleSelect}
              onStop={handleStop}
              activeGame={activeGame}
              status={status}
              loading={loading}
              uptime={status === "running" ? uptime : lastUptime || 0}
            />
          ))
        ) : (
          <p className="no-games-msg" role="alert">
            ❌ No games match your search/filters.
          </p>
        )}
      </section>
    </main>
  );
};

export default Games;
