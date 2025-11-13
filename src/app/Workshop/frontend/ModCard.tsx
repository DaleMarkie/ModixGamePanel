import React, { useState, useMemo } from "react";

interface ModCardProps {
  mod: {
    modId: string;
    title: string;
    image?: string;
    description?: string;
    lastUpdate?: string;
    version?: string;
    workshopVersion?: string; // latest Workshop version
    folderPath?: string; // Local Steam path
    isWorkshop?: boolean;
    rating?: number;
    votes?: number;
  };
  inList: boolean;
  isInstalled: boolean;
  onClick: () => void;
  onToggleInList: () => void;
  onAddToServer: () => void; // fallback for UI, not used if SteamCMD works
  onOpenFolder?: (folderPath: string) => void;
  activeGameAppId: string; // Current active game AppID
}

const ModCard: React.FC<ModCardProps> = ({
  mod,
  inList,
  isInstalled,
  onClick,
  onToggleInList,
  onAddToServer,
  onOpenFolder,
  activeGameAppId,
}) => {
  const [readMore, setReadMore] = useState(false);
  const [installing, setInstalling] = useState(false);

  const badges = useMemo(() => {
    const baseBadges: { text: string; color: string }[] = [];

    // Installation status
    if (mod.folderPath && isInstalled) {
      baseBadges.push({ text: "✅ Installed", color: "#1DB954" });
    } else if (mod.folderPath && !isInstalled) {
      baseBadges.push({ text: "📁 Not Active", color: "#FF6B6B" });
    } else {
      baseBadges.push({ text: "📁 Not Installed", color: "#FF6B6B" });
    }

    // Version badge
    if (mod.version)
      baseBadges.push({ text: `📦 ${mod.version}`, color: "#FFD93D" });
    // Version mismatch warning
    if (
      mod.version &&
      mod.workshopVersion &&
      mod.version !== mod.workshopVersion
    ) {
      baseBadges.push({
        text: `⚠️ Outdated (${mod.workshopVersion})`,
        color: "#FFAA00",
      });
    }

    // Last update
    if (mod.lastUpdate)
      baseBadges.push({
        text: `🕒 ${new Date(mod.lastUpdate).toLocaleDateString()}`,
        color: "#6C5CE7",
      });

    // Local + Workshop
    if (mod.folderPath && mod.isWorkshop)
      baseBadges.push({ text: "💻 Local + Workshop", color: "#00BFFF" });
    else if (mod.folderPath)
      baseBadges.push({ text: "💻 Local", color: "#00BFFF" });
    else if (mod.isWorkshop)
      baseBadges.push({ text: "🌐 Workshop", color: "#FFAA00" });

    return baseBadges;
  }, [
    mod.folderPath,
    mod.isWorkshop,
    mod.version,
    mod.workshopVersion,
    mod.lastUpdate,
    isInstalled,
  ]);

  const handleOpenFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mod.folderPath) onOpenFolder?.(mod.folderPath);
  };

  const handleInstallMod = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mod.folderPath) {
      handleOpenFolder(e);
      return;
    }

    const proceed = window.confirm(
      `⚠️ This will download "${mod.title}" from Steam Workshop via SteamCMD. Continue?`
    );
    if (!proceed) return;

    try {
      setInstalling(true);
      const response = await fetch("/api/install-mod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId: mod.modId, appId: activeGameAppId }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to install mod.");
      }

      alert(`✅ "${mod.title}" installed successfully!`);
      onAddToServer(); // Update UI / list
    } catch (err: any) {
      console.error(err);
      alert(`❌ Error installing mod: ${err.message}`);
    } finally {
      setInstalling(false);
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
      <img
        src={mod.image || "https://via.placeholder.com/80x80?text=No+Image"}
        alt={mod.title}
        style={{ width: 80, height: 80, borderRadius: 6, objectFit: "cover" }}
      />

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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
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
            {mod.rating !== undefined && (
              <span
                style={{
                  background: `linear-gradient(135deg, #FFD700 0%, #333 100%)`,
                  color: "#000",
                  padding: "2px 6px",
                  borderRadius: 10,
                  fontSize: 9,
                  fontWeight: 600,
                }}
              >
                ⭐ {mod.rating.toFixed(1)} ({mod.votes ?? 0})
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
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

            <button
              onClick={handleInstallMod}
              disabled={installing}
              style={{
                padding: "4px 8px",
                fontSize: 10,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                backgroundColor: mod.folderPath ? "#00BFFF" : "#1DB954",
                color: "#fff",
                opacity: installing ? 0.6 : 1,
              }}
            >
              {mod.folderPath
                ? "💻 Open"
                : installing
                ? "⏳ Installing..."
                : "➕ Install"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModCard;
