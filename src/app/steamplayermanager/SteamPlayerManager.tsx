"use client";

import React, { useState } from "react";
import Image from "next/image";
import "./SteamPlayerManager.css";

interface SteamProfile {
  steamid: string;
  profileurl: string;
  personaname: string;
  realname?: string;
  loccountrycode?: string;
  avatar: string;
  timecreated?: number;
}

interface SteamBanInfo {
  VACBanned: boolean;
  NumberOfGameBans: number;
  CommunityBanned: boolean;
  DaysSinceLastBan: number;
}

interface NoteEntry {
  text: string;
  status: "Safe Player" | "Low-Risk" | "Medium-Risk" | "High-Risk";
  timestamp: number;
}

interface SteamPlayerResponse {
  profile: SteamProfile;
  bans: SteamBanInfo;
  notes?: NoteEntry[];
}

const SteamPlayerManager: React.FC = () => {
  const [steamInput, setSteamInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [steamPlayer, setSteamPlayer] = useState<SteamPlayerResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentNote, setCurrentNote] = useState("");
  const [currentStatus, setCurrentStatus] = useState<
    "Safe Player" | "Low-Risk" | "Medium-Risk" | "High-Risk" | ""
  >("");

  const fetchSteamUser = async () => {
    if (!steamInput || !apiKey) {
      setError("Please enter SteamID/Vanity URL and your Steam API Key.");
      return;
    }

    setLoading(true);
    setError(null);
    setSteamPlayer(null);

    try {
      const params = new URLSearchParams();
      params.append("key", apiKey);
      if (/^\d{17}$/.test(steamInput)) {
        params.append("steamid", steamInput);
      } else {
        params.append("vanityurl", steamInput);
      }

      const res = await fetch(`/api/steam/search?${params.toString()}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "User not found");

      setSteamPlayer({
        profile: data.profile || data,
        bans: data.bans || {
          VACBanned: false,
          NumberOfGameBans: 0,
          CommunityBanned: false,
          DaysSinceLastBan: 0,
        },
        notes: [],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error fetching Steam user"
      );
    } finally {
      setLoading(false);
    }
  };

  const saveNote = () => {
    if (!steamPlayer || !currentNote || !currentStatus) return;

    const newNote: NoteEntry = {
      text: currentNote,
      status: currentStatus,
      timestamp: Date.now(),
    };
    setSteamPlayer({
      ...steamPlayer,
      notes: [newNote, ...(steamPlayer.notes || [])],
    });
    setCurrentNote("");
    setCurrentStatus("");
  };

  const formatTimestamp = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6 steam-manager">
      {/* Instructions */}
      <div className="steam-instructions mb-6 bg-zinc-900 border border-green-600 rounded-lg p-4 shadow-md">
        <h2 className="text-2xl font-bold text-green-400 mb-3">
          🔹 Steam Player Finder
        </h2>
        <p className="text-green-200 mb-2">
          To search for a Steam player, you need a{" "}
          <strong>Steam API Key</strong> and the player&apos;s{" "}
          <strong>SteamID64 or Vanity URL</strong>.
        </p>
        <p className="text-green-200">
          Your Steam API Key allows this tool to fetch profile and ban
          information directly from Steam. Get your key here:{" "}
          <a
            href="https://steamcommunity.com/dev/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-green-400 underline"
          >
            Steam API Key Page
          </a>
        </p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Enter Steam API Key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value.trim())}
          className="steam-input flex-1"
        />
        <input
          type="text"
          placeholder="SteamID64 or Vanity URL..."
          value={steamInput}
          onChange={(e) => setSteamInput(e.target.value.trim())}
          className="steam-input flex-1"
        />
        <button
          onClick={fetchSteamUser}
          disabled={loading}
          className="steam-button"
        >
          {loading ? "Searching..." : "Find Player"}
        </button>
      </div>

      {error && <p className="error-text mb-4">{error}</p>}

      {/* Player Info */}
      {steamPlayer && (
        <div className="steam-player-result mb-6 bg-zinc-900 border border-green-600 rounded-lg p-4 shadow-lg">
          <div className="flex gap-4 items-center">
            <Image
              src={steamPlayer.profile.avatar}
              alt="avatar"
              width={64}
              height={64}
              className="avatar rounded-full"
            />
            <div>
              <p className="player-name text-green-300 font-bold">
                {steamPlayer.profile.personaname}
              </p>
              {steamPlayer.profile.realname && (
                <p className="player-info">
                  Real Name: {steamPlayer.profile.realname}
                </p>
              )}
              <p className="player-info">
                Location: {steamPlayer.profile.loccountrycode || "Unknown"}
              </p>
              <p className="player-info">
                Profile Created:{" "}
                {steamPlayer.profile.timecreated
                  ? new Date(
                      steamPlayer.profile.timecreated * 1000
                    ).toLocaleDateString()
                  : "Unknown"}
              </p>
              <a
                href={steamPlayer.profile.profileurl}
                target="_blank"
                rel="noreferrer"
                className="profile-link text-green-400 underline"
              >
                View Steam Profile
              </a>
            </div>
          </div>

          {/* Ban Info */}
          <div className="ban-info mt-3 text-green-200">
            <p>
              <strong>VAC Banned:</strong>{" "}
              {steamPlayer.bans.VACBanned ? "Yes" : "No"}
            </p>
            <p>
              <strong>Game Bans:</strong> {steamPlayer.bans.NumberOfGameBans}
            </p>
            <p>
              <strong>Community Banned:</strong>{" "}
              {steamPlayer.bans.CommunityBanned ? "Yes" : "No"}
            </p>
            <p>
              <strong>Days Since Last Ban:</strong>{" "}
              {steamPlayer.bans.DaysSinceLastBan}
            </p>
          </div>

          {/* Notes */}
          <div className="notes-section mt-4">
            <label className="block mb-2 font-semibold text-green-400">
              Risk Status:
            </label>
            <select
              value={currentStatus}
              onChange={(e) =>
                setCurrentStatus(e.target.value as typeof currentStatus)
              }
              className="steam-select mb-3 w-full"
            >
              <option value="">Select Status...</option>
              <option value="Safe Player">✅ Safe Player</option>
              <option value="Low-Risk">🟢 Low-Risk</option>
              <option value="Medium-Risk">🟠 Medium-Risk</option>
              <option value="High-Risk">🔴 High-Risk</option>
            </select>

            <label className="block mb-2 font-semibold text-green-400">
              Add Note:
            </label>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              rows={3}
              className="steam-textarea w-full mb-2"
              placeholder="Write your note..."
            />
            <button onClick={saveNote} className="steam-button w-full mb-3">
              Add Note
            </button>

            {steamPlayer.notes && steamPlayer.notes.length > 0 && (
              <div className="notes-feed">
                {steamPlayer.notes.map((n, idx) => (
                  <div
                    key={idx}
                    className="note-card mb-2 p-2 border border-green-700 rounded-lg bg-zinc-800"
                  >
                    <div className="note-header flex justify-between text-green-200 mb-1">
                      <span className="note-status">{n.status}</span>
                      <span className="note-time">
                        {formatTimestamp(n.timestamp)}
                      </span>
                    </div>
                    <p className="note-text text-green-100">{n.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SteamPlayerManager;
