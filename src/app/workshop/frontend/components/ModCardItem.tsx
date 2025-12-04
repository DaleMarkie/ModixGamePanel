import React from "react";
import { Mod } from "./ModCard";

interface ModCardItemProps {
  mod: Mod;
  installed: boolean;
  inList: boolean;
  onAddToServer: (id: string) => void;
  onSelect: (mod: Mod) => void;
  modlists: Record<string, string[]>;
  addToModlist: (modId: string, listName: string) => void;
}

export const ModCardItem: React.FC<ModCardItemProps> = ({
  mod,
  installed,
  inList,
  onAddToServer,
  onSelect,
  modlists,
  addToModlist,
}) => (
  <div className="mod-card hover:scale-105 transition-transform duration-200 shadow-lg rounded-xl overflow-hidden bg-gray-900 text-white flex flex-col">
    <div className="mod-image-wrapper relative">
      <img
        src={mod.image}
        alt={mod.title}
        className="w-full h-40 object-cover"
      />
      <div className="mod-status-overlay absolute top-2 right-2 flex gap-1">
        {installed && (
          <span className="bg-green-500 text-xs px-2 py-1 rounded-full">
            Installed
          </span>
        )}
        {inList && (
          <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
            In List
          </span>
        )}
      </div>
    </div>
    <div className="mod-content p-3 flex flex-col flex-1">
      <h3 className="mod-title font-semibold text-lg line-clamp-2">
        {mod.title}
      </h3>
      {mod.version && (
        <p className="mod-version text-sm text-gray-400 mt-1">v{mod.version}</p>
      )}
      <p className="mod-description text-sm text-gray-300 mt-2 line-clamp-3 flex-1">
        {mod.description || "No description available."}
      </p>
      <div className="mod-actions mt-3 flex gap-2 flex-wrap">
        <button
          onClick={() => onSelect(mod)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm py-1 rounded-md"
        >
          Details
        </button>
        <button
          onClick={() => onAddToServer(mod.modId)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-1 rounded-md"
        >
          Add to Server
        </button>
        {Object.keys(modlists).length > 0 && (
          <select
            onChange={(e) => addToModlist(mod.modId, e.target.value)}
            defaultValue=""
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1 cursor-pointer"
          >
            <option value="">Add to List</option>
            {Object.keys(modlists).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  </div>
);
