"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

import ModCard from "./ModCard";
import ModModal from "./ModModal";
import ContextMenu from "./ContextMenu";
import "./workshop.css";

const ExportModal = ({ modIds, onClose, listName }) => {
  const textareaRef = useRef(null);
  const formattedIds = modIds.join(",");

  const fallbackCopy = () => {
    if (!textareaRef.current) return;
    textareaRef.current.select();
    document.execCommand("copy");
    alert(
      "Copied mod IDs to clipboard! Paste into server.ini → WorkshopItems="
    );
  };

  const copyAll = () => {
    navigator.clipboard
      ?.writeText(formattedIds)
      .then(() =>
        alert(
          "Copied mod IDs to clipboard! Paste into server.ini → WorkshopItems="
        )
      )
      .catch(fallbackCopy);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h3 className="modal-header">
          Export Modlist: {listName || "All Mods"}
        </h3>
        <p className="modal-instruction">
          Copy the mod IDs below and paste them into <code>server.ini</code>{" "}
          under <code>WorkshopItems=</code>
        </p>
        <textarea
          ref={textareaRef}
          readOnly
          value={formattedIds}
          className="modal-textarea"
          spellCheck={false}
        />
        <div className="modal-buttons">
          <button onClick={copyAll} className="modal-button copy-button">
            📋 Copy All
          </button>
          <button onClick={onClose} className="modal-button close-button">
            ✖ Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WorkshopPage() {
  const [input, setInput] = useState("zomboid");
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem("pz_favorites") || "[]")
  );
  const [modlists, setModlists] = useState(() =>
    JSON.parse(localStorage.getItem("pz_modlists") || "{}")
  );
  const [activeList, setActiveList] = useState("");
  const [showListOnly, setShowListOnly] = useState(false);

  const [selectedMod, setSelectedMod] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    mod: null,
  });
  const [showExport, setShowExport] = useState(false);
  const [modColors, setModColors] = useState(() =>
    JSON.parse(localStorage.getItem("pz_modColors") || "{}")
  );

  const inputRef = useRef(null);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("pz_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("pz_modlists", JSON.stringify(modlists));
  }, [modlists]);

  useEffect(() => {
    localStorage.setItem("pz_modColors", JSON.stringify(modColors));
  }, [modColors]);

  useEffect(() => {
    inputRef.current?.focus();
    const handleClickOutside = (e) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect if input looks like a Steam Workshop Collection ID (digits only)
  const isCollectionId = (text) => /^\d{6,}$/.test(text.trim());

  // fetchMods wrapped with useCallback so we can call it in useEffect safely
  const fetchMods = useCallback(async () => {
    const query = input.trim();
    if (!query)
      return setError(
        "Enter a mod keyword or paste a valid Workshop Collection ID."
      );
    setLoading(true);
    setError("");
    setMods([]);

    const url = isCollectionId(query)
      ? `https://steamcommunity.com/sharedfiles/filedetails/?id=${query}`
      : `https://steamcommunity.com/workshop/browse/?appid=108600&searchtext=${encodeURIComponent(
          query
        )}&browsesort=trend`;

    try {
      const response = await fetch(`https://corsproxy.io/?${url}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const items = isCollectionId(query)
        ? [...doc.querySelectorAll(".collectionItem")]
        : [...doc.querySelectorAll(".workshopItem")];

      if (!items.length) throw new Error("No mods found.");

      const modsParsed = items.map((item) => {
        const link = item.querySelector("a")?.href || "#";
        const modId = link.match(/id=(\d+)/)?.[1] || crypto.randomUUID();
        const title =
          item.querySelector(".workshopItemTitle")?.textContent.trim() ||
          "Untitled";
        const image =
          item.querySelector("img")?.src ||
          "https://via.placeholder.com/260x140?text=No+Image";
        const description =
          item.querySelector(".workshopItemDescription")?.textContent.trim() ||
          "No description provided.";
        const author =
          item.querySelector(".workshopItemAuthorName")?.textContent.trim() ||
          "Unknown Author";
        const subscribers = parseInt(
          item
            .querySelector(".numSubscribers")
            ?.textContent.replace(/[^\d]/g, "") || "0",
          10
        );
        const lastUpdated =
          item.querySelector(".workshopItemUpdated")?.getAttribute("title") ||
          "Unknown date";
        const fileSize =
          item.querySelector(".workshopItemFileSize")?.textContent.trim() ||
          "Unknown size";
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
        };
      });

      setMods(modsParsed);
    } catch (err) {
      console.error("Workshop fetch failed:", err);
      setError("Failed to load mods. Try again.");
    } finally {
      setLoading(false);
    }
  }, [input]);

  // Run fetchMods on mount to load mods by default
  useEffect(() => {
    fetchMods();
  }, [fetchMods]);

  const toggleFavorite = (modId) => {
    setFavorites((prev) =>
      prev.includes(modId)
        ? prev.filter((id) => id !== modId)
        : [...prev, modId]
    );
  };

  const toggleModInList = (modId) => {
    if (!activeList) return;
    const current = modlists[activeList] || [];
    const updated = current.includes(modId)
      ? current.filter((id) => id !== modId)
      : [...current, modId];
    setModlists((prev) => ({ ...prev, [activeList]: updated }));
  };

  const createNewModlist = () => {
    const name = prompt("Enter a name for the new modlist:");
    if (!name || modlists[name])
      return alert("Invalid or duplicate modlist name.");
    setModlists((prev) => ({ ...prev, [name]: [] }));
    setActiveList(name);
  };

  const renameModlist = () => {
    if (!activeList) return;
    const newName = prompt("Enter a new name for this modlist:");
    if (!newName || modlists[newName])
      return alert("Invalid or duplicate name.");
    setModlists((prev) => {
      const updated = { ...prev, [newName]: prev[activeList] };
      delete updated[activeList];
      return updated;
    });
    setActiveList(newName);
  };

  const deleteModlist = () => {
    if (!activeList) return;
    if (!window.confirm(`Delete modlist "${activeList}"?`)) return;
    setModlists((prev) => {
      const updated = { ...prev };
      delete updated[activeList];
      return updated;
    });
    setActiveList("");
  };

  const setModColor = (modId, color) => {
    setModColors((prev) => ({ ...prev, [modId]: color }));
  };

  const displayedMods = useMemo(() => {
    return showListOnly && activeList
      ? mods.filter((mod) => (modlists[activeList] || []).includes(mod.modId))
      : mods;
  }, [showListOnly, activeList, modlists, mods]);

  const exportIds = activeList ? modlists[activeList] || [] : [];

  return (
    <div className="workshop-container">
      <div className="workshop-header-container">
        <h1 className="workshop-title">Project Zomboid Workshop</h1>
        <p className="workshop-subtitle">
          Easily discover and organize your favorite mods by creating custom
          modlists, assigning color codes, exporting mod IDs, and streamlining
          your entire server setup process.
        </p>
      </div>

      <div className="search-container">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchMods()}
          placeholder="Search mods or enter Workshop Collection ID..."
          className="search-input"
        />
        <button
          onClick={fetchMods}
          disabled={loading}
          className="search-button"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      <div className="modlist-bar">
        <div className="dropdown-container">
          <label>📁 Modlist:</label>
          <select
            value={activeList}
            onChange={(e) => setActiveList(e.target.value)}
          >
            <option value="">All Mods</option>
            {Object.keys(modlists).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="modlist-buttons">
          <button onClick={createNewModlist}>➕ New</button>
          {activeList && (
            <>
              <button onClick={renameModlist}>✏ Rename</button>
              <button onClick={deleteModlist}>🗑 Delete</button>
              <label>
                <input
                  type="checkbox"
                  checked={showListOnly}
                  onChange={() => setShowListOnly(!showListOnly)}
                />{" "}
                Show List
              </label>
              <button onClick={() => setShowExport(true)}>📤 Export</button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="mod-grid">
        {displayedMods.map((mod) => (
          <ModCard
            key={mod.modId}
            mod={mod}
            isFavorite={favorites.includes(mod.modId)}
            inList={modlists[activeList]?.includes(mod.modId)}
            onClick={() => setSelectedMod(mod)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ visible: true, x: e.pageX, y: e.pageY, mod });
            }}
            onToggleFavorite={() => toggleFavorite(mod.modId)}
            onToggleInList={() => toggleModInList(mod.modId)}
            color={modColors[mod.modId]}
            onSetColor={setModColor}
          />
        ))}
      </div>

      {selectedMod && (
        <ModModal mod={selectedMod} onClose={() => setSelectedMod(null)} />
      )}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          mod={contextMenu.mod}
          color={modColors[contextMenu.mod?.modId]}
          ref={contextMenuRef}
          onClose={() =>
            setContextMenu((prev) => ({ ...prev, visible: false }))
          }
        />
      )}
      {showExport && (
        <ExportModal
          modIds={exportIds}
          listName={activeList}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
