"use client";

import React from "react";

interface SteamDownloaderProps {
  modId: string;
  appId: number; // Steam App ID
  style?: React.CSSProperties;
}

const SteamDownloader: React.FC<SteamDownloaderProps> = ({ modId, appId, style }) => {
  const steamButtonStyle: React.CSSProperties = {
    backgroundColor: "#1b2838",
    color: "#ffffff",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    border: "none",
    fontWeight: "bold",
    ...style,
  };

  const handleSteamCMDDownload = () => {
    const cmd = `steamcmd +login anonymous +workshop_download_item ${appId} ${modId} +quit`;
    navigator.clipboard.writeText(cmd);
    alert(`SteamCMD command copied to clipboard:\n${cmd}`);
  };

  const handleViewOnSteam = () => {
    window.open(`https://steamcommunity.com/sharedfiles/filedetails/?id=${modId}`, "_blank");
  };

  return (
    <div style={{ marginTop: 9, textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
      <button onClick={handleViewOnSteam} style={steamButtonStyle}>
        ⬇️ View On Steam
      </button>
      <button onClick={handleSteamCMDDownload} style={steamButtonStyle}>
        ⬇️ Download via SteamCMD
      </button>
    </div>
  );
};

export default SteamDownloader;
