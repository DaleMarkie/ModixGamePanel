import React, { useState, useEffect, useMemo } from "react";

const ModCard = ({
  mod,
  isFavorite,
  inList,
  onClick,
  onContextMenu,
  onToggleFavorite,
  onToggleInList,
}) => {
  const [readMore, setReadMore] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Fetching...");
  const [ratingInfo, setRatingInfo] = useState(null);
  const [fetchedDescription, setFetchedDescription] = useState("");

  // Determine badges to show (could be multiple if active + steamId)
  const badges = useMemo(() => {
    const result = [];
    if (mod.active) {
      result.push({ text: "🟢 Active", color: "#1DB954" });
    }
    if (mod.steamId) {
      result.push({ text: "🛒 Steam Workshop", color: "#29a37e" });
    } else if (mod.isInstalled) {
      result.push({ text: "🟡 Installed", color: "#f0ad4e" });
    } else if (!mod.active && !mod.steamId) {
      // Only show SteamCMD if none of the above
      result.push({ text: "🛠️ SteamCMD", color: "#3b5b89" });
    }
    return result;
  }, [mod.active, mod.steamId, mod.isInstalled]);

  useEffect(() => {
    if (!mod.steamId) {
      setLastUpdated("N/A");
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(
          "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itemcount: 1,
              publishedfileids: [mod.steamId],
            }),
          }
        );
        const data = await res.json();
        const details = data?.response?.publishedfiledetails?.[0];
        if (details?.time_updated) {
          setLastUpdated(
            new Date(details.time_updated * 1000).toLocaleDateString()
          );
        } else {
          setLastUpdated("Unknown");
        }

        if (details?.vote_data) {
          setRatingInfo({
            score: details.vote_data.score,
            up: details.vote_data.votes_up,
            down: details.vote_data.votes_down,
          });
        }

        if (details?.description) {
          setFetchedDescription(details.description);
        }
      } catch (err) {
        console.error("Steam API error:", err);
        setLastUpdated("Error");
      }
    };

    fetchDetails();
  }, [mod.steamId]);

  const getStars = (score) => {
    const fullStars = Math.round(score * 5);
    return "⭐".repeat(fullStars) + "✩".repeat(5 - fullStars);
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{
        background: "linear-gradient(145deg, #1e1e1e, #151515)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
        border: isFavorite ? "2px solid #FFD700" : "1px solid #2a2a2a",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        maxWidth: 300,
        transition: "transform 0.15s ease-in-out",
        position: "relative",
      }}
    >
      {/* Multiple badges */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          gap: 6,
          zIndex: 2,
          userSelect: "none",
        }}
      >
        {badges.map(({ text, color }) => (
          <div
            key={text}
            style={{
              backgroundColor: color,
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* Installed label if applicable (optional duplication? maybe remove if badges suffice) */}
      {mod.isInstalled && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "#1DB954",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            zIndex: 2,
            userSelect: "none",
          }}
        >
          ✅ Installed
        </div>
      )}

      {/* Cover image */}
      <img
        src={mod.image}
        alt={mod.title}
        style={{
          width: "100%",
          height: 160,
          objectFit: "cover",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />

      <div
        style={{
          padding: 14,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <h3
          style={{
            fontSize: "1.05rem",
            margin: "0 0 6px",
            color: "#1DB954",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: 600,
          }}
        >
          {mod.title}
        </h3>

        {mod.modId && (
          <p
            style={{
              fontSize: 11,
              color: "#999",
              margin: "0 0 4px",
              wordBreak: "break-all",
            }}
          >
            🆔 <strong>{mod.modId}</strong>
          </p>
        )}

        <p
          style={{
            fontSize: "0.8rem",
            marginBottom: 8,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          👤{" "}
          {mod.authorSteamId || mod.authorId ? (
            <a
              href={
                mod.authorSteamId
                  ? `https://steamcommunity.com/profiles/${mod.authorSteamId}`
                  : `https://steamcommunity.com/id/${mod.authorId}`
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1DB954", textDecoration: "underline" }}
              onClick={(e) => e.stopPropagation()}
            >
              {mod.author}
            </a>
          ) : (
            mod.author
          )}
        </p>

        <div
          style={{
            fontSize: 12,
            color: "#888",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            gap: 10,
          }}
        >
          <span>⭐ {mod.subscribers?.toLocaleString?.() || 0}</span>
          <span>📦 {mod.fileSize}</span>
        </div>

        {ratingInfo && (
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 6 }}>
            <div style={{ marginBottom: 4 }}>
              <strong>Rating:</strong> {getStars(ratingInfo.score)} (
              {(ratingInfo.score * 5).toFixed(1)}/5)
            </div>
            <div>
              👍 {ratingInfo.up?.toLocaleString?.() || 0} / 👎{" "}
              {ratingInfo.down?.toLocaleString?.() || 0}
            </div>
          </div>
        )}

        <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
          <strong>Version:</strong> {mod.version || "N/A"} <br />
          <strong>Updated:</strong> {lastUpdated}
        </div>

        {mod.tags?.length > 0 && (
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {mod.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: "#2e2e2e",
                  color: "#1DB954",
                  borderRadius: 16,
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description with read more toggle */}
        <p
          style={{
            fontSize: 12,
            color: "#ccc",
            overflow: "hidden",
            maxHeight: readMore ? "none" : 48,
            cursor: "pointer",
            marginBottom: 8,
            lineHeight: 1.4,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setReadMore(!readMore);
          }}
        >
          {readMore
            ? fetchedDescription ||
              mod.description ||
              "No description available."
            : (
                fetchedDescription ||
                mod.description ||
                "No description available."
              ).slice(0, 90) +
              ((fetchedDescription || mod.description || "").length > 90
                ? "..."
                : "")}
          {(fetchedDescription || mod.description)?.length > 90 && (
            <span style={{ color: "#1DB954", marginLeft: 6 }}>
              [{readMore ? "less" : "more"}]
            </span>
          )}
        </p>

        {/* Display Steam Workshop ID at bottom if present */}
        {mod.steamId && (
          <p
            style={{
              fontSize: 11,
              color: "#666",
              marginTop: "auto",
              userSelect: "text",
              wordBreak: "break-all",
            }}
          >
            🆔 Steam Workshop ID: <strong>{mod.steamId}</strong>
          </p>
        )}

        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            style={{
              ...cardButton,
              backgroundColor: isFavorite ? "#b23f3f" : "#1DB954",
            }}
          >
            {isFavorite ? "💔 Unfav" : "❤️ Fav"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleInList();
            }}
            style={{
              ...cardButton,
              backgroundColor: inList ? "#444" : "#444",
              opacity: mod.isInstalled ? 0.5 : 1,
              pointerEvents: mod.isInstalled ? "none" : "auto",
            }}
            disabled={mod.isInstalled}
          >
            {mod.isInstalled ? "✅ Installed" : inList ? "📂 Remove" : "📁 Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

const cardButton = {
  border: "none",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 500,
  color: "#fff",
  cursor: "pointer",
  flex: 1,
  transition: "background-color 0.2s",
};

export default ModCard;
