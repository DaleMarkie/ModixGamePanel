import React, { useState } from "react";
import "./SteamParser.css";

const SteamParser = () => {
  const [input, setInput] = useState("");
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMod, setSelectedMod] = useState(null);
  const [sort, setSort] = useState("mostpopular");

  const isCollectionId = (text) => /^\d+$/.test(text.trim());

  const fetchMods = async () => {
    if (!input.trim()) {
      setError("Please enter a valid Collection ID or search term.");
      return;
    }

    setLoading(true);
    setError("");
    setMods([]);
    setSelectedMod(null);

    let url;
    if (isCollectionId(input)) {
      url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${input.trim()}`;
    } else {
      const query = encodeURIComponent(input.trim());
      url = `https://steamcommunity.com/workshop/browse/?appid=108600&searchtext=${query}&browsesort=${sort}`;
    }

    try {
      const res = await fetch(`https://corsproxy.io/?${url}`);
      if (!res.ok) throw new Error("Network response not ok");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const modItems = isCollectionId(input)
        ? Array.from(doc.querySelectorAll(".collectionItem"))
        : Array.from(doc.querySelectorAll(".workshopItem"));

      if (modItems.length === 0) {
        setError("No mods found or invalid input.");
        setLoading(false);
        return;
      }

      const parsedMods = modItems.map((item) => {
        const title =
          item.querySelector(".workshopItemTitle")?.textContent.trim() ||
          "Untitled Mod";
        const link = item.querySelector("a")?.href || "#";
        const idMatch = link.match(/id=(\d+)/);
        const modId = idMatch ? idMatch[1] : "Unknown";

        const image = item.querySelector("img")?.src || "";

        const description =
          item.querySelector(".workshopItemDescription")?.textContent.trim() ||
          "No description available.";
        const author =
          item.querySelector(".workshopItemAuthorName")?.textContent.trim() ||
          "Unknown Author";
        const subscribersText =
          item.querySelector(".numSubscribers")?.textContent || "0";
        const subscribers =
          parseInt(subscribersText.replace(/[^\d]/g, ""), 10) || 0;
        const lastUpdated =
          item.querySelector(".workshopItemUpdated")?.getAttribute("title") ||
          "";
        const fileSize =
          item.querySelector(".workshopItemFileSize")?.textContent.trim() ||
          "Unknown size";
        const tags = Array.from(
          item.querySelectorAll(".workshopItemTags .workshopTag")
        ).map((tagEl) => tagEl.textContent.trim());

        return {
          modId,
          title,
          image,
          link,
          description,
          author,
          subscribers,
          lastUpdated,
          fileSize,
          tags,
        };
      });

      setMods(parsedMods);
    } catch (err) {
      setError("Failed to fetch or parse mods. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setSelectedMod(null);

  return (
    <div
      className="boxed-container"
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ color: "#1DB954", marginBottom: "16px" }}>
        Steam Workshop Mod Search & Collection Parser
      </h2>

      <input
        type="text"
        placeholder="Enter Steam Collection ID or search mods by name"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") fetchMods();
        }}
        style={{
          padding: "10px",
          width: "100%",
          borderRadius: "6px",
          border: "1px solid #1DB954",
          backgroundColor: "#121212",
          color: "white",
          marginBottom: "16px",
          fontSize: "16px",
        }}
      />

      {!isCollectionId(input) && (
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="sort-select"
            style={{ color: "#1DB954", marginRight: "10px", fontWeight: "600" }}
          >
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #1DB954",
              backgroundColor: "#121212",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <option value="mostpopular">Most Popular</option>
            <option value="subscriptions">Most Subscribed</option>
            <option value="trending">Trending</option>
            <option value="lastupdated">Last Updated</option>
            <option value="mostrecent">Most Recent</option>
          </select>
        </div>
      )}

      <button
        onClick={fetchMods}
        style={{
          padding: "10px 20px",
          backgroundColor: "#1DB954",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px",
          fontWeight: "600",
          fontSize: "16px",
        }}
      >
        Fetch Mods
      </button>

      {loading && <p style={{ color: "white" }}>Loading mods...</p>}
      {error && <p style={{ color: "#e55353" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "20px",
        }}
      >
        {mods.map((mod) => (
          <div
            key={mod.modId}
            onClick={() => setSelectedMod(mod)}
            style={{
              backgroundColor: "#222222",
              padding: "12px",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(29, 185, 84, 0.5)",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <img
              src={mod.image}
              alt={mod.title}
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "10px",
                objectFit: "cover",
                height: "100px",
              }}
            />
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#1DB954",
                marginBottom: "6px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={mod.title}
            >
              {mod.title}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#bbbbbb",
                userSelect: "text",
              }}
            >
              Mod ID: {mod.modId}
            </div>
          </div>
        ))}
      </div>

      {selectedMod && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            overflowY: "auto",
            padding: "20px",
          }}
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "700px",
              width: "100%",
              color: "white",
              boxShadow: "0 0 20px #1DB954",
            }}
          >
            <h3 style={{ marginBottom: "12px", color: "#1DB954" }}>
              {selectedMod.title}
            </h3>
            <img
              src={selectedMod.image}
              alt={selectedMod.title}
              style={{
                width: "100%",
                borderRadius: "12px",
                marginBottom: "16px",
                maxHeight: "300px",
                objectFit: "cover",
              }}
            />
            <p>{selectedMod.description}</p>
            <p>
              <strong>Author:</strong> {selectedMod.author}
            </p>
            <p>
              <strong>Subscribers:</strong>{" "}
              {selectedMod.subscribers.toLocaleString()}
            </p>
            <p>
              <strong>Last Updated:</strong> {selectedMod.lastUpdated}
            </p>
            <p>
              <strong>File Size:</strong> {selectedMod.fileSize}
            </p>
            <p>
              <strong>Tags:</strong> {selectedMod.tags.join(", ")}
            </p>
            <a
              href={selectedMod.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#1DB954",
                fontWeight: "600",
                textDecoration: "underline",
                display: "inline-block",
                marginTop: "12px",
              }}
            >
              View on Steam Workshop
            </a>
            <button
              onClick={closeModal}
              style={{
                marginTop: "20px",
                backgroundColor: "#1DB954",
                color: "black",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          backgroundColor: "#121212",
          borderRadius: "12px",
          boxShadow: "0 0 15px #1DB954",
          color: "white",
          fontSize: "16px",
          lineHeight: "1.5",
        }}
      >
        <h2 style={{ color: "#1DB954", marginBottom: "12px" }}>
          About Munatall - Installation Guide
        </h2>
        <p>
          <strong>Munatall</strong> is a popular Project Zomboid server mod that
          enhances gameplay with new features, balancing, and content. To
          install Munatall on your Linux server using SteamCMD, follow these
          steps:
        </p>
        <ol style={{ marginLeft: "20px", marginTop: "12px" }}>
          <li>
            <code>Install SteamCMD</code> if you don't have it already:
            <pre
              style={{
                backgroundColor: "#222",
                padding: "10px",
                borderRadius: "6px",
                overflowX: "auto",
                marginTop: "8px",
                color: "#1DB954",
              }}
            >
              sudo apt update && sudo apt install steamcmd
            </pre>
          </li>
          <li>
            <code>Login anonymously</code> to SteamCMD:
            <pre
              style={{
                backgroundColor: "#222",
                padding: "10px",
                borderRadius: "6px",
                overflowX: "auto",
                marginTop: "8px",
                color: "#1DB954",
              }}
            >
              steamcmd +login anonymous
            </pre>
          </li>
          <li>
            <code>Set the installation directory</code> for Project Zomboid
            (example path):
            <pre
              style={{
                backgroundColor: "#222",
                padding: "10px",
                borderRadius: "6px",
                overflowX: "auto",
                marginTop: "8px",
                color: "#1DB954",
              }}
            >
              force_install_dir /home/yourusername/pzserver/
            </pre>
          </li>
          <li>
            <code>Install or update Project Zomboid server</code> (AppID:
            380870):
            <pre
              style={{
                backgroundColor: "#222",
                padding: "10px",
                borderRadius: "6px",
                overflowX: "auto",
                marginTop: "8px",
                color: "#1DB954",
              }}
            >
              app_update 380870 validate
            </pre>
          </li>
          <li>
            <code>Download and install Munatall mod</code> using Steam Workshop:
            <pre
              style={{
                backgroundColor: "#222",
                padding: "10px",
                borderRadius: "6px",
                overflowX: "auto",
                marginTop: "8px",
                color: "#1DB954",
              }}
            >
              workshop_download_item 108600 2478803348
            </pre>
            <p style={{ marginTop: "8px" }}>
              (Replace <code>2478803348</code> with the Munatall Steam Workshop
              mod ID)
            </p>
          </li>
          <li>
            <code>Exit SteamCMD</code>:
            <pre
              style={{
                backgroundColor: "#222",
                padding: "10px",
                borderRadius: "6px",
                overflowX: "auto",
                marginTop: "8px",
                color: "#1DB954",
              }}
            >
              quit
            </pre>
          </li>
          <li>
            <p>
              Finally, configure your Project Zomboid server to enable Munatall
              in the mods list and start your server.
            </p>
          </li>
        </ol>
        <p>
          For more detailed setup and troubleshooting, please visit the official
          Munatall Steam Workshop page or community forums.
        </p>
      </div>
    </div>
  );
};

export default SteamParser;
