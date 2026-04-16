"use client";

import React from "react";

export default function BatchSelector({
  favoriteBatches,
  batchPath,
  onSelectBatch,
  onUpdateFavorites,
  onClose,
  push,
}: any) {
  const fileName = (p: string) => p.split("/").pop();

  const addFavorite = (path: string) => {
    const updated = [...new Set([...favoriteBatches, path])];
    onUpdateFavorites(updated);
    push("system", "Added to favorites");
  };

  return (
    <div className="batch-modal">
      <div className="batch-modal-content">
        <h3>Select Server Script</h3>

        {favoriteBatches.length === 0 && (
          <p style={{ opacity: 0.6 }}>No favorites yet</p>
        )}

        {favoriteBatches.map((p: string, i: number) => (
          <div key={i} style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => onSelectBatch(p)}>{fileName(p)}</button>

            <button onClick={() => addFavorite(p)}>⭐</button>
          </div>
        ))}

        <div style={{ marginTop: 12 }}>
          <input
            value={batchPath || ""}
            onChange={() => {}}
            placeholder="/home/zomboid/start.sh"
          />
        </div>

        <button onClick={onClose} style={{ marginTop: 10 }}>
          Close
        </button>
      </div>
    </div>
  );
}
