import React from "react";

interface ModlistBarProps {
  activeList: string;
  setActiveList: (v: string) => void;
  showListOnly: boolean;
  setShowListOnly: (v: boolean) => void;
  modlists: Record<string, string[]>;
  installedMods: string[];
  createNewModlist: () => void;
  renameModlist: () => void;
  deleteModlist: () => void;
  displayedModsCount: number;
  onExport: () => void;
  onServerIniUploadClick: () => void;
}

export const ModlistBar: React.FC<ModlistBarProps> = ({
  activeList,
  setActiveList,
  showListOnly,
  setShowListOnly,
  modlists,
  installedMods,
  createNewModlist,
  renameModlist,
  deleteModlist,
  displayedModsCount,
  onExport,
  onServerIniUploadClick,
}) => (
  <div className="modlist-bar flex flex-wrap items-center gap-3 p-4 bg-gray-900/80 border border-gray-700 rounded-xl shadow-lg">
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
    {activeList && activeList !== "__installed__" && (
      <label className="flex items-center gap-2 text-gray-300 whitespace-nowrap">
        <input
          type="checkbox"
          checked={showListOnly}
          onChange={() => setShowListOnly(!showListOnly)}
          className="accent-indigo-500"
        />{" "}
        Show only this list
      </label>
    )}

    <div className="flex flex-wrap items-center gap-2 ml-3">
      <button
        onClick={createNewModlist}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow-md transition-all"
      >
        ➕ New
      </button>
      {activeList && activeList !== "__installed__" && (
        <>
          <button
            onClick={renameModlist}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-md transition-all"
          >
            ✏ Rename
          </button>
          <button
            onClick={deleteModlist}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition-all"
          >
            🗑 Delete
          </button>
        </>
      )}
      {displayedModsCount > 0 && (
        <button
          onClick={onExport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg shadow-md transition-all"
        >
          📤 Export
        </button>
      )}
    </div>

    <div className="ml-auto flex items-center">
      <button
        onClick={onServerIniUploadClick}
        className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-white"
      >
        Upload server.ini
      </button>
    </div>
  </div>
);
