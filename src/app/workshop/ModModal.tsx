import React, { useEffect, useRef, useState } from "react";

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

      const savedAssigned = localStorage.getItem(
        `mod-categories-${mod.workshopId}`
      );
      setAssignedCategories(savedAssigned ? JSON.parse(savedAssigned) : []);

      const savedRating = localStorage.getItem(`mod-rating-${mod.workshopId}`);
      setRating(
        savedRating === "up" || savedRating === "down" ? savedRating : null
      );
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
    if (mod?.workshopId) {
      localStorage.setItem(`mod-notes-${mod.workshopId}`, notes);
      localStorage.setItem(
        `mod-categories-${mod.workshopId}`,
        JSON.stringify(assignedCategories)
      );
      rating
        ? localStorage.setItem(`mod-rating-${mod.workshopId}`, rating)
        : localStorage.removeItem(`mod-rating-${mod.workshopId}`);
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

  const upColor = "#1DB954";
  const downColor = "#ff4d4f";
  const neutralColor = "#aaa";

  const handleDownload = () => {
    const content = `Mod Title: ${
      mod.title || "Untitled Mod"
    }\n\nDescription:\n${mod.description || "No description"}\n\nYour Notes:\n${
      notes || "(No notes)"
    }\n\nCategories: ${assignedCategories.join(", ") || "None"}\nRating: ${
      rating || "None"
    }`;
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
        <button
          onClick={onClose}
          style={closeButtonStyle}
          aria-label="Close modal"
        >
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
          <p style={descriptionStyle}>
            {mod.description || "No description available."}
          </p>
        </section>

        <section style={section}>
          <h3 style={sectionTitle}>Info</h3>
          <div style={infoGridStyle}>
            <InfoItem label="Author" value={mod.author || "Unknown"} />
            <InfoItem label="Version" value={mod.version || "N/A"} />
            <InfoItem
              label="Last Updated"
              value={formatDate(mod.lastUpdated)}
            />
            <InfoItem label="File Size" value={mod.fileSize || "N/A"} />
            <InfoItem label="ID" value={mod.workshopId || "N/A"} />
          </div>
        </section>

        <div style={{ marginTop: 9, textAlign: "center" }}>
          <button
            onClick={handleSteamDownload}
            style={{ ...steamButtonStyle, marginBottom: 9 }}
          >
            ⬇️ Download Mod via SteamCMD
          </button>
        </div>

        <section style={{ ...section, textAlign: "center" }}>
          <h3 style={sectionTitle}>Your Rating</h3>
          <div
            style={{
              display: "inline-flex",
              gap: 36,
              justifyContent: "center",
            }}
          >
            <button
              onClick={onThumbsUp}
              aria-pressed={rating === "up"}
              aria-label="Give thumbs up"
              style={{
                ...ratingButtonStyle,
                borderColor: rating === "up" ? upColor : "transparent",
                backgroundColor:
                  rating === "up" ? `${upColor}22` : "transparent",
                color: rating === "up" ? upColor : neutralColor,
                width: 68,
                padding: 9,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = upColor)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  rating === "up" ? upColor : neutralColor)
              }
            >
              <ThumbsUpIcon filled={rating === "up"} />
              <span
                style={{
                  fontWeight: "600",
                  marginTop: 4,
                  display: "block",
                  fontSize: 10,
                }}
              >
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
                backgroundColor:
                  rating === "down" ? `${downColor}22` : "transparent",
                color: rating === "down" ? downColor : neutralColor,
                width: 68,
                padding: 9,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = downColor)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  rating === "down" ? downColor : neutralColor)
              }
            >
              <ThumbsDownIcon filled={rating === "down"} />
              <span
                style={{
                  fontWeight: "600",
                  marginTop: 4,
                  display: "block",
                  fontSize: 10,
                }}
              >
                Dislike
              </span>
            </button>
          </div>
        </section>

        <section style={section}>
          <h3 style={sectionTitle}>Custom Categories</h3>
          {customCategories.length === 0 && (
            <div style={{ color: "#666", fontStyle: "italic" }}>
              No custom categories yet.
            </div>
          )}
          <div>
            {customCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => toggleCategory(cat)}
                style={{
                  ...categoryButtonStyle,
                  backgroundColor: assignedCategories.includes(cat)
                    ? "#59a14f"
                    : "#444",
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
            <button
              onClick={addNewCategory}
              style={{ ...saveButtonStyle, padding: "6px 14px" }}
            >
              +
            </button>
          </div>
        </section>

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
          {saved && (
            <span
              style={{ marginLeft: 12, color: "#4caf50", fontWeight: "600" }}
            >
              Saved!
            </span>
          )}
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            onClick={handleDownload}
            style={downloadButtonStyle}
            aria-label="Download notes as text file"
          >
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
