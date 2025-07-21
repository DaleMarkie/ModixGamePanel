import { useState, useEffect } from "react";

const NOTES_KEY = "mod_notes_storage";

export default function useModNotes(modId) {
  const [notes, setNotes] = useState({});

  useEffect(() => {
    // Load notes from localStorage once
    try {
      const stored = localStorage.getItem(NOTES_KEY);
      if (stored) setNotes(JSON.parse(stored));
    } catch {}
  }, []);

  // Get current mod note
  const note = modId ? notes[modId] || "" : "";

  // Save note for modId and persist
  function saveNote(newNote) {
    if (!modId) return;
    const updated = { ...notes, [modId]: newNote };
    setNotes(updated);
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
    } catch {}
  }

  return [note, saveNote];
}
