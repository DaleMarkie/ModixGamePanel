import React, { useState, useMemo } from "react";

interface ModCardProps {
  mod: {
    modId: string;
    title: string;
    image?: string;
    description?: string;
    lastUpdate?: string; // ISO timestamp
    version?: string;
    folderPath?: string;
  };
  inList: boolean;
  isInstalled: boolean;
  onClick: () => void;
  onToggleInList: () => void;
  onAddToServer: () => void;
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
    const result = [];
    result.push({
      text: isInstalled ? "✅ Added" : "📁 Not Active",
      color: isInstalled ? "#1DB954" : "#FF6B6B",
    });
    if (mod.version)
      result.push({ text: `📦 ${mod.version}`, color: "#FFD93D" });
    if (mod.lastUpdate)
      result.push({
        text: `🕒 ${new Date(mod.lastUpdate).toLocaleDateString()}`,
        color: "#6C5CE7",
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
        background: "rgba(30,30,30,0.85)",
        backdropFilter: "blur(8px)",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #333",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        maxWidth: 320,
        position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 20px rgba(0,0,0,0.6)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.5)";
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
          gap: 6,
          alignItems: "flex-end",
        }}
      >
        {badges.map((b) => (
          <span
            key={b.text}
            style={{
              background: `linear-gradient(135deg, ${b.color} 0%, #333 100%)`,
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            {b.text}
          </span>
        ))}
      </div>

      {/* Cover Image */}
      <img
        src={mod.image || "https://via.placeholder.com/300x160?text=No+Image"}
        alt={mod.title}
        style={{
          width: "100%",
          height: 160,
          objectFit: "cover",
          transition: "transform 0.3s",
        }}
      />

      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <h3
          style={{
            color: "#1DB954",
            margin: 0,
            fontWeight: 700,
            fontSize: "1.1rem",
            textShadow: "0 1px 3px rgba(0,0,0,0.7)",
          }}
        >
          {mod.title}
        </h3>

        <p style={{ fontSize: 11, color: "#aaa", margin: "4px 0" }}>
          🆔 {mod.modId}
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: 12,
            color: "#ccc",
            marginBottom: 12,
            lineHeight: 1.4,
          }}
        >
          {readMore
            ? mod.description
            : mod.description?.slice(0, 90) +
              (mod.description?.length > 90 ? "..." : "")}
          {mod.description?.length > 90 && (
            <span
              style={{
                color: "#1DB954",
                marginLeft: 6,
                cursor: "pointer",
                fontWeight: 600,
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

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleInList();
            }}
            style={{
              flex: 1,
              borderRadius: 8,
              padding: "8px 12px",
              backgroundColor: inList ? "#444" : "#333",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#555")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = inList ? "#444" : "#333")
            }
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
              borderRadius: 8,
              padding: "8px 12px",
              backgroundColor: isInstalled ? "#1DB954" : "#333",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = isInstalled
                ? "#1ed760"
                : "#555")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = isInstalled
                ? "#1DB954"
                : "#333")
            }
          >
            {isInstalled ? "📂 Open Folder" : "➕ Add to Server"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModCard;
