"use client";

import React from "react";
import { Mod } from "./ModCard";

interface ModlistBarProps {
  activeList: string;
  setActiveList: (list: string) => void;
  showListOnly: boolean;
  setShowListOnly: (show: boolean) => void;
  modlists: Record<string, string[]>;
  installedMods: string[];
  displayedMods: Mod[];
  createNewModlist: () => void;
  renameModlist: () => void;
  deleteModlist: () => void;
  setShowExport: (show: boolean) => void;
}

const ModlistBar: React.FC<ModlistBarProps> = ({
  activeList,
  setActiveList,
  showListOnly,
  setShowListOnly,
  modlists,
  installedMods,
  displayedMods,
  createNewModlist,
  renameModlist,
  deleteModlist,
  setShowExport,
}) => {
  return (
    <div className="modlist-bar flex flex-wrap items-center gap-3 p-4 bg-gray-900/80 border border-gray-700 rounded-xl shadow-lg">
      {/* LEFT GROUP: dropdown + show only */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Dropdown */}
        <select
          value={activeList}
          onChange={(e) => setActiveList(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-750 transition-all"
        >
          <option value="">All Mods</option>
          {installedMods.length > 0 && (
            <option value="__installed__">Installed Mods</option>
          )}
          {Object.keys(modlists).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* Show only mods from this list */}
        {activeList && activeList !== "__installed__" && (
          <label className="flex items-center gap-2 text-gray-300 whitespace-nowrap">
            <input
              type="checkbox"
              checked={showListOnly}
              onChange={() => setShowListOnly((prev) => !prev)}
              className="accent-indigo-500"
            />
            Show only this list
          </label>
        )}
      </div>

      {/* CENTER GROUP: actions */}
      <div className="flex flex-wrap items-center gap-2 ml-3">
        {/* NEW */}
        <button
          onClick={createNewModlist}
          className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-3 py-2 rounded-lg shadow-md transition-all"
        >
          ➕ New
        </button>

        {activeList && activeList !== "__installed__" && (
          <>
            {/* RENAME */}
            <button
              onClick={renameModlist}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg shadow-md transition-all"
            >
              ✏ Rename
            </button>

            {/* DELETE */}
            <button
              onClick={deleteModlist}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3 py-2 rounded-lg shadow-md transition-all"
            >
              🗑 Delete
            </button>
          </>
        )}

        {/* EXPORT */}
        {displayedMods.length > 0 && (
          <button
            onClick={() => setShowExport(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-2 rounded-lg shadow-md transition-all"
          >
            📤 Export
          </button>
        )}
      </div>
    </div>
  );
};

export default ModlistBar;
