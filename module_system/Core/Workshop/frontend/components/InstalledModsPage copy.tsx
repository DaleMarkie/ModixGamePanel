import React, { useEffect, useState, useMemo } from "react";
import ModCard from "../ModCard";

interface InstalledModsPageProps {
  installedMods: string[];
  mods: {
    modId: string;
    title?: string;
    image?: string;
    lastUpdate?: string;
    version?: string;
    description?: string;
  }[];
  onAddToServer: (modId: string) => void;
  modColors: Record<string, string>;
  setModColors: (colors: Record<string, string>) => void;
  onClick: (mod: any) => void; // Trigger modal or other action
}

export default function InstalledModsPage({
  installedMods,
  mods,
  onAddToServer,
  modColors,
  setModColors,
  onClick,
}: InstalledModsPageProps) {
  // Filter only installed mods and memoize for performance
  const installedModInfos = useMemo(() => {
    return mods.filter(mod => installedMods.includes(mod.modId));
  }, [installedMods, mods]);

  if (!installedMods.length) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#ccc" }}>
        No installed mods detected.
      </div>
    );
  }

  return (
    <div
      className="mod-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "12px",
        marginTop: "12px",
      }}
    >
      {installedModInfos.map(mod => (
        <ModCard
          key={mod.modId}
          mod={mod}
          inList={true}
          isInstalled={true}
          onClick={() => onClick(mod)} // Forward click to open modal
          onToggleInList={() => {}} // Installed mods always in list
          onAddToServer={() => onAddToServer(mod.modId)}
          onSetColor={color => setModColors(prev => ({ ...prev, [mod.modId]: color }))}
        />
      ))}
    </div>
  );
}
