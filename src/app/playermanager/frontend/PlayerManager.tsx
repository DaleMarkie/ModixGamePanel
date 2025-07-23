"use client";

import React, { useState } from "react";
import {
  FaUser,
  FaBan,
  FaCheck,
  FaSearch,
  FaTimes,
  FaUsers,
  FaEye,
  FaClock,
  FaGavel,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import "./PlayerManager.css";

const samplePlayers = [
  {
    id: 1,
    name: "PlayerOne",
    active: true,
    time: "5h 30m",
    suspensions: 0,
    bans: 0,
    tickets: 2,
  },
  {
    id: 2,
    name: "NoobMaster",
    active: false,
    time: "3h 12m",
    suspensions: 1,
    bans: 1,
    tickets: 0,
  },
  {
    id: 3,
    name: "StealthNinja",
    active: true,
    time: "12h 44m",
    suspensions: 0,
    bans: 0,
    tickets: 1,
  },
  {
    id: 4,
    name: "CasualGamer",
    active: false,
    time: "7h 21m",
    suspensions: 2,
    bans: 1,
    tickets: 3,
  },
];

const PlayerManager = () => {
  const [players, setPlayers] = useState(samplePlayers);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showKickModal, setShowKickModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filter === "active") return player.active && matchesSearch;
    if (filter === "inactive") return !player.active && matchesSearch;
    return matchesSearch;
  });

  const toggleBan = (id) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const openKickModal = (player) => {
    setSelectedPlayer(player);
    setShowKickModal(true);
  };

  const closeKickModal = () => {
    setSelectedPlayer(null);
    setShowKickModal(false);
  };

  const confirmKick = () => {
    alert(`Kicked ${selectedPlayer.name}`);
    closeKickModal();
  };

  const openViewModal = (player) => {
    setSelectedPlayer(player);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setSelectedPlayer(null);
    setShowViewModal(false);
  };

  return (
    <div className="player-manager-box">
      <div className="player-manager-header">
        <FaUsers className="icon" />
        <h2>Player Manager</h2>
      </div>

      <div className="player-manager-controls">
        <div className="search-bar">
          <FaSearch className="icon" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              className={filter === f ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <table className="player-table">
        <thead>
          <tr>
            <th>
              <FaUser className="icon" /> Name
            </th>
            <th>
              <FaClock className="icon" /> Play Time
            </th>
            <th>
              <FaGavel className="icon" /> Suspensions
            </th>
            <th>
              <FaBan className="icon" /> Bans
            </th>
            <th>
              <FaEnvelopeOpenText className="icon" /> Tickets
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-players">
                No players found.
              </td>
            </tr>
          ) : (
            filteredPlayers.map((player) => (
              <tr
                key={player.id}
                className={player.active ? "active-player" : "inactive-player"}
              >
                <td>{player.name}</td>
                <td>{player.time}</td>
                <td>{player.suspensions}</td>
                <td>{player.bans}</td>
                <td>{player.tickets}</td>
                <td>
                  <button
                    className="action-btn view"
                    onClick={() => openViewModal(player)}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    className={`action-btn ${player.active ? "ban" : "unban"}`}
                    onClick={() => toggleBan(player.id)}
                  >
                    {player.active ? "Ban" : "Unban"}
                  </button>
                  <button
                    className="action-btn kick"
                    onClick={() => openKickModal(player)}
                  >
                    Kick
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Kick Modal */}
      {showKickModal && selectedPlayer && (
        <div className="modal-backdrop" onClick={closeKickModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Kick {selectedPlayer.name}?</h3>
            <p>This will disconnect the player immediately.</p>
            <div className="modal-actions">
              <button className="confirm-kick" onClick={confirmKick}>
                Confirm
              </button>
              <button onClick={closeKickModal}>
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPlayer && (
        <div className="modal-backdrop" onClick={closeViewModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Player Details</h3>
            <p>
              <strong>Name:</strong> {selectedPlayer.name}
            </p>
            <p>
              <strong>Play Time:</strong> {selectedPlayer.time}
            </p>
            <p>
              <strong>Suspensions:</strong> {selectedPlayer.suspensions}
            </p>
            <p>
              <strong>Bans:</strong> {selectedPlayer.bans}
            </p>
            <p>
              <strong>Support Tickets:</strong> {selectedPlayer.tickets}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {selectedPlayer.active ? "Active" : "Banned"}
            </p>
            <div className="modal-actions">
              <button onClick={closeViewModal}>
                <FaTimes /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManager;
