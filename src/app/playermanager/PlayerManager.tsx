import React, { useState } from "react";

interface SteamProfile {
  steamid: string; // SteamID64 (Dec)
  steamid2: string;
  steamid3: string;
  steamid64_hex: string;
  customURL?: string | null;
  profileurl: string;
  personaname: string;
  realname?: string;
  loccountrycode?: string;
  avatar: string;
  personastate: number;
  profilestate: string;
  timecreated?: number;
}

interface SteamBanInfo {
  SteamId: string;
  CommunityBanned: boolean;
  VACBanned: boolean;
  NumberOfVACBans: number;
  DaysSinceLastBan: number;
  NumberOfGameBans: number;
  EconomyBan: string;
}

interface SteamPlayerResponse {
  profile: SteamProfile;
  bans: SteamBanInfo;
}

const PlayerManager: React.FC = () => {
  const [steamInput, setSteamInput] = useState("");
  const [steamPlayer, setSteamPlayer] = useState<SteamPlayerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Steam player from backend
  const fetchSteamUser = async () => {
    if (!steamInput) return;
    setLoading(true);
    setError(null);
    setSteamPlayer(null);
    try {
      const res = await fetch(`/api/steam/player/${steamInput}`);
      if (!res.ok) throw new Error("Failed to fetch Steam user");
      const data: SteamPlayerResponse = await res.json();
      setSteamPlayer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching Steam user");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4">
      {/* SteamID / Vanity Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter SteamID64 or Vanity URL..."
          value={steamInput}
          onChange={(e) => setSteamInput(e.target.value.trim())}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={fetchSteamUser}
          disabled={loading}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loading ? "Searching..." : "Find Player"}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Steam Player Result */}
      {steamPlayer && (
        <div className="steam-player-result border p-3 rounded-md shadow">
          <div className="flex gap-4 items-center">
            <img
              src={steamPlayer.profile.avatar}
              alt="avatar"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <p className="text-lg font-bold">{steamPlayer.profile.personaname}</p>
              {steamPlayer.profile.realname && (
                <p className="text-sm text-gray-700">
                  Real Name: {steamPlayer.profile.realname}
                </p>
              )}
              <p className="text-sm text-gray-700">
                Location: {steamPlayer.profile.loccountrycode || "Unknown"}
              </p>
              <p className="text-sm text-gray-700">
                Profile Created: {formatDate(steamPlayer.profile.timecreated)}
              </p>
              <a
                href={steamPlayer.profile.profileurl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Steam Profile
              </a>
              {steamPlayer.profile.customURL && (
                <>
                  {" | "}
                  <a
                    href={steamPlayer.profile.customURL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Custom URL
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Steam IDs */}
          <div className="mt-3 text-sm text-gray-800">
            <p>
              <strong>SteamID2:</strong> {steamPlayer.profile.steamid2}
            </p>
            <p>
              <strong>SteamID3:</strong> {steamPlayer.profile.steamid3}
            </p>
            <p>
              <strong>SteamID64 (Dec):</strong> {steamPlayer.profile.steamid}
            </p>
            <p>
              <strong>SteamID64 (Hex):</strong> {steamPlayer.profile.steamid64_hex}
            </p>
          </div>

          {/* Ban Info */}
          <div className="mt-3 text-sm text-gray-800">
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
              <strong>Economy Ban:</strong> {steamPlayer.bans.EconomyBan}
            </p>
            <p>
              <strong>Days Since Last Ban:</strong>{" "}
              {steamPlayer.bans.DaysSinceLastBan}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManager;
