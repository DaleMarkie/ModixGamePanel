import React, { forwardRef, useState, useEffect } from "react";

const ContextMenu = forwardRef(({ x, y, mod, onClose, onOpenNotes, color }, ref) => {
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState("");
  const NOTES_KEY = "pz_modNotes";

  const primaryColor = color || "#1DB954";
  const bg = "#1a1a1a";
  const border = "#333";
  const text = "#eee";

  useEffect(() => {
    if (mod?.modId) {
      const storedNotes = JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
      setNoteText(storedNotes[mod.modId] || "");
    }
  }, [showNotes, mod?.modId]);

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
    window.open(`https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.modId}`, "_blank");
    onClose();
  };

  const handleOpenNotes = () => {
    setTimeout(() => setShowNotes(true), 10);
    onClose();
  };

  const handleCloseNotes = () => setShowNotes(false);

  const handleSaveNotes = () => {
    const existing = JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
    existing[mod.modId] = noteText;
    localStorage.setItem(NOTES_KEY, JSON.stringify(existing));
    setShowNotes(false);
  };

  const menuItems = [
    { label: "📋 Copy Mod ID", action: handleCopyModId },
    { label: "♻️ Reinstall", action: () => alert(`Reinstalling: ${mod.title}`) },
    { label: "🌐 Steam Workshop", action: handleOpenWorkshop },
  ];

  function shadeColor(color, percent) {
    let f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = Math.abs(percent) / 100,
      R = f >> 16,
      G = (f >> 8) & 0x00ff,
      B = f & 0x0000ff;
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
  }

  if (!mod || typeof onClose !== "function" || x == null || y == null) return null;

  return (
    <>
      <div
        ref={ref}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: typeof y === "number" ? y + "px" : y,
          left: typeof x === "number" ? x + "px" : x,
          backgroundColor: bg,
          border: `1px solid ${border}`,
          borderRadius: 8,
          padding: 16,
          minWidth: 260,
          color: text,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          userSelect: "none",
          zIndex: 10000,
        }}
        onContextMenu={(e) => e.preventDefault()}
        role="menu"
      >
        <h3 style={{ color: primaryColor, fontWeight: "700", fontSize: 18, marginBottom: 16 }}>
          {mod.title}
        </h3>

        {menuItems.map(({ label, action }) => (
          <button
            key={label}
            onClick={(e) => {
              e.stopPropagation();
              action();
            }}
            type="button"
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 600,
              color: primaryColor,
              backgroundColor: "transparent",
              border: "1.5px solid transparent",
              borderRadius: 6,
              textAlign: "left",
              cursor: "pointer",
              marginBottom: 10,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = primaryColor)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
            onMouseDown={(e) => e.preventDefault()}
          >
            {label}
          </button>
        ))}

        <button
          onClick={onClose}
          type="button"
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 15,
            fontWeight: "700",
            color: "#111",
            backgroundColor: primaryColor,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginTop: 10,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = shadeColor(primaryColor, -15))
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = primaryColor)
          }
          onMouseDown={(e) => e.preventDefault()}
        >
          ❌ Close
        </button>
      </div>

      {showNotes && (
        <div
          onMouseDown={handleCloseNotes}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
          }}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: "#1a1a1a",
              padding: 24,
              borderRadius: 10,
              color: "#eee",
              width: 400,
              maxWidth: "90vw",
              boxShadow: "0 0 10px rgba(0,0,0,0.6)",
            }}
          >
            <h2 style={{ marginBottom: 12 }}>📝 Notes for {mod.title}</h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              style={{
                width: "100%",
                height: 150,
                background: "#111",
                color: "#fff",
                border: "1px solid #444",
                padding: 8,
                borderRadius: 6,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
              <button
                onClick={handleCloseNotes}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#444",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: "bold",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                style={{
                  padding: "10px 20px",
                  backgroundColor: primaryColor,
                  border: "none",
                  borderRadius: 6,
                  fontWeight: "bold",
                  color: "#111",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ContextMenu;
