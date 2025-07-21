import React, { useState, useEffect, useCallback, useRef } from "react";

const STATUS_OPTIONS = [
  { value: "working", label: "Working" },
  { value: "bugged", label: "Bugged" },
  { value: "not_finished", label: "Not Finished" },
  { value: "unknown", label: "Unknown" },
];

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 24,
    width: "min(480px, 90vw)",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
    animation: "slideIn 0.25s ease",
    color: "white",
    outline: "none",
  },
  header: {
    margin: 0,
    marginBottom: 16,
    fontSize: 22,
    fontWeight: "600",
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
  },
  select: {
    backgroundColor: "#333",
    border: "none",
    borderRadius: 4,
    color: "white",
    padding: "6px 12px",
    fontSize: 14,
    cursor: "pointer",
    flexGrow: 1,
  },
  textarea: {
    flexGrow: 1,
    backgroundColor: "#333",
    border: "none",
    borderRadius: 6,
    color: "white",
    padding: 12,
    resize: "vertical",
    fontSize: 14,
    fontFamily: "inherit",
    marginTop: 12,
    marginBottom: 8,
    minHeight: 140,
    lineHeight: 1.4,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#bbb",
    userSelect: "none",
    marginBottom: 16,
  },
  btnGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
  btnCancel: {
    backgroundColor: "#555",
    border: "none",
    borderRadius: 6,
    color: "white",
    padding: "10px 20px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  btnCancelHover: {
    backgroundColor: "#666",
  },
  btnSave: {
    backgroundColor: "#1DB954",
    border: "none",
    borderRadius: 6,
    color: "white",
    padding: "10px 20px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  btnSaveHover: {
    backgroundColor: "#17a44d",
  },
  // Animations can go in your global CSS instead
};

export default function ModNotesPopup({ mod, onClose }) {
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("working");
  const [cancelHover, setCancelHover] = useState(false);
  const [saveHover, setSaveHover] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!mod) return;
    fetch(`http://localhost:5000/api/modnotes/${mod.id}`)
      .then((res) => {
        if (!res.ok) return { notes: "", status: "working" };
        return res.json();
      })
      .then((data) => {
        setNotes(data.notes || "");
        setStatus(data.status || "working");
      })
      .catch(() => {
        setNotes("");
        setStatus("working");
      });
  }, [mod]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!mod) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, mod]);

  const handleSave = useCallback(() => {
    if (!mod) return;
    fetch(`http://localhost:5000/api/modnotes/${mod.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, status }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save notes");
        return res.json();
      })
      .then(() => onClose())
      .catch(() => alert("Error saving notes"));
  }, [mod, notes, status, onClose]);

  if (!mod) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modnotes-title"
      style={styles.overlay}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={styles.modal}
      >
        <h2 id="modnotes-title" style={styles.header}>
          Notes for <em>{mod.name}</em>
        </h2>

        <label htmlFor="mod-status" style={styles.label}>
          Status:
          <select
            id="mod-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.select}
          >
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <textarea
          id="mod-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write notes here..."
          maxLength={2000}
          style={styles.textarea}
          aria-describedby="notes-char-count"
        />

        <div id="notes-char-count" style={styles.charCount}>
          {notes.length} / 2000 characters
        </div>

        <div style={styles.btnGroup}>
          <button
            onClick={onClose}
            onMouseEnter={() => setCancelHover(true)}
            onMouseLeave={() => setCancelHover(false)}
            style={{
              ...styles.btnCancel,
              ...(cancelHover ? styles.btnCancelHover : {}),
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            onMouseEnter={() => setSaveHover(true)}
            onMouseLeave={() => setSaveHover(false)}
            style={{
              ...styles.btnSave,
              ...(saveHover ? styles.btnSaveHover : {}),
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
