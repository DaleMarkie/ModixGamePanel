import React, { useState, useEffect, useRef } from "react";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3000,
  },
  modal: {
    backgroundColor: "#1c1c1c",
    padding: 24,
    borderRadius: 12,
    width: "90%",
    maxWidth: 500,
    boxShadow: "0 0 15px rgba(0,0,0,0.7)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "600",
  },
  textarea: {
    width: "100%",
    height: 180,
    backgroundColor: "#2a2a2a",
    border: "1px solid #444",
    color: "#fff",
    padding: 12,
    borderRadius: 6,
    resize: "vertical",
    fontSize: 14,
    fontFamily: "inherit",
  },
  actions: {
    marginTop: 16,
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: "#555",
    color: "#ddd",
  },
  cancelButtonHover: {
    backgroundColor: "#666",
  },
  saveButton: {
    backgroundColor: "#1DB954",
    color: "#fff",
  },
  saveButtonHover: {
    backgroundColor: "#17a347",
  },
  disabledButton: {
    backgroundColor: "#444",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  errorText: {
    color: "#ff5555",
    marginTop: 8,
    fontSize: 13,
  },
  loadingText: {
    color: "#ccc",
    marginTop: 8,
    fontSize: 13,
  },
};

const ModNotesModal = ({ mod, onClose }) => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  // Fetch notes when modal opens or mod changes
  useEffect(() => {
    if (!mod?.id) return;

    setLoading(true);
    setError(null);

    fetch(`/api/mods/notes/${mod.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch notes");
        return res.json();
      })
      .then((data) => setNotes(data.notes || ""))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [mod]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (!loading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [loading]);

  // Handle keyboard: close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSave = () => {
    setSaving(true);
    setError(null);

    fetch(`/api/mods/notes/${mod.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save notes");
        return res.json();
      })
      .then(() => {
        onClose();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modNotesTitle"
      style={styles.overlay}
    >
      <div style={styles.modal}>
        <h2 id="modNotesTitle" style={styles.header}>
          Notes for: {mod.name}
        </h2>

        {loading ? (
          <p style={styles.loadingText}>Loading notes...</p>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={styles.textarea}
              placeholder="Add your notes here..."
              aria-label={`Notes for ${mod.name}`}
              disabled={saving}
            />
            {error && (
              <p role="alert" style={styles.errorText}>
                {error}
              </p>
            )}

            <div style={styles.actions}>
              <button
                type="button"
                onClick={onClose}
                style={{ ...styles.button, ...styles.cancelButton }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    styles.cancelButtonHover.backgroundColor)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    styles.cancelButton.backgroundColor)
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                style={{
                  ...styles.button,
                  ...styles.saveButton,
                  ...(saving ? styles.disabledButton : {}),
                }}
                disabled={saving}
                onMouseOver={(e) =>
                  !saving &&
                  (e.currentTarget.style.backgroundColor =
                    styles.saveButtonHover.backgroundColor)
                }
                onMouseOut={(e) =>
                  !saving &&
                  (e.currentTarget.style.backgroundColor =
                    styles.saveButton.backgroundColor)
                }
              >
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModNotesModal;
