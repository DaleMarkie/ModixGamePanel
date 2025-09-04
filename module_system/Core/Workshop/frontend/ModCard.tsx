import React, { useState, useMemo } from "react";

interface ModCardProps {
  mod: {
    modId: string;
    title: string;
    image?: string;
    description?: string;
    lastUpdate?: string;   // ISO timestamp
    version?: string;
    folderPath?: string;   // NEW: path to mod folder
  };
  inList: boolean;
  isInstalled: boolean;
  onClick: () => void;
  onToggleInList: () => void;
  onAddToServer: () => void;
  onOpenFolder?: (folderPath: string) => void; // NEW prop
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
    const result = [];
    result.push({
      text: isInstalled ? "✅ Added" : "📁 Not Active",
      color: isInstalled ? "#013f10ff" : "#3f0301ff",
    });
    if (mod.version) result.push({ text: `📦 ${mod.version}`, color: "#003b1bff" });
    if (mod.lastUpdate)
      result.push({
        text: `🕒 ${new Date(mod.lastUpdate).toLocaleDateString()}`,
        color: "#fdcb6e",
      });
    return result;
  }, [isInstalled, mod.version, mod.lastUpdate]);

  const handleOpenFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstalled && mod.folderPath && onOpenFolder) {
      onOpenFolder(mod.folderPath);
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: "#1e1e1e",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #2a2a2a",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        maxWidth: 300,
        position: "relative",
      }}
    >
      {/* Badges */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: "flex-end",
        }}
      >
        {badges.map((b) => (
          <div
            key={b.text}
            style={{
              backgroundColor: b.color,
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {b.text}
          </div>
        ))}
      </div>

      {/* Cover Image */}
      <img
        src={mod.image || "https://via.placeholder.com/260x140?text=No+Image"}
        alt={mod.title}
        style={{ width: "100%", height: 160, objectFit: "cover" }}
      />

      <div style={{ padding: 12, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <h3 style={{ color: "#1DB954", margin: 0, fontWeight: 600, fontSize: "1rem" }}>
          {mod.title}
        </h3>

        <p style={{ fontSize: 11, color: "#999", margin: "4px 0" }}>🆔 {mod.modId}</p>

        {/* Description */}
        <p style={{ fontSize: 12, color: "#ccc", marginBottom: 8 }}>
          {readMore
            ? mod.description
            : mod.description?.slice(0, 90) + (mod.description?.length > 90 ? "..." : "")}
          {mod.description?.length > 90 && (
            <span
              style={{ color: "#1DB954", marginLeft: 4 }}
              onClick={(e) => {
                e.stopPropagation();
                setReadMore(!readMore);
              }}
            >
              [{readMore ? "less" : "more"}]
            </span>
          )}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleInList();
            }}
            style={{
              flex: 1,
              borderRadius: 6,
              padding: "6px 12px",
              backgroundColor: inList ? "#444" : "#333",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            {inList ? "📂 Remove" : "📁 Add"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              isInstalled ? handleOpenFolder(e) : onAddToServer();
            }}
            style={{
              flex: 1,
              borderRadius: 6,
              padding: "6px 12px",
              backgroundColor: isInstalled ? "#1DB954" : "#333",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            {isInstalled ? "📂 Open Folder" : "➕ Add to Server"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModCard;
