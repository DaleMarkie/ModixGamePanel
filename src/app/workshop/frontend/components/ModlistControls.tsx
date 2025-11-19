"use client";

import React from "react";

interface ModlistControlsProps {
  activeList: string;
  modlists: Record<string, string[]>;
  installedMods: string[];
  showListOnly: boolean;
  setShowListOnly: (value: boolean) => void;
  setActiveList: (value: string) => void;
  createNewModlist: () => void;
  renameModlist: () => void;
  deleteModlist: () => void;
  setShowExport: (value: boolean) => void;
}

export default function ModlistControls({
  activeList,
  modlists,
  installedMods,
  showListOnly,
  setShowListOnly,
  setActiveList,
  createNewModlist,
  renameModlist,
  deleteModlist,
  setShowExport,
}: ModlistControlsProps) {
  return (
    <div className="modlist-bar">
      {/* Dropdown for selecting active modlist */}
      <div className="dropdown-container">
        <label>📁 Modlist:</label>
        <select
          value={activeList}
          onChange={(e) => setActiveList(e.target.value)}
        >
          <option value="">All Mods</option>
          {installedMods.length > 0 && (
            <option value="__installed__">✅ Installed Mods</option>
          )}
          {Object.keys(modlists).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons for modlist actions */}
      <div className="modlist-buttons">
        <button onClick={createNewModlist}>➕ New</button>

        {activeList && activeList !== "__installed__" && (
          <>
            <button onClick={renameModlist}>✏ Rename</button>
            <button onClick={deleteModlist}>🗑 Delete</button>
            <label>
              <input
                type="checkbox"
                checked={showListOnly}
                onChange={() => setShowListOnly(!showListOnly)}
              />{" "}
              Show List
            </label>
            <button onClick={() => setShowExport(true)}>📤 Export</button>
          </>
        )}
      </div>
    </div>
  );
}
