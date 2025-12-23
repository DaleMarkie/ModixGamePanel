"use client";

import React, { useMemo, useState } from "react";

interface BatchSelectorProps {
  osName: "windows" | "linux";
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
  const [inputPath, setInputPath] = useState(batchPath ?? "");
  const [selectedPath, setSelectedPath] = useState<string | null>(
    batchPath ?? null
  );

  /* ───────────────────── helpers ───────────────────── */

  const normalizePath = (path: string) =>
    osName === "windows"
      ? path.replace(/\//g, "\\").trim()
      : path.replace(/\\/g, "/").trim();

  const isValidBatch = (path: string) => {
    const p = path.toLowerCase();
    return osName === "windows" ? p.endsWith(".bat") : p.endsWith(".sh");
  };

  const isAbsolutePath = (path: string) => {
    if (osName === "windows") return /^[a-zA-Z]:\\/.test(path);
    return path.startsWith("/");
  };

  const fileName = (path: string) =>
    path.replace(/\\/g, "/").split("/").pop() || path;

  const normalizedFavorites = useMemo(
    () => favoriteBatches.map(normalizePath),
    [favoriteBatches]
  );

  const alreadyFavorite =
    selectedPath && normalizedFavorites.includes(normalizePath(selectedPath));

  /* ───────────────────── actions ───────────────────── */

  const selectBatch = (rawPath: string) => {
    const path = normalizePath(rawPath);

    if (!path) {
      push("error", "Batch path is empty.");
      return;
    }

    if (!isAbsolutePath(path)) {
      push("error", "Path must be an absolute path.");
      return;
    }

    if (!isValidBatch(path)) {
      push(
        "error",
        `Invalid file type. Expected ${osName === "windows" ? ".bat" : ".sh"}`
      );
      return;
    }

    setSelectedPath(path);
    setInputPath(path);
    onSelectBatch(path);

    push("system", `Batch selected: ${fileName(path)}`);
  };

  const addToFavorites = () => {
    if (!selectedPath) return;

    const normalized = normalizePath(selectedPath);

    if (normalizedFavorites.includes(normalized)) {
      push("system", "Batch already in favorites.");
      return;
    }

    onUpdateFavorites([...favoriteBatches, normalized]);
    push("system", `Added to favorites: ${fileName(normalized)}`);
  };

  const removeFavorite = (path: string) => {
    const updated = favoriteBatches.filter(
      (b) => normalizePath(b) !== normalizePath(path)
    );

    onUpdateFavorites(updated);
    push("system", `Removed favorite: ${fileName(path)}`);
  };

  const browseFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = osName === "windows" ? ".bat" : ".sh";

    input.onchange = (e: any) => {
      const file = e.target.files?.[0];

      // NOTE:
      // file.path works in Electron
      // browser fallback = user must paste path manually
      if (file?.path) {
        selectBatch(file.path);
      } else {
        push(
          "error",
          "Browser security blocked full path. Paste the full path manually."
        );
      }
    };

    input.click();
  };

  /* ───────────────────── render ───────────────────── */

  return (
    <div className="batch-modal">
      <div className="batch-modal-content">
        <h3>Batch Selection ({osName.toUpperCase()})</h3>

        {/* CURRENT SELECTION */}
        {selectedPath && (
          <div className="current-selection">
            <strong>Selected:</strong> {fileName(selectedPath)}
          </div>
        )}

        {/* FAVORITES */}
        <div className="favorites-list">
          {favoriteBatches.length ? (
            favoriteBatches.map((path, i) => (
              <div key={i} className="favorite-item">
                <button
                  className="favorite-btn"
                  onClick={() => selectBatch(path)}
                >
                  {fileName(path)}
                </button>
                <button
                  className="remove-btn"
                  onClick={() => removeFavorite(path)}
                  title="Remove favorite"
                >
                  ❌
                </button>
              </div>
            ))
          ) : (
            <p style={{ opacity: 0.7 }}>No favorite batches yet</p>
          )}
        </div>

        {/* INPUT */}
        <div className="new-batch">
          <input
            type="text"
            value={inputPath}
            onChange={(e) => setInputPath(e.target.value)}
            placeholder={
              osName === "windows"
                ? "C:\\Games\\Server\\start.bat"
                : "/home/user/server/start.sh"
            }
          />

          <button onClick={() => selectBatch(inputPath)}>Select</button>
          <button onClick={browseFile}>Browse</button>
        </div>

        {/* ACTIONS */}
        <div className="batch-actions">
          <button onClick={addToFavorites} disabled={!selectedPath}>
            ⭐ Add to Favorites
          </button>

          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
