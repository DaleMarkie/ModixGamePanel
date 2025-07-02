"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaCheckCircle,
  FaBan,
  FaClock,
  FaSteamSymbol,
  FaStar,
  FaSortAlphaDown,
  FaSortAmountDown,
  FaTimes,
} from "react-icons/fa";
import "./SteamPlayerManager.css";

const SPECIAL_STEAM_ID = "76561198347512345";

const SteamPlayerManager = () => {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewOnline, setViewOnline] = useState("all");
  const [sortType, setSortType] = useState("name");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Fetch players from backend API
  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const res = await fetch("/api/players");
      if (!res.ok) throw new Error("Failed to fetch players");
      const data = await res.json();
      setPlayers(data);
    } catch (error) {
      alert("Error loading players: " + error.message);
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

  // Ban toggle with backend update
  const toggleBan = async (steamId) => {
    const player = players.find((p) => p.steamId === steamId);
    if (!player) return;

    // Optimistic UI update:
    setPlayers((prev) =>
      prev.map((p) => (p.steamId === steamId ? { ...p, banned: !p.banned } : p))
    );

    try {
      const res = await fetch("/api/playerNotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steamId,
          banned: !player.banned,
          notes: player.notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to update ban status");
      // Refresh full list to sync server state
      await fetchPlayers();
    } catch (error) {
      alert("Error updating ban: " + error.message);
      // revert UI if error
      setPlayers((prev) =>
        prev.map((p) =>
          p.steamId === steamId ? { ...p, banned: player.banned } : p
        )
      );
    }
  };

  // Notes change locally in modal
  const changeNotes = (steamId, notes) => {
    setPlayers((prev) =>
      prev.map((p) => (p.steamId === steamId ? { ...p, notes } : p))
    );
    if (selectedPlayer?.steamId === steamId) {
      setSelectedPlayer({ ...selectedPlayer, notes });
    }
  };

  // Save notes to backend
  const saveNotes = async () => {
    if (!selectedPlayer) return;
    setSavingNotes(true);
    try {
      const response = await fetch("/api/playerNotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steamId: selectedPlayer.steamId,
          notes: selectedPlayer.notes,
          banned: selectedPlayer.banned,
        }),
      });
      if (!response.ok) throw new Error("Failed to save notes");
      alert("Notes saved successfully!");
      await fetchPlayers(); // refresh list after save
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="steam-player-manager">
      {/* Header + Controls */}
      <header className="spm-header">
        <h2>
          <FaSteamSymbol /> Steam Players
        </h2>
        <div className="spm-controls">
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="view-toggle" role="group" aria-label="Filter players">
            <button
              onClick={() => setViewOnline("all")}
              className={viewOnline === "all" ? "active" : ""}
              aria-pressed={viewOnline === "all"}
            >
              All
            </button>
            <button
              onClick={() => setViewOnline("online")}
              className={viewOnline === "online" ? "active" : ""}
              aria-pressed={viewOnline === "online"}
            >
              Online
            </button>
            <button
              onClick={() => setViewOnline("offline")}
              className={viewOnline === "offline" ? "active" : ""}
              aria-pressed={viewOnline === "offline"}
            >
              Offline
            </button>
          </div>
          <div className="sort-toggle" role="group" aria-label="Sort players">
            <button
              onClick={() => setSortType("name")}
              className={sortType === "name" ? "active" : ""}
              aria-pressed={sortType === "name"}
            >
              <FaSortAlphaDown /> Name
            </button>
            <button
              onClick={() => setSortType("playtime")}
              className={sortType === "playtime" ? "active" : ""}
              aria-pressed={sortType === "playtime"}
            >
              <FaSortAmountDown /> Playtime
            </button>
          </div>
        </div>
      </header>

      {/* Player list */}
      <main className="player-list" role="list">
        {loadingPlayers && <p>Loading players...</p>}
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
            <div className="player-info">
              <h3>
                {player.name}
                {player.countryCode && (
                  <img
                    src={`https://flagcdn.com/24x18/${player.countryCode.toLowerCase()}.png`}
                    alt={player.countryName}
                    className="country-flag"
                    title={player.countryName}
                    loading="lazy"
                  />
                )}
                {player.steamId === SPECIAL_STEAM_ID && (
                  <FaStar className="special-badge" title="Special User" />
                )}
                {player.banned && (
                  <FaBan
                    className="ban-icon"
                    title="Banned"
                    style={{ marginLeft: 6, color: "red" }}
                  />
                )}
              </h3>
              <p>
                <FaClock /> {player.playtime} hrs
              </p>
              <p>
                {player.vpn && (
                  <span className="vpn-detected" title="VPN Detected">
                    VPN
                  </span>
                )}
                {player.vacBanned ? (
                  <span className="vac-banned" title="VAC Banned">
                    <FaBan /> VAC Banned
                  </span>
                ) : (
                  <span className="vac-clean" title="VAC Clean">
                    <FaCheckCircle /> No VAC
                  </span>
                )}
              </p>
            </div>
          </article>
        ))}
      </main>

      {/* Modal */}
      {selectedPlayer && (
        <aside
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
          onClick={() => setSelectedPlayer(null)}
        >
          <section
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <h2 id="modalTitle">{selectedPlayer.name}</h2>
              <button
                aria-label="Close"
                onClick={() => setSelectedPlayer(null)}
                className="close-button"
              >
                <FaTimes />
              </button>
            </header>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveNotes();
              }}
            >
              <label htmlFor="notesTextarea">Notes</label>
              <textarea
                id="notesTextarea"
                value={selectedPlayer.notes}
                onChange={(e) =>
                  changeNotes(selectedPlayer.steamId, e.target.value)
                }
                rows={6}
              />
              <label>
                <input
                  type="checkbox"
                  checked={selectedPlayer.banned}
                  onChange={() => toggleBan(selectedPlayer.steamId)}
                />
                Ban Player
              </label>
              <button type="submit" disabled={savingNotes}>
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </form>
          </section>
        </aside>
      )}
    </div>
  );
};

export default SteamPlayerManager;
