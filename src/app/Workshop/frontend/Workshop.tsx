"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import ModCard, { Mod } from "./ModCard";
import ModModal from "./ModModal";
import PopupModal from "./PopupModal";
import ModUpdates from "./pages/ModUpdates/ModUpdates";
import ModLogs from "./pages/ModLogs/ModLogs";
import LoadOrder from "./pages/LoadOrder/LoadOrder";
import ModCreation from "./pages/ModCreation/ModCreation";
import ModAlerts from "./pages/ModAlerts/ModAlerts";
import ModDebugger from "./pages/ModDebugger/ModDebugger";
import "./Workshop.css";

const GAME_APPIDS: Record<string, number> = {
  projectzomboid: 108600,
  rimworld: 294100,
  dayz: 221100,
  rust: 252490,
  squad: 393380,
  spaceengineers: 244850,
  kerbalspaceprogram: 220200,
};

const ExportModal: React.FC<{ modIds: string[]; onClose: () => void }> = ({
  modIds,
  onClose,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyAll = () => {
    const text = modIds.join(",");
    navigator.clipboard?.writeText(text).catch(() => {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand("copy");
      }
    });
    alert(
      "Copied mod IDs to clipboard! Paste into server.ini → WorkshopItems="
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <textarea
          ref={textareaRef}
          readOnly
          value={modIds.join(",")}
          className="modal-textarea"
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
  const [input, setInput] = useState("");
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedGame, setSelectedGame] = useState("projectzomboid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [modlists, setModlists] = useState<Record<string, string[]>>({});
  const [activeList, setActiveList] = useState("");
  const [showListOnly, setShowListOnly] = useState(false);
  const [installedMods, setInstalledMods] = useState<string[]>([]);
  const [serverIniFile, setServerIniFile] = useState<File | null>(null);
  const [serverIniContent, setServerIniContent] = useState("");
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [popup, setPopup] = useState<
    | "updates"
    | "logs"
    | "alerts"
    | "moddebugger"
    | "modcreation"
    | "loadorder"
    | null
  >(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedGame = localStorage.getItem("selectedGame");
    if (savedGame) setSelectedGame(savedGame);
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    const savedModlists = localStorage.getItem("modlists");
    if (savedModlists) setModlists(JSON.parse(savedModlists));
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    localStorage.setItem("selectedGame", selectedGame);
  }, [selectedGame]);
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem("modlists", JSON.stringify(modlists));
  }, [modlists]);

  const addModToServer = (modId: string) => {
    if (!installedMods.includes(modId)) {
      const newInstalled = [...installedMods, modId];
      setInstalledMods(newInstalled);
      const lines = serverIniContent.split("\n");
      let found = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("WorkshopItems=")) {
          lines[i] = `WorkshopItems=${newInstalled.join(",")}`;
          found = true;
          break;
        }
      }
      if (!found) lines.push(`WorkshopItems=${newInstalled.join(",")}`);
      setServerIniContent(lines.join("\n"));
    }
  };

  const fetchMods = useCallback(async () => {
    const query = input.trim();
    if (!query) return setError("Enter a mod keyword or Collection ID.");
    setLoading(true);
    setError("");
    setMods([]);

    const url = /^\d{6,}$/.test(query)
      ? `https://steamcommunity.com/sharedfiles/filedetails/?id=${query}`
      : `https://steamcommunity.com/workshop/browse/?appid=${
          GAME_APPIDS[selectedGame]
        }&searchtext=${encodeURIComponent(query)}&browsesort=trend`;

    try {
      const response = await fetch(`https://corsproxy.io/?${url}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      let items: Mod[] = [];
      if (/^\d{6,}$/.test(query)) {
        const modLinks = [...doc.querySelectorAll(".collectionItem a")];
        for (let linkEl of modLinks) {
          const modId = linkEl.href.match(/id=(\d+)/)?.[1];
          if (modId) items.push({ modId, title: `Mod ${modId}`, image: "" });
        }
      } else {
        items = [...doc.querySelectorAll(".workshopItem")].map((item) => {
          const link = item.querySelector("a")?.href || "#";
          const modId = link.match(/id=(\d+)/)?.[1] || crypto.randomUUID();
          const title =
            item.querySelector(".workshopItemTitle")?.textContent.trim() ||
            "Untitled";
          const image =
            item.querySelector("img")?.src ||
            "https://via.placeholder.com/260x140?text=No+Image";
          return { modId, title, image };
        });
      }

      if (!items.length) throw new Error("No mods found.");
      setMods(items);
    } catch (err) {
      console.error(err);
      setError("Failed to load mods.");
    } finally {
      setLoading(false);
    }
  }, [input, selectedGame]);

  useEffect(() => {
    fetchMods();
  }, [fetchMods]);

  const displayedMods = useMemo(() => {
    if (activeList === "__installed__")
      return mods.filter((m) => installedMods.includes(m.modId));
    return showListOnly && activeList
      ? mods.filter((m) => (modlists[activeList] || []).includes(m.modId))
      : mods;
  }, [mods, installedMods, activeList, showListOnly, modlists]);

  return (
    <div className="workshop-container">
      {/* Search */}
      <div className="search-container">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchMods()}
          className="search-input"
          placeholder="Search mods or Collection ID..."
        />
        <button
          onClick={fetchMods}
          disabled={loading}
          className="search-button"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Server.ini loader */}
      <div className="modlist-bar">
        <div className="dropdown-container">
          <label>📁 Modlist:</label>
          <select
            value={activeList}
            onChange={(e) => setActiveList(e.target.value)}
          >
            <option value="">All Mods</option>
            {installedMods.length > 0 && (
              <option value="__installed__">Installed Mods</option>
            )}
            {Object.keys(modlists).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="modlist-buttons">
          <button
            onClick={() => {
              const name = prompt("Enter a new modlist:");
              if (name) setModlists((prev) => ({ ...prev, [name]: [] }));
              setActiveList(name || "");
            }}
          >
            ➕ New
          </button>
          {activeList && activeList !== "__installed__" && (
            <>
              <button
                onClick={() => {
                  const newName = prompt("New name:");
                  if (newName && !modlists[newName]) {
                    setModlists((prev) => {
                      const updated = { ...prev, [newName]: prev[activeList] };
                      delete updated[activeList];
                      return updated;
                    });
                    setActiveList(newName);
                  }
                }}
              >
                ✏ Rename
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${activeList}"?`)) {
                    setModlists((prev) => {
                      const updated = { ...prev };
                      delete updated[activeList];
                      return updated;
                    });
                    setActiveList("");
                  }
                }}
              >
                🗑 Delete
              </button>
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

      {/* Mods Grid */}
      <div className="mod-grid">
        {displayedMods.map((mod) => (
          <ModCard
            key={mod.modId}
            mod={mod}
            inList={
              activeList && activeList !== "__installed__"
                ? modlists[activeList]?.includes(mod.modId)
                : false
            }
            isInstalled={installedMods.includes(mod.modId)}
            onClick={() => setSelectedMod(mod)}
            onToggleInList={() => {
              if (!activeList || activeList === "__installed__") return;
              const current = modlists[activeList] || [];
              const updated = current.includes(mod.modId)
                ? current.filter((id) => id !== mod.modId)
                : [...current, mod.modId];
              setModlists((prev) => ({ ...prev, [activeList]: updated }));
            }}
            onAddToServer={() => addModToServer(mod.modId)}
          />
        ))}
      </div>

      {selectedMod && (
        <ModModal mod={selectedMod} onClose={() => setSelectedMod(null)} />
      )}
      {showExport && (
        <ExportModal
          modIds={
            activeList && activeList !== "__installed__"
              ? modlists[activeList] || []
              : installedMods
          }
          onClose={() => setShowExport(false)}
        />
      )}
      {error && <div className="error-message">{error}</div>}

      {popup && (
        <PopupModal onClose={() => setPopup(null)}>
          {popup === "updates" && (
            <ModUpdates
              updates={
                installedMods
                  .map((id) => mods.find((m) => m.modId === id))
                  .filter(Boolean) as any
              }
            />
          )}
          {popup === "logs" && (
            <ModLogs
              installedMods={installedMods.map(
                (id) =>
                  mods.find((m) => m.modId === id) || {
                    modId: id,
                    title: `Mod ${id}`,
                  }
              )}
            />
          )}
          {popup === "alerts" && <ModAlerts />}
          {popup === "moddebugger" && <ModDebugger />}
          {popup === "modcreation" && <ModCreation />}
          {popup === "loadorder" && <LoadOrder />}
        </PopupModal>
      )}
    </div>
  );
}
