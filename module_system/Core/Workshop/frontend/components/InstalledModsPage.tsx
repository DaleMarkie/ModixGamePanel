import React, { useEffect, useState } from "react";
import ModCard from "../ModCard";

interface InstalledModsPageProps {
  installedMods: string[];
  mods: any[];
  onAddToServer: (modId: string) => void;
  modColors: Record<string, string>;
  setModColors: (colors: Record<string, string>) => void;
  onClick: (mod: any) => void; // Must pass this
}

export default function InstalledModsPage({
  installedMods,
  mods,
  onAddToServer,
  modColors,
  setModColors,
  onClick,
}: InstalledModsPageProps) {
  const [installedModInfos, setInstalledModInfos] = useState<any[]>([]);

  useEffect(() => {
    const installed = mods.filter(mod => installedMods.includes(mod.modId));
    setInstalledModInfos(installed);
  }, [installedMods, mods]);

  if (!installedMods.length) return null;

  return (
    <div className="mod-grid">
      {installedModInfos.map(mod => (
        <ModCard
          key={mod.modId}
          mod={mod}
          inList={true}
          isInstalled={true}
          onClick={() => onClick(mod)} // Forward click
          onToggleInList={() => {}}
          onAddToServer={() => onAddToServer(mod.modId)}
          onSetColor={color => setModColors(prev => ({ ...prev, [mod.modId]: color }))}
        />
      ))}
    </div>
  );
}
