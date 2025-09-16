import React, { useEffect, useState } from "react";
import ModCard, { ModCardProps } from "../ModCard";

interface Mod {
  modId: string;
  name: string;
  // Add any other mod properties you need
}

interface InstalledModsPageProps {
  installedMods: string[];
  mods: Mod[];
  onAddToServer: (modId: string) => void;
  modColors: Record<string, string>;
  setModColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onClick: (mod: Mod) => void; // Forward click
}

export default function InstalledModsPage({
  installedMods,
  mods,
  onAddToServer,
  modColors,
  setModColors,
  onClick,
}: InstalledModsPageProps) {
  const [installedModInfos, setInstalledModInfos] = useState<Mod[]>([]);

  useEffect(() => {
    const installed = mods.filter((mod) => installedMods.includes(mod.modId));
    setInstalledModInfos(installed);
  }, [installedMods, mods]);

  if (!installedMods.length) return null;

  return (
    <div className="mod-grid">
      {installedModInfos.map((mod) => (
        <ModCard
          key={mod.modId}
          mod={mod}
          inList={true}
          isInstalled={true}
          onClick={() => onClick(mod)}
          onToggleInList={() => {}}
          onAddToServer={() => onAddToServer(mod.modId)}
          onSetColor={(color: string) =>
            setModColors((prev) => ({ ...prev, [mod.modId]: color }))
          }
        />
      ))}
    </div>
  );
}
