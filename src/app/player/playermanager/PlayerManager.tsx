"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  ChangeEvent,
  MouseEvent,
} from "react";
import {
  FaSearch,
  FaCheckCircle,
  FaBan,
  FaTimes,
  FaSteamSymbol,
  FaStar,
  FaSortAlphaDown,
  FaSortAmountDown,
  FaUserSlash,
  FaUser,
  FaSpinner,
} from "react-icons/fa";
import "./PlayerManager.css";

const SPECIAL_STEAM_ID = "76561198347512345";

interface Player {
  steamId: string;
  name: string;
  online: boolean;
  playtime: number; // in minutes presumably
  banned: boolean;
  notes?: string;
}

type ViewOnlineFilter = "all" | "online" | "offline";
type SortType = "name" | "playtime";

const PlayerManager: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewOnline, setViewOnline] = useState<ViewOnlineFilter>("all");
  const [sortType, setSortType] = useState<SortType>("name");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [savingNotes, setSavingNotes] = useState<boolean>(false);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch players via backend RCON proxy
  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    setError(null);
    try {
      const res = await fetch("/api/rcon/players");
      if (!res.ok) throw new Error("Failed to fetch players");
      const data: { players: Player[] } = await res.json();
      setPlayers(data.players || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unknown error fetching players"
      );
    } finally {
      setLoadingPlayers(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    let filtered = players;
    if (viewOnline === "online") filtered = filtered.filter((p) => p.online);
    else if (viewOnline === "offline")
      filtered = filtered.filter((p) => !p.online);
    if (searchTerm.trim())
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (sortType === "name")
      filtered = filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
    else if (sortType === "playtime")
      filtered = filtered.slice().sort((a, b) => b.playtime - a.playtime);
    return filtered;
  }, [players, searchTerm, viewOnline, sortType]);

  // Kick player via RCON API
  const kickPlayer = async (steamId: string) => {
    if (!window.confirm("Are you sure you want to kick this player?")) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rcon/kick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamId }),
      });
      if (!res.ok) throw new Error("Failed to kick player");
      alert("Player kicked successfully!");
      await fetchPlayers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error kicking player");
    } finally {
      setActionLoading(false);
    }
  };

  // Ban/unban player via RCON API + save notes via separate API
  const toggleBan = async (steamId: string, currentBanStatus: boolean) => {
    if (
      !window.confirm(
        `${
          currentBanStatus ? "Unban" : "Ban"
        } this player? This action may require a server restart.`
      )
    )
      return;

    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rcon/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamId, ban: !currentBanStatus }),
      });
      if (!res.ok) throw new Error("Failed to update ban status");

      alert(
        `Player ${!currentBanStatus ? "banned" : "unbanned"} successfully!`
      );
      await fetchPlayers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating ban");
    } finally {
      setActionLoading(false);
    }
  };

  // Notes change locally in modal
  const changeNotes = (steamId: string, notes: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.steamId === steamId ? { ...p, notes } : p))
    );
    if (selectedPlayer?.steamId === steamId) {
      setSelectedPlayer({ ...selectedPlayer, notes });
    }
  };

  // Save notes to backend DB (not via RCON)
  const saveNotes = async () => {
    if (!selectedPlayer) return;
    setSavingNotes(true);
    setError(null);
    try {
      const res = await fetch("/api/playerNotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steamId: selectedPlayer.steamId,
          notes: selectedPlayer.notes,
          banned: selectedPlayer.banned,
        }),
      });
      if (!res.ok) throw new Error("Failed to save notes");
      alert("Notes saved successfully!");
      await fetchPlayers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // Event handlers for input change (for search input)
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="steam-player-manager">
      <header className="spm-header">
        <h2>
          <FaSteamSymbol /> Player Manager (RCON)
        </h2>
        <div className="spm-controls">
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={loadingPlayers}
              aria-label="Search players"
            />
          </div>
          <div
            className="view-toggle"
            role="group"
            aria-label="Filter players by online status"
          >
            {["all", "online", "offline"].map((status) => (
              <button
                key={status}
                onClick={() => setViewOnline(status as ViewOnlineFilter)}
                className={viewOnline === status ? "active" : ""}
                aria-pressed={viewOnline === status}
                disabled={loadingPlayers}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="sort-toggle" role="group" aria-label="Sort players">
            <button
              onClick={() => setSortType("name")}
              className={sortType === "name" ? "active" : ""}
              aria-pressed={sortType === "name"}
              disabled={loadingPlayers}
            >
              <FaSortAlphaDown /> Name
            </button>
            <button
              onClick={() => setSortType("playtime")}
              className={sortType === "playtime" ? "active" : ""}
              aria-pressed={sortType === "playtime"}
              disabled={loadingPlayers}
            >
              <FaSortAmountDown /> Playtime
            </button>
          </div>
        </div>
      </header>

      {error && (
        <p role="alert" style={{ color: "red", padding: "0 1rem" }}>
          Error: {error}
        </p>
      )}

      <main className="player-list" role="list">
        {loadingPlayers && (
          <p>
            Loading players... <FaSpinner className="spin" />
          </p>
        )}

        {!loadingPlayers && filteredPlayers.length === 0 && (
          <p>No players found.</p>
        )}

        {filteredPlayers.map((player) => (
          <article
            key={player.steamId}
            className={`player-card ${player.online ? "online" : "offline"} ${
              player.steamId === SPECIAL_STEAM_ID ? "highlight-user" : ""
            } ${player.banned ? "banned" : ""}`}
            role="listitem"
            tabIndex={0}
            onClick={() => setSelectedPlayer(player)}
          >
            <div className="player-name">
              <FaUser />
              {player.name}
              {player.steamId === SPECIAL_STEAM_ID && (
                <FaStar title="Special user" className="special-icon" />
              )}
            </div>
            <div className="player-meta">
              <span className="steam-id">SteamID: {player.steamId}</span>
              <span
                className={`status ${player.online ? "online" : "offline"}`}
                aria-label={player.online ? "Online" : "Offline"}
                title={player.online ? "Online" : "Offline"}
              >
                {player.online ? <FaCheckCircle /> : <FaTimes />}
              </span>
              <span className="playtime">
                Playtime: {Math.floor(player.playtime / 60)}m
              </span>
              {player.banned && (
                <span className="banned" title="Player is banned">
                  <FaBan />
                </span>
              )}
            </div>
            <div className="player-actions">
              <button
                className="btn kick-btn"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  kickPlayer(player.steamId);
                }}
                disabled={actionLoading}
                aria-label={`Kick ${player.name}`}
                title="Kick Player"
              >
                <FaUserSlash />
              </button>
              <button
                className="btn ban-btn"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  toggleBan(player.steamId, player.banned);
                }}
                disabled={actionLoading}
                aria-label={`${player.banned ? "Unban" : "Ban"} ${player.name}`}
                title={player.banned ? "Unban Player" : "Ban Player"}
              >
                <FaBan />
              </button>
            </div>
          </article>
        ))}
      </main>

      {/* Player detail modal */}
      {selectedPlayer && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedPlayer(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <header className="modal-header">
              <h3 id="modal-title">{selectedPlayer.name} Details</h3>
              <button
                className="close-btn"
                aria-label="Close player details"
                onClick={() => setSelectedPlayer(null)}
              >
                &times;
              </button>
            </header>

            <section className="modal-body">
              <p>
                <strong>Steam ID:</strong> {selectedPlayer.steamId}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedPlayer.online ? "Online" : "Offline"}
              </p>
              <p>
                <strong>Playtime:</strong>{" "}
                {Math.floor(selectedPlayer.playtime / 60)} minutes
              </p>
              <p>
                <strong>Banned:</strong> {selectedPlayer.banned ? "Yes" : "No"}
              </p>
              <label htmlFor="notes">
                <strong>Notes:</strong>
              </label>
              <textarea
                id="notes"
                value={selectedPlayer.notes || ""}
                onChange={(e) =>
                  changeNotes(selectedPlayer.steamId, e.target.value)
                }
                rows={5}
                disabled={savingNotes}
              />
            </section>

            <footer className="modal-footer">
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                aria-label="Save player notes"
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
              <button onClick={() => setSelectedPlayer(null)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManager;
