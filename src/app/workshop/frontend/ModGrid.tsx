"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mod } from "./ModCard";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface ModGridProps {
  mods: Mod[];
  installedMods?: string[];
  activeList: string;
  modlists?: Record<string, string[]>;
  setSelectedMod: (mod: Mod | null) => void;
  addModToServer: (modId: string) => void;
  removeFromServer: (modId: string) => void;
  favorites?: string[];
  toggleFavorite?: (modId: string) => void;
  setModlists: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

const ModGrid: React.FC<ModGridProps> = ({
  mods,
  installedMods = [],
  activeList,
  modlists = {},
  setSelectedMod,
  addModToServer,
  removeFromServer,
  favorites = [],
  toggleFavorite,
  setModlists,
}) => {
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [tooltip, setTooltip] = useState<string>("");
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Helper Functions ---
  const isFavorite = (modId: string) => favorites.includes(modId);
  const isSelected = (modId: string) => selectedMods.includes(modId);
  const isInstalled = (modId: string) => installedMods.includes(modId);

  const toggleSelectMod = (modId: string) => {
    setSelectedMods(prev =>
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const handleTooltip = (text: string) => {
    setTooltip(text);
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => setTooltip(""), 2000);
  };

  // --- Bulk Actions ---
  const handleBulkAddToServer = () => {
    selectedMods.forEach(addModToServer);
    setSelectedMods([]);
    handleTooltip(`${selectedMods.length} mods added to server`);
  };

  const handleBulkRemoveFromServer = () => {
    selectedMods.forEach(removeFromServer);
    setSelectedMods([]);
    handleTooltip(`${selectedMods.length} mods removed from server`);
  };

  const handleBulkFavorite = () => {
    if (!toggleFavorite) return;
    selectedMods.forEach(toggleFavorite);
    setSelectedMods([]);
    handleTooltip(`Favorites toggled for ${selectedMods.length} mods`);
  };

  // --- Persistent Storage ---
  useEffect(() => {
    localStorage.setItem("modlists", JSON.stringify(modlists));
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [modlists, favorites]);

  // --- Filter Mods ---
  const displayedMods = showFavoritesOnly
    ? mods.filter(mod => isFavorite(mod.modId))
    : mods;

  // --- Drag & Drop Handler ---
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const modId = result.draggableId;
    const list = result.source.droppableId;

    if (!modlists[list]) return;

    const newOrder = Array.from(modlists[list]);
    newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, modId);

    setModlists(prev => ({ ...prev, [list]: newOrder }));
  };

  return (
    <div className="mod-grid-container p-4">
      {/* Favorites Toggle */}
      <div className="mb-4 flex items-center gap-4">
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={() => setShowFavoritesOnly(prev => !prev)}
            className="accent-green-900"
          />
          Show Favorites Only
        </label>
      </div>

      {/* DragDrop Context */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={activeList}>
          {(provided) => (
            <div
              className="mod-grid grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {displayedMods.map((mod, index) => {
                const inList =
                  activeList && activeList !== "__installed__"
                    ? modlists[activeList]?.includes(mod.modId)
                    : false;

                return (
                  <Draggable key={mod.modId} draggableId={mod.modId} index={index}>
                    {(providedDraggable) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        className={`mod-card hover:scale-105 transition-transform duration-200 shadow-lg rounded-xl overflow-hidden bg-gray-900 text-white flex flex-col ${
                          isSelected(mod.modId) ? "ring-2 ring-indigo-500" : ""
                        }`}
                      >
                        {/* Mod Image + Badges */}
                        <div className="mod-image-wrapper relative">
                          <img
                            src={mod.image}
                            alt={mod.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            {isInstalled(mod.modId) && (
                              <span className="bg-green-500 text-xs px-2 py-1 rounded-full">
                                Installed
                              </span>
                            )}
                            {inList && (
                              <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                                In List
                              </span>
                            )}
                            {isFavorite(mod.modId) && (
                              <span className="bg-green-900 text-xs px-2 py-1 rounded-full animate-pulse">
                                ★ Favorite
                              </span>
                            )}
                          </div>
                          {toggleFavorite && (
                            <button
                              onClick={() => toggleFavorite(mod.modId)}
                              className={`absolute top-2 left-2 p-1 rounded-full transition-transform duration-200 ${
                                isFavorite(mod.modId)
                                  ? "bg-green-800 scale-110"
                                  : "bg-gray-800 hover:bg-green-700"
                              }`}
                              title={isFavorite(mod.modId) ? "Unfavorite" : "Favorite"}
                            >
                              {isFavorite(mod.modId) ? "★" : "☆"}
                            </button>
                          )}
                        </div>

                        {/* Mod Details */}
                        <div className="mod-content p-3 flex flex-col flex-1">
                          <h3 className="mod-title font-semibold text-lg line-clamp-2">
                            {mod.title}
                          </h3>
                          {mod.version && (
                            <p className="mod-version text-sm text-gray-400 mt-1">
                              v{mod.version}
                            </p>
                          )}
                          <p className="mod-description text-sm text-gray-300 mt-2 line-clamp-3 flex-1">
                            {mod.description || "No description available."}
                          </p>

                          {/* Actions */}
                          <div className="mod-actions mt-3 flex gap-2 flex-wrap">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={isSelected(mod.modId)}
                                onChange={() => toggleSelectMod(mod.modId)}
                              />
                              Select
                            </label>

                            <button
                              onClick={() => setSelectedMod(mod)}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm py-1 rounded-md"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => addModToServer(mod.modId)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-1 rounded-md"
                            >
                              Add to Server
                            </button>

                            {isInstalled(mod.modId) && (
                              <button
                                onClick={() => removeFromServer(mod.modId)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-1 rounded-md"
                              >
                                Remove from Server
                              </button>
                            )}

                            <button
                              onClick={() => {
                                const cmd = `steamcmd +login anonymous +workshop_download_item ${mod.modId} +quit`;
                                navigator.clipboard.writeText(cmd);
                                handleTooltip("SteamCMD command copied!");
                              }}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-sm py-1 rounded-md"
                            >
                              ⬇️ SteamCMD
                            </button>

                            {/* Add to List */}
                            <select
                              onChange={e => {
                                const listName = e.target.value;
                                if (!listName) return;
                                setModlists(prev => ({
                                  ...prev,
                                  [listName]: Array.from(
                                    new Set([...(prev[listName] || []), mod.modId])
                                  ),
                                }));
                                e.target.value = "";
                                handleTooltip(`${mod.title} added to ${listName}`);
                              }}
                              defaultValue=""
                              className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1 cursor-pointer"
                            >
                              <option value="">Add to List</option>
                              {Object.keys(modlists).map(name => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {tooltip}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedMods.length > 0 && (
        <div className="mt-4 flex gap-2 items-center flex-wrap">
          <button
            onClick={handleBulkAddToServer}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
          >
            Add Selected to Server
          </button>
          <button
            onClick={handleBulkRemoveFromServer}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
          >
            Remove Selected from Server
          </button>
          {toggleFavorite && (
            <button
              onClick={handleBulkFavorite}
              className="bg-green-900 hover:bg-green-800 text-white px-3 py-2 rounded-lg flex items-center gap-1"
            >
              Toggle Favorite ({selectedMods.filter(isFavorite).length})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModGrid;
