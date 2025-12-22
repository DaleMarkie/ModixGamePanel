"use client";

import React, { useState } from "react";

interface BatchSelectorProps {
  osName: string;
  favoriteBatches: string[];
  batchPath: string | null;
  onSelectBatch: (path: string) => void;
  onUpdateFavorites: (favorites: string[]) => void;
  onClose: () => void;
  push: (type: "system" | "error", text: string) => void;
}

export default function BatchSelector({
  osName,
  favoriteBatches,
  batchPath,
  onSelectBatch,
  onUpdateFavorites,
  onClose,
  push,
}: BatchSelectorProps) {
  const [newBatchInput, setNewBatchInput] = useState(batchPath || "");

  const isValidBatch = (path: string) => {
    if (!path.trim()) return false;
    return osName === "windows"
      ? path.toLowerCase().endsWith(".bat")
      : path.toLowerCase().endsWith(".sh");
  };

  const getFileName = (path: string) => {
    const parts = path.replace(/\\/g, "/").split("/");
    return parts[parts.length - 1];
  };

  const addFavorite = (path: string) => {
    if (!isValidBatch(path)) {
      push(
        "error",
        `Cannot add invalid file: must be ${
          osName === "windows" ? ".bat" : ".sh"
        }`
      );
      return;
    }
    if (favoriteBatches.includes(path)) {
      push("system", `${getFileName(path)} is already a favorite.`);
      return;
    }
    const updated = [...favoriteBatches, path];
    onUpdateFavorites(updated);
    push("system", `Added to favorites: ${getFileName(path)}`);
  };

  const removeFavorite = (path: string) => {
    const updated = favoriteBatches.filter((b) => b !== path);
    onUpdateFavorites(updated);
    push("system", `Removed from favorites: ${getFileName(path)}`);
  };

  const handleConfirm = () => {
    if (!newBatchInput.trim()) {
      push("error", "Batch path cannot be empty.");
      return;
    }
    if (!isValidBatch(newBatchInput)) {
      push(
        "error",
        `Invalid file for ${osName}. Must be ${
          osName === "windows" ? ".bat" : ".sh"
        }.`
      );
      return;
    }
    onSelectBatch(newBatchInput);
    addFavorite(newBatchInput);
  };

  const handleBrowse = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = osName === "windows" ? ".bat" : ".sh";
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) setNewBatchInput(file.path || file.name);
    };
    fileInput.click();
  };

  return (
    <div className="batch-modal">
      <div className="batch-modal-content">
        <h3>Select Batch File ({osName.toUpperCase()})</h3>

        <div className="favorites-list">
          {favoriteBatches.length ? (
            favoriteBatches.map((b, i) => (
              <div key={i} className="favorite-item">
                <button
                  onClick={() => onSelectBatch(b)}
                  className="favorite-btn"
                >
                  {getFileName(b)}
                </button>
                <button
                  onClick={() => removeFavorite(b)}
                  className="remove-btn"
                >
                  ❌
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: "#fff" }}>No favorite batches yet</p>
          )}
        </div>

        <div className="new-batch">
          <input
            type="text"
            value={newBatchInput}
            onChange={(e) => setNewBatchInput(e.target.value)}
            placeholder={
              osName === "windows"
                ? "C:\\path\\to\\file.bat"
                : "/path/to/file.sh"
            }
          />
          <button onClick={handleConfirm}>Select & Add</button>
          <button onClick={handleBrowse}>Browse File</button>
        </div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
