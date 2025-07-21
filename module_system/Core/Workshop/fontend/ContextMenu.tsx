import React, { forwardRef, useState, useEffect } from "react";

const ContextMenu = forwardRef(({ x, y, mod, onClose, color }, ref) => {
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState("");
  const NOTES_KEY = "pz_modNotes";

  const primaryColor = color || "#1DB954";
  const bg = "#121212";
  const border = "#2a2a2a";
  const text = "#ddd";

  useEffect(() => {
    if (mod?.modId && showNotes) {
      const storedNotes = JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
      setNoteText(storedNotes[mod.modId] || "");
    }
  }, [mod?.modId, showNotes]);

  const shadeColor = (color, percent) => {
    const f = parseInt(color.slice(1), 16);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;
    const R = f >> 16;
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;
    return (
      "#" +
      (
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
      )
        .toString(16)
        .slice(1)
    );
  };

  const handleCopyModId = async () => {
    try {
      await navigator.clipboard.writeText(mod.modId);
      alert(`Copied mod ID: ${mod.modId}`);
    } catch {
      alert("Failed to copy mod ID");
    }
    onClose();
  };

  const handleOpenWorkshop = () => {
    window.open(
      `https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.modId}`,
      "_blank"
    );
    onClose();
  };

  const handleSaveNotes = () => {
    const existing = JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
    existing[mod.modId] = noteText;
    localStorage.setItem(NOTES_KEY, JSON.stringify(existing));
    setShowNotes(false);
  };

  if (!mod || typeof onClose !== "function" || x == null || y == null)
    return null;

  const menuItems = [
    { label: "📋 Copy Mod ID", action: handleCopyModId },
    {
      label: "♻️ Reinstall",
      action: () => alert(`Reinstalling: ${mod.title}`),
    },
    { label: "📝 Notes", action: () => setShowNotes(true) },
    { label: "🌐 Steam Workshop", action: handleOpenWorkshop },
  ];

  return (
    <>
      <nav
        ref={ref}
        aria-label="Mod context menu"
        style={{
          ...styles.menu,
          top: typeof y === "number" ? `${y}px` : y,
          left: typeof x === "number" ? `${x}px` : x,
          backgroundColor: bg,
          borderColor: border,
          color: text,
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <h3 style={{ ...styles.title, color: primaryColor }} title={mod.title}>
          {mod.title.length > 25 ? mod.title.slice(0, 22) + "..." : mod.title}
        </h3>

        {menuItems.map(({ label, action }) => (
          <button
            key={label}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action();
            }}
            style={{
              ...styles.menuItem,
              color: primaryColor,
              borderColor: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = shadeColor(
                primaryColor,
                90
              ))
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            onMouseDown={(e) => e.preventDefault()}
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          onClick={onClose}
          style={{ ...styles.closeButton, backgroundColor: primaryColor }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = shadeColor(
              primaryColor,
              -15
            ))
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = primaryColor)
          }
          onMouseDown={(e) => e.preventDefault()}
        >
          ❌ Close
        </button>
      </nav>

      {showNotes && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notes-title"
          onMouseDown={() => setShowNotes(false)}
          style={styles.modalOverlay}
        >
          <section
            onMouseDown={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            <h2 id="notes-title" style={{ marginBottom: 12 }}>
              📝 Notes for {mod.title}
            </h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              style={styles.textarea}
              autoFocus
              spellCheck={false}
            />
            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowNotes(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                style={{ ...styles.saveButton, backgroundColor: primaryColor }}
              >
                Save
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
});

const styles = {
  menu: {
    position: "absolute",
    border: "1px solid",
    borderRadius: 6,
    padding: "10px 12px",
    minWidth: 200,
    maxWidth: 260,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    userSelect: "none",
    zIndex: 10000,
    boxShadow: "0 3px 10px rgba(0,0,0,0.8)",
  },
  title: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 12,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    userSelect: "text",
  },
  menuItem: {
    width: "100%",
    padding: "7px 12px",
    fontSize: 13,
    fontWeight: 600,
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 4,
    textAlign: "left",
    cursor: "pointer",
    marginBottom: 8,
    transition: "background-color 0.15s ease",
    userSelect: "none",
  },
  closeButton: {
    width: "100%",
    padding: "8px 12px",
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    marginTop: 6,
    transition: "background-color 0.2s ease",
    userSelect: "none",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10001,
  },
  modalContent: {
    background: "#121212",
    padding: 20,
    borderRadius: 8,
    color: "#ddd",
    width: 360,
    maxWidth: "90vw",
    boxShadow: "0 0 12px rgba(0,0,0,0.7)",
  },
  textarea: {
    width: "100%",
    height: 130,
    background: "#222",
    color: "#eee",
    border: "1px solid #444",
    padding: 8,
    borderRadius: 5,
    fontFamily: "inherit",
    fontSize: 13,
    resize: "vertical",
    userSelect: "text",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  cancelButton: {
    padding: "8px 18px",
    backgroundColor: "#444",
    border: "none",
    borderRadius: 6,
    fontWeight: "600",
    color: "#ddd",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  saveButton: {
    padding: "8px 18px",
    border: "none",
    borderRadius: 6,
    fontWeight: "600",
    color: "#111",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};

export default ContextMenu;
