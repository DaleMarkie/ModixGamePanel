"use client";

import React, { useState, useMemo } from "react";
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
  const [players, setPlayers] = useState([
    {
      steamId: "76561198000000001",
      name: "PlayerOne",
      online: true,
      playtime: 123,
      vacBanned: false,
      vpn: true,
      countryCode: "us",
      countryName: "United States",
      banned: false,
      notes: "",
    },
    {
      steamId: "76561198000000002",
      name: "PlayerTwo",
      online: false,
      playtime: 45,
      vacBanned: true,
      vpn: false,
      countryCode: "de",
      countryName: "Germany",
      banned: true,
      notes: "Repeated cheating",
    },
    {
      steamId: "76561198000000003",
      name: "PlayerThree",
      online: true,
      playtime: 300,
      vacBanned: false,
      vpn: false,
      countryCode: "fr",
      countryName: "France",
      banned: false,
      notes: "",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewOnline, setViewOnline] = useState("all");
  const [sortType, setSortType] = useState("name");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [savingNotes, setSavingNotes] = useState(false);

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
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortType === "playtime")
      filtered.sort((a, b) => b.playtime - a.playtime);
    return filtered;
  }, [players, searchTerm, viewOnline, sortType]);

  // Ban toggle
  const toggleBan = (steamId) => {
    setPlayers((prev) =>
      prev.map((p) => (p.steamId === steamId ? { ...p, banned: !p.banned } : p))
    );
  };

  // Notes change locally
  const changeNotes = (steamId, notes) => {
    setPlayers((prev) =>
      prev.map((p) => (p.steamId === steamId ? { ...p, notes } : p))
    );
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
        }),
      });
      if (!response.ok) throw new Error("Failed to save notes");
      alert("Notes saved successfully!");
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
      <header className="spm-header"> 
  <p className="spm-description">
    Manage and monitor your Steam players easily. Search, filter by online status, and sort players by name or playtime. 
    View detailed player info including VAC bans, VPN detection, and notes. You can also ban or unban players directly and keep personal notes for better moderation.
  </p>
  <div className="spm-controls">
    {/* existing controls */}
  </div>
</header>

      {/* Player list */}
      <main className="player-list" role="list">
        {filteredPlayers.length === 0 && <p>No players found.</p>}
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
        <div
          className="modal-backdrop"
          onClick={() => setSelectedPlayer(null)}
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
          tabIndex={-1}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              aria-label="Close modal"
              onClick={() => setSelectedPlayer(null)}
            >
              <FaTimes />
            </button>
            <h2 id="modal-title">{selectedPlayer.name} Info</h2>
            <p>
              <strong>Steam ID:</strong> {selectedPlayer.steamId}
            </p>
            <p>
              <strong>Online:</strong> {selectedPlayer.online ? "Yes" : "No"}
            </p>
            <p>
              <strong>Playtime:</strong> {selectedPlayer.playtime} hours
            </p>
            <p>
              <strong>Country:</strong> {selectedPlayer.countryName} (
              {selectedPlayer.countryCode?.toUpperCase()})
            </p>
            <p>
              <strong>VAC Banned:</strong>{" "}
              {selectedPlayer.vacBanned ? "Yes" : "No"}
            </p>
            <p>
              <strong>VPN Detected:</strong> {selectedPlayer.vpn ? "Yes" : "No"}
            </p>

            <div className="modal-actions">
              <button
                onClick={() => toggleBan(selectedPlayer.steamId)}
                className={selectedPlayer.banned ? "btn-unban" : "btn-ban"}
              >
                {selectedPlayer.banned ? "Unban" : "Ban"}
              </button>
            </div>

            <div className="modal-notes">
              <label htmlFor="notes-textarea">Notes:</label>
              <textarea
                id="notes-textarea"
                value={selectedPlayer.notes}
                onChange={(e) =>
                  changeNotes(selectedPlayer.steamId, e.target.value)
                }
                rows={5}
                placeholder="Add notes about this player..."
                disabled={savingNotes}
              />
              <button
                onClick={saveNotes}
                className="btn-save-notes"
                disabled={savingNotes}
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SteamPlayerManager;
