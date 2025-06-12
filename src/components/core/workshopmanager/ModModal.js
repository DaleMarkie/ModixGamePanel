import React, { useEffect, useRef, useState } from "react";

// Helper: SVG icons for thumbs up/down (clean and modern)
const ThumbsUpIcon = ({ filled, ...props }) => (
  <svg
    width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={filled ? "#1DB954" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    {...props}
  >
    <path d="M14 9V5a3 3 0 0 0-6 0v4"></path>
    <path d="M5 15h14l-1.5 6h-11l-1.5-6z"></path>
  </svg>
);

const ThumbsDownIcon = ({ filled, ...props }) => (
  <svg
    width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={filled ? "#ff4d4f" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    {...props}
  >
    <path d="M10 15v4a3 3 0 0 0 6 0v-4"></path>
    <path d="M19 9H5l1.5-6h11l1.5 6z"></path>
  </svg>
);

const ModModal = ({ mod, onClose }) => {
  const modalRef = useRef(null);

  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [assignedCategories, setAssignedCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [rating, setRating] = useState(null); // "up", "down", or null

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (mod?.workshopId) {
      const savedNotes = localStorage.getItem(`mod-notes-${mod.workshopId}`);
      if (savedNotes) setNotes(savedNotes);

      const savedAssigned = localStorage.getItem(`mod-categories-${mod.workshopId}`);
      setAssignedCategories(savedAssigned ? JSON.parse(savedAssigned) : []);

      const savedRating = localStorage.getItem(`mod-rating-${mod.workshopId}`);
      if (savedRating === "up" || savedRating === "down") {
        setRating(savedRating);
      } else {
        setRating(null);
      }
    }
  }, [mod]);

  useEffect(() => {
    const savedCustomCats = localStorage.getItem("user-custom-categories");
    if (savedCustomCats) setCustomCategories(JSON.parse(savedCustomCats));
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!mod) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleCategory = (cat) => {
    const updated = assignedCategories.includes(cat)
      ? assignedCategories.filter((c) => c !== cat)
      : [...assignedCategories, cat];
    setAssignedCategories(updated);
  };

  const handleSave = () => {
    if (mod?.workshopId) {
      localStorage.setItem(`mod-notes-${mod.workshopId}`, notes);
      localStorage.setItem(
        `mod-categories-${mod.workshopId}`,
        JSON.stringify(assignedCategories)
      );
      if (rating) {
        localStorage.setItem(`mod-rating-${mod.workshopId}`, rating);
      } else {
        localStorage.removeItem(`mod-rating-${mod.workshopId}`);
      }
    }
    localStorage.setItem(
      "user-custom-categories",
      JSON.stringify(customCategories)
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addNewCategory = () => {
    const trimmed = newCategory.trim();
    if (
      trimmed &&
      !customCategories.includes(trimmed) &&
      !assignedCategories.includes(trimmed)
    ) {
      const updatedCustom = [...customCategories, trimmed];
      setCustomCategories(updatedCustom);
      setAssignedCategories([...assignedCategories, trimmed]);
      setNewCategory("");
    }
  };

  const onNewCategoryKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNewCategory();
    }
  };

  // Rating button click handlers
  const onThumbsUp = () => {
    setRating(rating === "up" ? null : "up");
  };
  const onThumbsDown = () => {
    setRating(rating === "down" ? null : "down");
  };

  // Colors for rating states
  const upColor = "#1DB954";
  const downColor = "#ff4d4f";
  const neutralColor = "#888";

  // Download notes & description as text file
  const handleDownload = () => {
    const content = `Mod Title: ${mod.title || "Untitled Mod"}\n\nDescription:\n${
      mod.description || "No description"
    }\n\nYour Notes:\n${notes || "(No notes)"}\n\nCategories: ${
      assignedCategories.join(", ") || "None"
    }\nRating: ${rating || "None"}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      mod.title ? mod.title.replace(/[^\w\s]/gi, "") : "mod"
    }_notes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download via SteamCMD button
  const handleSteamDownload = () => {
    fetch("/api/download-mod", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workshopId: mod.workshopId }),
    })
      .then((res) => res.json())
      .then((data) => alert(data.message || data.error))
      .catch(() => alert("Failed to start SteamCMD download"));
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        ref={modalRef}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <button onClick={onClose} style={closeButtonStyle} aria-label="Close modal">
          &times;
        </button>
        <h2 style={titleStyle}>{mod.title || "Untitled Mod"}</h2>

        {mod.isActive && <div style={badgeStyle}>🟢 Active in server.ini</div>}

        <div style={imageWrapperStyle}>
          {mod.image ? (
            <img src={mod.image} alt="mod" style={imageStyle} />
          ) : (
            <div style={imagePlaceholderStyle}>
              🧩
              <p>No image</p>
            </div>
          )}
        </div>

        <section style={section}>
          <h3 style={sectionTitle}>Description</h3>
          <p style={descriptionStyle}>
            {mod.description || "No description available."}
          </p>
        </section>

        <section style={section}>
          <h3 style={sectionTitle}>Info</h3>
          <div style={infoGridStyle}>
            <InfoItem label="Author" value={mod.author || "Unknown"} />
            <InfoItem label="Version" value={mod.version || "N/A"} />
            <InfoItem label="Last Updated" value={formatDate(mod.lastUpdated)} />
            <InfoItem label="File Size" value={mod.fileSize || "N/A"} />
            <InfoItem label="ID" value={mod.workshopId || "N/A"} />
          </div>
        </section>

        {/* SteamCMD Download Button */}
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button
            onClick={handleSteamDownload}
            style={{
              ...saveButtonStyle,
              backgroundColor: "#007bff",
              marginBottom: 12,
            }}
          >
            ⬇️ Download Mod via SteamCMD
          </button>
        </div>

        {/* Rating section */}
        <section style={{ ...section, textAlign: "center" }}>
          <h3 style={sectionTitle}>Your Rating</h3>
          <div style={{ display: "inline-flex", gap: 48, justifyContent: "center" }}>
            <button
              onClick={onThumbsUp}
              aria-pressed={rating === "up"}
              aria-label="Give thumbs up"
              style={{
                ...ratingButtonStyle,
                borderColor: rating === "up" ? upColor : "transparent",
                backgroundColor: rating === "up" ? `${upColor}22` : "transparent",
                color: rating === "up" ? upColor : neutralColor,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = upColor)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = rating === "up" ? upColor : neutralColor)
              }
            >
              <ThumbsUpIcon filled={rating === "up"} />
              <span style={{ fontWeight: "600", marginTop: 6, display: "block", fontSize: 14 }}>
                Like
              </span>
            </button>

            <button
              onClick={onThumbsDown}
              aria-pressed={rating === "down"}
              aria-label="Give thumbs down"
              style={{
                ...ratingButtonStyle,
                borderColor: rating === "down" ? downColor : "transparent",
                backgroundColor: rating === "down" ? `${downColor}22` : "transparent",
                color: rating === "down" ? downColor : neutralColor,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = downColor)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = rating === "down" ? downColor : neutralColor)
              }
            >
              <ThumbsDownIcon filled={rating === "down"} />
              <span style={{ fontWeight: "600", marginTop: 6, display: "block", fontSize: 14 }}>
                Dislike
              </span>
            </button>
          </div>
        </section>

        <section style={section}>
          <h3 style={sectionTitle}>Custom Categories</h3>
          {customCategories.length === 0 && (
            <div style={{ color: "#777", fontStyle: "italic" }}>No custom categories yet.</div>
          )}
          <div>
            {customCategories.map((cat, idx) => (
              <span
                key={"customcat-" + cat}
                style={{
                  backgroundColor: getCustomCategoryColor(idx),
                  color: "#111",
                  fontWeight: "bold",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: 12,
                  marginRight: 8,
                  marginBottom: 6,
                  display: "inline-block",
                  opacity: assignedCategories.includes(cat) ? 1 : 0.4,
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => toggleCategory(cat)}
                title={assignedCategories.includes(cat) ? "Click to unassign" : "Click to assign"}
              >
                {cat}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Add new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={onNewCategoryKey}
              style={newCategoryInputStyle}
            />
            <button
              onClick={addNewCategory}
              style={addCategoryButtonStyle}
              disabled={!newCategory.trim()}
            >
              ➕ Add
            </button>
          </div>
        </section>

        <section style={section}>
          <h3 style={sectionTitle}>My Notes</h3>
          <textarea
            style={notesStyle}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add personal notes about this mod..."
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, gap: 12 }}>
            <button onClick={handleDownload} style={{ ...saveButtonStyle, backgroundColor: "#4a90e2" }}>
              📥 Download Notes
            </button>
            <button onClick={handleSave} style={saveButtonStyle}>
              {saved ? "✅ Saved" : "💾 Save Notes, Categories & Rating"}
            </button>
          </div>
        </section>

        <a href={mod.link} target="_blank" rel="noreferrer" style={linkStyle}>
          View on Steam Workshop
        </a>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div style={infoItemStyle}>
    <span style={{ fontWeight: 600, color: "#1DB954" }}>{label}:</span>
    <span style={{ marginLeft: 6, color: "#ddd" }}>{value}</span>
  </div>
);

// === Styles ===

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.9)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10000,
  backdropFilter: "blur(8px)",
};

const modalStyle = {
  backgroundColor: "#202020",
  color: "#eee",
  padding: "32px 28px",
  borderRadius: 14,
  maxWidth: 720,
  width: "90%",
  maxHeight: "90vh",
  boxShadow: "0 14px 48px rgba(0,0,0,0.85)",
  overflowY: "auto",
  position: "relative",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const closeButtonStyle = {
  position: "absolute",
  top: 20,
  right: 20,
  background: "transparent",
  border: "none",
  fontSize: 30,
  color: "#888",
  cursor: "pointer",
};

const titleStyle = {
  marginTop: 0,
  marginBottom: 10,
  fontWeight: "700",
  fontSize: "2.3rem",
  color: "#1DB954",
  textAlign: "center",
};

const badgeStyle = {
  backgroundColor: "#1DB954",
  color: "#111",
  fontWeight: "bold",
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "13px",
  marginTop: 12,
};

const imageWrapperStyle = {
  width: "100%",
  maxHeight: 280,
  overflow: "hidden",
  borderRadius: 10,
  marginBottom: 28,
  backgroundColor: "#121212",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const imageStyle = {
  width: "100%",
  height: "auto",
  objectFit: "cover",
  borderRadius: 10,
};

const imagePlaceholderStyle = {
  textAlign: "center",
  color: "#555",
  padding: 20,
  fontSize: 40,
};

const section = { marginBottom: 28 };

const sectionTitle = {
  fontSize: 20,
  fontWeight: "600",
  borderBottom: "3px solid #1DB954",
  paddingBottom: 8,
  marginBottom: 14,
  color: "#1DB954",
};

const descriptionStyle = {
  fontSize: 16,
  lineHeight: 1.65,
  color: "#ddd",
  maxHeight: 140,
  overflowY: "auto",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 18,
};

const infoItemStyle = {
  fontSize: 15,
  color: "#ccc",
  backgroundColor: "#2c2c2c",
  padding: "8px 12px",
  borderRadius: 8,
  display: "flex",
  justifyContent: "space-between",
};

const ratingButtonStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  border: "2px solid transparent",
  borderRadius: 12,
  padding: 12,
  backgroundColor: "transparent",
  cursor: "pointer",
  transition: "all 0.25s ease",
  width: 90,
  userSelect: "none",
};

const notesStyle = {
  width: "100%",
  minHeight: 100,
  backgroundColor: "#1c1c1c",
  color: "#eee",
  border: "1px solid #333",
  borderRadius: 8,
  padding: 12,
  fontSize: 14,
  resize: "vertical",
};

const saveButtonStyle = {
  backgroundColor: "#1DB954",
  border: "none",
  color: "#111",
  fontWeight: "bold",
  fontSize: 14,
  padding: "10px 18px",
  borderRadius: 8,
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const linkStyle = {
  display: "block",
  textAlign: "center",
  backgroundColor: "#1DB954",
  color: "#111",
  fontWeight: "700",
  padding: "16px 0",
  borderRadius: 10,
  textDecoration: "none",
  fontSize: 17,
  marginTop: 10,
};

const newCategoryInputStyle = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #333",
  backgroundColor: "#1c1c1c",
  color: "#eee",
  fontSize: 14,
};

const addCategoryButtonStyle = {
  backgroundColor: "#1DB954",
  border: "none",
  color: "#111",
  fontWeight: "bold",
  fontSize: 14,
  padding: "10px 18px",
  borderRadius: 8,
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const getCustomCategoryColor = (index) => {
  const colors = [
    "#ff6f91",
    "#ff9671",
    "#ffc75f",
    "#8ac6d1",
    "#665dff",
    "#d34b8f",
    "#8d6e63",
    "#ffab73",
    "#a0e7e5",
  ];
  return colors[index % colors.length];
};

export default ModModal;
