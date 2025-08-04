"use client";

import React, { useState, useEffect } from "react";

type ModItem = {
  id: string;
  name: string;
  workshopId: string;
};

const exampleMods: ModItem[] = [
  {
    id: "mod1",
    name: "Super Zombies Mod",
    workshopId: "123456789",
  },
  {
    id: "mod2",
    name: "Better Graphics Pack",
    workshopId: "987654321",
  },
  {
    id: "mod3",
    name: "Enhanced Weaponry",
    workshopId: "234567890",
  },
];

const LoadOrderEditorExample = () => {
  const [mods, setMods] = useState<ModItem[]>(exampleMods);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [undoStack, setUndoStack] = useState<ModItem[][]>([]);
  const [showCopied, setShowCopied] = useState(false);

  // Drag handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);

    const updated = [...mods];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, dragged);

    setMods(updated);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Undo last reorder
  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setMods(previous);
    setUndoStack(undoStack.slice(0, -1));
  };

  // Save order (simulate API call with delay)
  const saveOrder = async () => {
    setSaving(true);
    // Push current mods to undo stack before saving
    setUndoStack((stack) => [...stack, mods]);

    const modsLine = mods.map((m) => m.workshopId).join(";");
    // Simulate network/save delay
    await new Promise((r) => setTimeout(r, 600));

    alert(`Your server.ini Mods= line:\nMods=${modsLine}`);
    setSaving(false);
  };

  // Sort by Workshop ID ascending (numerical)
  const sortByWorkshopId = () => {
    setUndoStack((stack) => [...stack, mods]);
    const sorted = [...mods].sort(
      (a, b) => Number(a.workshopId) - Number(b.workshopId)
    );
    setMods(sorted);
  };

  // Copy Mods= line to clipboard and show confirmation
  const copyToClipboard = () => {
    const modsLine = mods.map((m) => m.workshopId).join(";");
    navigator.clipboard.writeText(`Mods=${modsLine}`);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100 max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-green-400 flex items-center gap-3">
          📊 Project Zomboid Load Order Editor
        </h1>
        <p className="text-zinc-400 mt-2">
          Drag mods to reorder them manually, or use the sort button to sort by
          Workshop ID (numeric server.ini order).
        </p>
      </header>

      <section className="max-w-xl mx-auto space-y-2">
        {mods.map((mod, index) => (
          <div
            key={mod.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            tabIndex={0}
            role="button"
            aria-grabbed={dragIndex === index}
            aria-describedby={`mod-${mod.id}-desc`}
            className={`p-4 rounded bg-zinc-800 border border-zinc-700 shadow-sm mb-2 cursor-move flex justify-between items-center
              ${
                dragOverIndex === index ? "bg-green-700 border-green-500" : ""
              } hover:bg-zinc-700 transition`}
          >
            <div>
              <div className="font-semibold">{mod.name}</div>
              <div
                id={`mod-${mod.id}-desc`}
                className="text-xs text-zinc-400 select-all"
              >
                Workshop ID: {mod.workshopId}
              </div>
            </div>
            <span className="text-zinc-500 select-none" aria-hidden="true">
              ↕
            </span>
          </div>
        ))}
      </section>

      <section className="mt-10 flex flex-wrap gap-4 max-w-xl mx-auto">
        <button
          onClick={saveOrder}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded shadow transition"
        >
          {saving ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          ) : (
            "💾 Show server.ini Mods= line"
          )}
        </button>

        <button
          onClick={sortByWorkshopId}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded shadow transition"
        >
          🔢 Sort by Workshop ID (server.ini order)
        </button>

        <button
          onClick={undo}
          disabled={undoStack.length === 0 || saving}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded shadow transition"
          title="Undo last reorder"
        >
          ↩️ Undo
        </button>

        <button
          onClick={copyToClipboard}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded shadow transition"
          title="Copy Mods= line to clipboard"
        >
          📋 Copy Mods= line
        </button>
      </section>

      {showCopied && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-700 text-white px-6 py-3 rounded shadow-lg select-none z-50">
          Copied to clipboard!
        </div>
      )}

      <section className="mt-8 max-w-xl mx-auto bg-zinc-900 p-4 rounded text-green-400 font-mono whitespace-pre-wrap select-all">
        Mods={mods.map((m) => m.workshopId).join(";")}
      </section>
    </main>
  );
};

export default LoadOrderEditorExample;
