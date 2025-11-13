import React, { useState, useMemo } from "react";

interface ModCardProps {
  mod: {
    modId: string;
    title: string;
    image?: string;
    description?: string;
    lastUpdate?: string;
    version?: string;
    folderPath?: string; // Local Steam path
    isWorkshop?: boolean; // True if fetched from Workshop
  };
  inList: boolean;
  isInstalled: boolean;
  onClick: () => void;
  onToggleInList: () => void; // Add/Remove from selected mod list
  onAddToServer: () => void; // Install / Add to server
  onOpenFolder?: (folderPath: string) => void;
}

const ModCard: React.FC<ModCardProps> = ({
  mod,
  inList,
  isInstalled,
  onClick,
  onToggleInList,
  onAddToServer,
  onOpenFolder,
}) => {
  const [readMore, setReadMore] = useState(false);

  const badges = useMemo(() => {
    const baseBadges = [
      {
        text: isInstalled ? "✅ Added" : "📁 Not Active",
        color: isInstalled ? "#1DB954" : "#FF6B6B",
      },
      ...(mod.version ? [{ text: `📦 ${mod.version}`, color: "#FFD93D" }] : []),
      ...(mod.lastUpdate
        ? [
            {
              text: `🕒 ${new Date(mod.lastUpdate).toLocaleDateString()}`,
              color: "#6C5CE7",
            },
          ]
        : []),
    ];

    if (mod.folderPath && mod.isWorkshop)
      baseBadges.push({ text: "💻 Local + Workshop", color: "#00BFFF" });
    else if (mod.folderPath)
      baseBadges.push({ text: "💻 Local", color: "#00BFFF" });
    else if (mod.isWorkshop)
      baseBadges.push({ text: "🌐 Workshop", color: "#FFAA00" });

    return baseBadges;
  }, [
    isInstalled,
    mod.version,
    mod.lastUpdate,
    mod.folderPath,
    mod.isWorkshop,
  ]);

  const handleOpenFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mod.folderPath) onOpenFolder?.(mod.folderPath);
  };

  const handleAddToServerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mod.folderPath) handleOpenFolder(e);
    else {
      const proceed = window.confirm(
        "⚠️ The Install/Add to Server feature is still under development. Continue?"
      );
      if (proceed) onAddToServer();
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        gap: 12,
        padding: 10,
        background: "rgba(30,30,30,0.85)",
        borderRadius: 10,
        border: "1px solid #333",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(40,40,40,0.9)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "rgba(30,30,30,0.85)")
      }
    >
      {/* Image */}
      <img
        src={mod.image || "https://via.placeholder.com/80x80?text=No+Image"}
        alt={mod.title}
        style={{ width: 80, height: 80, borderRadius: 6, objectFit: "cover" }}
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3 style={{ color: "#1DB954", margin: 0, fontSize: "0.95rem" }}>
            {mod.title}
          </h3>
          <p style={{ fontSize: 10, color: "#aaa", margin: "2px 0" }}>
            🆔 {mod.modId}
          </p>
          {mod.description && (
            <p style={{ fontSize: 11, color: "#ccc", margin: "4px 0" }}>
              {readMore
                ? mod.description
                : mod.description.slice(0, 80) +
                  (mod.description.length > 80 ? "..." : "")}
              {mod.description.length > 80 && (
                <span
                  style={{
                    color: "#1DB954",
                    cursor: "pointer",
                    fontWeight: 600,
                    marginLeft: 4,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setReadMore(!readMore);
                  }}
                >
                  [{readMore ? "less" : "more"}]
                </span>
              )}
            </p>
          )}
        </div>

        {/* Badges & Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            {badges.map((b) => (
              <span
                key={b.text}
                style={{
                  background: `linear-gradient(135deg, ${b.color} 0%, #333 100%)`,
                  color: "#fff",
                  padding: "2px 6px",
                  borderRadius: 10,
                  fontSize: 9,
                  fontWeight: 600,
                }}
              >
                {b.text}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {/* Add/Remove from mod list */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleInList();
              }}
              style={{
                padding: "4px 8px",
                fontSize: 10,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                backgroundColor: inList ? "#444" : "#333",
                color: "#fff",
              }}
            >
              {inList ? "📂 Remove" : "📁 Add"}
            </button>

            {/* Install / Open */}
            <button
              onClick={handleAddToServerClick}
              style={{
                padding: "4px 8px",
                fontSize: 10,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                backgroundColor: mod.folderPath ? "#00BFFF" : "#1DB954",
                color: "#fff",
              }}
            >
              {mod.folderPath ? "💻 Open" : "➕ Install"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModCard;
