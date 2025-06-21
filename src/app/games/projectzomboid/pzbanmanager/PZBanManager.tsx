"use client";

import React, { useState, useEffect, useCallback } from "react";

import "./PZBanManager.css";

const STEAM_API_KEY = "YOUR_STEAM_API_KEY_HERE"; // Replace with your Steam API key

const PRESET_DURATIONS = [
  { label: "1 Day", days: 1 },
  { label: "3 Days", days: 3 },
  { label: "7 Days", days: 7 },
  { label: "14 Days", days: 14 },
  { label: "30 Days", days: 30 },
  { label: "Permanent", days: null },
];

function calculateExpirationDate(days) {
  if (days === null) return null;
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + days);
  return expireDate;
}

const formatDateTime = (date) =>
  date
    ? date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

const fetchSteamPlayerInfo = async (steamID) => {
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamID}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Steam API request failed");
    const json = await res.json();
    const player = json.response.players?.[0];
    if (!player) throw new Error("Player not found");
    return {
      personaName: player.personaname,
      avatar: player.avatarfull,
      profileUrl: player.profileurl,
      lastLogOff: player.lastlogoff,
      realName: player.realname || "",
      countryCode: player.loccountrycode || "",
    };
  } catch (error) {
    console.error("Steam API error:", error);
    return null;
  }
};

const PZBanManager = () => {
  // Ban state includes an optional 'notes' field for future use
  const [bans, setBans] = useState([
    {
      steamID: "76561198347530219",
      reason: "Example ban for testing",
      durationLabel: "Permanent",
      addedAt: new Date("2025-06-20T14:00:00"),
      expiresAt: null,
      bannedBy: "AdminUser01",
      notes: "",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [steamID, setSteamID] = useState("");
  const [reason, setReason] = useState("");
  const [durationLabel, setDurationLabel] = useState("7 Days");
  const [customDuration, setCustomDuration] = useState("");
  const [bannedBy, setBannedBy] = useState("");
  const [errors, setErrors] = useState({});
  const [steamInfoCache, setSteamInfoCache] = useState({});
  const [steamInfoLoading, setSteamInfoLoading] = useState(false);
  const [currentSteamInfo, setCurrentSteamInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // New state for selected ban to view notes or details
  const [selectedBanSteamID, setSelectedBanSteamID] = useState(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesText, setNotesText] = useState("");

  const validateSteamID = (id) => /^7656\d{11}$/.test(id);

  // Validation function
  const validate = () => {
    const errs = {};
    if (!validateSteamID(steamID.trim()))
      errs.steamID = "Invalid SteamID64. Must be 17 digits starting with 7656.";
    if (!reason.trim()) errs.reason = "Ban reason is required.";
    if (durationLabel === "Custom") {
      const daysNum = Number(customDuration);
      if (!customDuration.trim())
        errs.duration = "Custom duration required (in days).";
      else if (isNaN(daysNum) || daysNum <= 0)
        errs.duration = "Custom duration must be a positive number.";
    }
    if (!bannedBy.trim()) errs.bannedBy = "Banning admin/username is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Fetch Steam info and cache it
  const fetchAndCacheSteamInfo = useCallback(
    async (id) => {
      if (!validateSteamID(id)) {
        setCurrentSteamInfo(null);
        return;
      }
      if (steamInfoCache[id]) {
        setCurrentSteamInfo(steamInfoCache[id]);
        return;
      }
      setSteamInfoLoading(true);
      const info = await fetchSteamPlayerInfo(id);
      setSteamInfoLoading(false);
      if (info) {
        setSteamInfoCache((prev) => ({ ...prev, [id]: info }));
        setCurrentSteamInfo(info);
      } else {
        setCurrentSteamInfo(null);
      }
    },
    [steamInfoCache]
  );

  useEffect(() => {
    if (steamID.trim().length === 17) {
      fetchAndCacheSteamInfo(steamID.trim());
    } else {
      setCurrentSteamInfo(null);
    }
  }, [steamID, fetchAndCacheSteamInfo]);

  useEffect(() => {
    bans.forEach((ban) => {
      if (!steamInfoCache[ban.steamID]) {
        fetchAndCacheSteamInfo(ban.steamID);
      }
    });
  }, [bans, steamInfoCache, fetchAndCacheSteamInfo]);

  const addBan = () => {
    if (!validate()) return;

    const days =
      durationLabel === "Permanent"
        ? null
        : durationLabel === "Custom"
        ? Number(customDuration)
        : PRESET_DURATIONS.find((d) => d.label === durationLabel)?.days ?? 7;

    const now = new Date();
    const expiresAt = calculateExpirationDate(days);

    setBans((prev) => [
      ...prev,
      {
        steamID: steamID.trim(),
        reason: reason.trim(),
        durationLabel,
        addedAt: now,
        expiresAt,
        bannedBy: bannedBy.trim(),
        notes: "",
      },
    ]);

    // Reset form & close modal
    setSteamID("");
    setReason("");
    setDurationLabel("7 Days");
    setCustomDuration("");
    setBannedBy("");
    setErrors({});
    setCurrentSteamInfo(null);
    setModalOpen(false);
  };

  const removeBan = (id) => {
    if (
      window.confirm(
        `Are you sure you want to unban SteamID: ${id}? This action cannot be undone.`
      )
    ) {
      setBans((prev) => prev.filter((ban) => ban.steamID !== id));
      // Close notes modal if open for removed ban
      if (selectedBanSteamID === id) {
        setSelectedBanSteamID(null);
        setNotesModalOpen(false);
      }
    }
  };

  // Filter bans by search term
  const filteredBans = bans.filter((ban) => {
    const steamIdMatch = ban.steamID.includes(searchTerm);
    const personaName =
      steamInfoCache[ban.steamID]?.personaName?.toLowerCase() || "";
    const nameMatch = personaName.includes(searchTerm.toLowerCase());
    return steamIdMatch || nameMatch;
  });

  // Open notes modal for a specific ban
  const openNotesModal = (ban) => {
    setSelectedBanSteamID(ban.steamID);
    setNotesText(ban.notes || "");
    setNotesModalOpen(true);
  };

  // Save notes for selected ban
  const saveNotes = () => {
    setBans((prev) =>
      prev.map((ban) =>
        ban.steamID === selectedBanSteamID ? { ...ban, notes: notesText } : ban
      )
    );
    setNotesModalOpen(false);
  };

  return (
    <div className="ban-manager-container">
      <Header onAddBan={() => setModalOpen(true)} />

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {filteredBans.length === 0 ? (
        <p className="empty-msg">✅ No matching bans found.</p>
      ) : (
        <BanList
          bans={filteredBans}
          steamInfoCache={steamInfoCache}
          removeBan={removeBan}
          openNotesModal={openNotesModal}
        />
      )}

      {modalOpen && (
        <AddBanModal
          steamID={steamID}
          setSteamID={setSteamID}
          reason={reason}
          setReason={setReason}
          durationLabel={durationLabel}
          setDurationLabel={setDurationLabel}
          customDuration={customDuration}
          setCustomDuration={setCustomDuration}
          bannedBy={bannedBy}
          setBannedBy={setBannedBy}
          errors={errors}
          steamInfoLoading={steamInfoLoading}
          currentSteamInfo={currentSteamInfo}
          onClose={() => setModalOpen(false)}
          onAddBan={addBan}
          PRESET_DURATIONS={PRESET_DURATIONS}
        />
      )}

      {notesModalOpen && (
        <NotesModal
          notesText={notesText}
          setNotesText={setNotesText}
          onClose={() => setNotesModalOpen(false)}
          onSave={saveNotes}
        />
      )}
    </div>
  );
};

// Small reusable components below:

const Header = ({ onAddBan }) => (
  <header className="ban-header">
    <h1>🚫 Project Zomboid Ban Manager</h1>
    <button className="btn-primary" onClick={onAddBan}>
      ➕ Add Ban
    </button>
  </header>
);

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="search-bar-container">
    <input
      type="text"
      placeholder="Search by SteamID or player name..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    />
  </div>
);

const BanList = ({ bans, steamInfoCache, removeBan, openNotesModal }) => {
  const now = new Date();
  return (
    <div className="ban-list">
      {bans.map((ban) => {
        const playerInfo = steamInfoCache[ban.steamID];
        const isExpired =
          ban.expiresAt && ban.expiresAt.getTime() < now.getTime();
        return (
          <div
            key={ban.steamID}
            className={`ban-card ${isExpired ? "expired" : ""}`}
            title={isExpired ? "Ban expired" : ""}
          >
            <div className="ban-player-info">
              {playerInfo ? (
                <>
                  <img
                    className="avatar"
                    src={playerInfo.avatar}
                    alt={`${playerInfo.personaName}'s avatar`}
                    width={64}
                    height={64}
                  />
                  <a
                    href={playerInfo.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="player-name"
                  >
                    {playerInfo.personaName}
                  </a>
                </>
              ) : (
                <span className="player-name">{ban.steamID}</span>
              )}
            </div>

            <p>
              <strong>Reason:</strong> {ban.reason}
            </p>
            <p>
              <strong>Duration:</strong> {ban.durationLabel}
            </p>
            <p>
              <strong>Ban Added:</strong> {formatDateTime(ban.addedAt)}
            </p>
            <p>
              <strong>Expires:</strong>{" "}
              {ban.expiresAt ? formatDateTime(ban.expiresAt) : "Never"}
            </p>
            <p>
              <strong>Banned By:</strong> {ban.bannedBy}
            </p>

            <button className="btn-primary" onClick={() => openNotesModal(ban)}>
              📝 Notes
            </button>

            <button
              className="btn-danger"
              onClick={() => removeBan(ban.steamID)}
              style={{ marginLeft: "0.5rem" }}
            >
              ❌ Unban
            </button>
          </div>
        );
      })}
    </div>
  );
};

const AddBanModal = ({
  steamID,
  setSteamID,
  reason,
  setReason,
  durationLabel,
  setDurationLabel,
  customDuration,
  setCustomDuration,
  bannedBy,
  setBannedBy,
  errors,
  steamInfoLoading,
  currentSteamInfo,
  onClose,
  onAddBan,
  PRESET_DURATIONS,
}) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>➕ Add Ban</h2>

      <label htmlFor="steamID">SteamID64</label>
      <input
        id="steamID"
        type="text"
        value={steamID}
        onChange={(e) => setSteamID(e.target.value)}
        placeholder="7656119xxxxxxxxxx"
        maxLength={17}
        autoFocus
        spellCheck={false}
        autoComplete="off"
      />
      {errors.steamID && <span className="error-msg">{errors.steamID}</span>}

      {steamInfoLoading && (
        <p className="loading-msg">Fetching Steam player info...</p>
      )}

      {currentSteamInfo && !steamInfoLoading && (
        <SteamInfoPreview steamInfo={currentSteamInfo} />
      )}

      <label htmlFor="reason">Reason</label>
      <input
        id="reason"
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Griefing, Cheating, Exploiting"
      />
      {errors.reason && <span className="error-msg">{errors.reason}</span>}

      <label htmlFor="bannedBy">Banned By</label>
      <input
        id="bannedBy"
        type="text"
        value={bannedBy}
        onChange={(e) => setBannedBy(e.target.value)}
        placeholder="Admin username or moderator name"
      />
      {errors.bannedBy && <span className="error-msg">{errors.bannedBy}</span>}

      <label htmlFor="duration">Duration</label>
      <select
        id="duration"
        value={durationLabel}
        onChange={(e) => setDurationLabel(e.target.value)}
      >
        {PRESET_DURATIONS.map(({ label }) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
        <option value="Custom">Custom</option>
      </select>

      {durationLabel === "Custom" && (
        <>
          <input
            type="number"
            min={1}
            value={customDuration}
            onChange={(e) => setCustomDuration(e.target.value)}
            placeholder="Enter days (e.g. 10)"
            style={{ marginTop: "0.5rem" }}
          />
          {errors.duration && (
            <span className="error-msg">{errors.duration}</span>
          )}
        </>
      )}

      <div className="modal-actions">
        <button
          className="btn-primary"
          onClick={onAddBan}
          disabled={
            !steamID ||
            !reason ||
            !bannedBy ||
            (durationLabel === "Custom" && !customDuration) ||
            steamInfoLoading
          }
        >
          ✅ Confirm Ban
        </button>
        <button
          className="btn-secondary"
          onClick={onClose}
          disabled={steamInfoLoading}
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  </div>
);

const SteamInfoPreview = ({ steamInfo }) => (
  <div className="steam-info-preview">
    <img
      src={steamInfo.avatar}
      alt={`${steamInfo.personaName} avatar`}
      width={48}
      height={48}
    />
    <a href={steamInfo.profileUrl} target="_blank" rel="noopener noreferrer">
      {steamInfo.personaName}
    </a>
    {steamInfo.realName && <p>Real Name: {steamInfo.realName}</p>}
    {steamInfo.countryCode && <p>Country: {steamInfo.countryCode}</p>}
  </div>
);

const NotesModal = ({ notesText, setNotesText, onClose, onSave }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>📝 Player Notes</h2>
      <textarea
        value={notesText}
        onChange={(e) => setNotesText(e.target.value)}
        placeholder="Add your notes here..."
        rows={8}
        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
      />
      <div className="modal-actions" style={{ marginTop: "1rem" }}>
        <button className="btn-primary" onClick={onSave}>
          💾 Save Notes
        </button>
        <button className="btn-secondary" onClick={onClose}>
          ❌ Cancel
        </button>
      </div>
    </div>
  </div>
);

export default PZBanManager;
