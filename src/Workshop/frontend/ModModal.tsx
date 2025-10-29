import React, { useEffect, useRef, useState } from "react";

// Thumbs Up Icon
const ThumbsUpIcon = ({ filled, ...props }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={filled ? "#1DB954" : "#aaa"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 9V5a3 3 0 0 0-6 0v4"></path>
    <path d="M5 15h14l-1.5 6h-11l-1.5-6z"></path>
  </svg>
);

// Thumbs Down Icon
const ThumbsDownIcon = ({ filled, ...props }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={filled ? "#ff4d4f" : "#aaa"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
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
  const [rating, setRating] = useState(null);

  // Generate a unique key for this mod
  const getModKey = (mod) => {
    if (!mod) return null;
    return mod.modId || mod.workshopId || mod.title.replace(/\s+/g, "-").toLowerCase();
  };

  const modKey = getModKey(mod);

  // Close modal on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Load saved notes, categories, rating
  useEffect(() => {
    if (!modKey) return;

    const savedNotes = localStorage.getItem(`mod-notes-${modKey}`);
    if (savedNotes) setNotes(savedNotes);

    const savedAssigned = localStorage.getItem(`mod-categories-${modKey}`);
    setAssignedCategories(savedAssigned ? JSON.parse(savedAssigned) : []);

    const savedRating = localStorage.getItem(`mod-rating-${modKey}`);
    setRating(savedRating === "up" || savedRating === "down" ? savedRating : null);
  }, [modKey]);

  // Load custom categories
  useEffect(() => {
    const savedCustomCats = localStorage.getItem("user-custom-categories");
    if (savedCustomCats) setCustomCategories(JSON.parse(savedCustomCats));
  }, []);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!mod) return null;

  const formatDate = (dateStr) =>
    !dateStr
      ? "N/A"
      : new Date(dateStr).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

  const toggleCategory = (cat) => {
    setAssignedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    if (!modKey) return;

    // Save locally
    localStorage.setItem(`mod-notes-${modKey}`, notes);
    localStorage.setItem(`mod-categories-${modKey}`, JSON.stringify(assignedCategories));
    localStorage.setItem(`mod-rating-${modKey}`, rating);
    localStorage.setItem("user-custom-categories", JSON.stringify(customCategories));

    // Save to backend
    fetch("/api/save-mod-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modKey,
        notes,
        categories: assignedCategories,
        rating,
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Saved to API:", data))
      .catch((err) => console.error("Failed to save notes:", err));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addNewCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !customCategories.includes(trimmed) && !assignedCategories.includes(trimmed)) {
      setCustomCategories([...customCategories, trimmed]);
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

  const onThumbsUp = () => setRating(rating === "up" ? null : "up");
  const onThumbsDown = () => setRating(rating === "down" ? null : "down");

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
    link.download = `${mod.title ? mod.title.replace(/[^\w\s]/gi, "") : "mod"}_notes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSteamDownload = () => {
    if (mod?.modId || mod?.workshopId) {
      const url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.modId || mod.workshopId}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("No workshop ID available for this mod.");
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div ref={modalRef} style={modalStyle} onClick={(e) => e.stopPropagation()} tabIndex={-1}>
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
              🧩<p>No image</p>
            </div>
          )}
        </div>

        <section style={section}>
          <h3 style={sectionTitle}>Description</h3>
          <p style={descriptionStyle}>{mod.description || "No description available."}</p>
        </section>

        <section style={section}>
          <h3 style={sectionTitle}>Info</h3>
          <div style={infoGridStyle}>
            <InfoItem label="Author" value={mod.author || "Unknown"} />
            <InfoItem label="Version" value={mod.version || "N/A"} />
            <InfoItem label="Last Updated" value={formatDate(mod.lastUpdated)} />
            <InfoItem label="File Size" value={mod.fileSize || "N/A"} />
            <InfoItem label="ID" value={mod.modId || mod.workshopId || "N/A"} />
          </div>
        </section>

        <div style={{ marginTop: 9, textAlign: "center" }}>
          <button onClick={handleSteamDownload} style={{ ...steamButtonStyle, marginBottom: 9 }}>
            ⬇️ View On Steam
          </button>
        </div>

        {/* Rating System */}
        <section style={{ ...section, textAlign: "center" }}>
          <h3 style={sectionTitle}>Your Rating</h3>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button onClick={onThumbsUp} style={{ background: "none", border: "none" }}>
              <ThumbsUpIcon filled={rating === "up"} />
            </button>
            <button onClick={onThumbsDown} style={{ background: "none", border: "none" }}>
              <ThumbsDownIcon filled={rating === "down"} />
            </button>
          </div>
        </section>

        {/* Custom Categories */}
        <section style={section}>
          <h3 style={sectionTitle}>Custom Categories</h3>
          {customCategories.length === 0 && (
            <div style={{ color: "#666", fontStyle: "italic" }}>No custom categories yet.</div>
          )}
          <div>
            {customCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => toggleCategory(cat)}
                style={{
                  ...categoryButtonStyle,
                  backgroundColor: assignedCategories.includes(cat) ? "#59a14f" : "#444",
                  color: assignedCategories.includes(cat) ? "white" : "#ccc",
                }}
                aria-pressed={assignedCategories.includes(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
            <input
              type="text"
              placeholder="Add category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={onNewCategoryKey}
              style={inputStyle}
              aria-label="New custom category"
            />
            <button onClick={addNewCategory} style={{ ...saveButtonStyle, padding: "6px 14px" }}>
              +
            </button>
          </div>
        </section>

        {/* Notes */}
        <section style={section}>
          <h3 style={sectionTitle}>Your Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={textareaStyle}
            rows={5}
            placeholder="Add your personal notes here..."
            aria-label="Mod notes"
          />
        </section>

        <div style={{ marginTop: 12, textAlign: "right" }}>
          <button onClick={handleSave} style={saveButtonStyle}>
            Save Notes & Categories
          </button>
          {saved && <span style={{ marginLeft: 12, color: "#4caf50", fontWeight: "600" }}>Saved!</span>}
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button onClick={handleDownload} style={downloadButtonStyle} aria-label="Download notes as text file">
            💾 Download Notes
          </button>
        </div>
      </div>
    </div>
  );
};
 
const InfoItem = ({ label, value }) => (
  <div style={{ marginBottom: 4 }}>
    <strong style={{ fontSize: 11, color: "#aaa" }}>{label}:</strong>{" "}
    <span style={{ fontSize: 13, color: "white" }}>{value}</span>
  </div>
);

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#121212",
  borderRadius: 8,
  width: 480,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 10px 25px rgba(0,0,0,0.9)",
  padding: 16,
  position: "relative",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  outline: "none",
  color: "white",
};

const closeButtonStyle = {
  position: "absolute",
  top: 10,
  right: 14,
  background: "transparent",
  border: "none",
  fontSize: 28,
  color: "#bbb",
  cursor: "pointer",
  lineHeight: 1,
};

const titleStyle = {
  fontSize: 20,
  fontWeight: "700",
  marginBottom: 8,
  color: "white",
};

const badgeStyle = {
  display: "inline-block",
  backgroundColor: "#59a14f",
  color: "white",
  fontSize: 11,
  fontWeight: "600",
  padding: "3px 8px",
  borderRadius: 12,
  marginBottom: 12,
};

const imageWrapperStyle = {
  width: 120,
  height: 120,
  borderRadius: 8,
  overflow: "hidden",
  margin: "0 auto 14px",
  backgroundColor: "#222",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const imageStyle = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "cover",
  display: "block",
};

const imagePlaceholderStyle = {
  fontSize: 40,
  color: "#555",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const section = {
  marginTop: 14,
};

const sectionTitle = {
  fontSize: 15,
  fontWeight: "700",
  marginBottom: 6,
  color: "white",
};

const descriptionStyle = {
  fontSize: 12,
  lineHeight: 1.4,
  color: "#ccc",
  whiteSpace: "pre-wrap",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const ratingButtonStyle = {
  border: "2px solid transparent",
  borderRadius: 8,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
  userSelect: "none",
  backgroundColor: "transparent",
};

const categoryButtonStyle = {
  margin: "4px 6px 4px 0",
  border: "none",
  borderRadius: 16,
  padding: "5px 14px",
  fontSize: 12,
  cursor: "pointer",
  userSelect: "none",
  transition: "background-color 0.25s ease, color 0.25s ease",
  backgroundColor: "#444",
  color: "#ccc",
};

const inputStyle = {
  flex: 1,
  borderRadius: 6,
  border: "1px solid #555",
  fontSize: 12,
  padding: "6px 8px",
  backgroundColor: "#222",
  color: "white",
};

const textareaStyle = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid #555",
  fontSize: 12,
  padding: 8,
  resize: "vertical",
  fontFamily: "inherit",
  color: "white",
  backgroundColor: "#222",
};

const saveButtonStyle = {
  backgroundColor: "#59a14f",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "8px 20px",
  fontSize: 14,
  fontWeight: "600",
  cursor: "pointer",
  userSelect: "none",
};

const downloadButtonStyle = {
  backgroundColor: "#444",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "8px 18px",
  fontSize: 13,
  cursor: "pointer",
  userSelect: "none",
};

const steamButtonStyle = {
  backgroundColor: "#2a7a2a",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "8px 18px",
  fontSize: 14,
  fontWeight: "600",
  cursor: "pointer",
  userSelect: "none",
};

export default ModModal;
