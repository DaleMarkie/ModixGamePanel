"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  ChangeEvent,
} from "react";
import ModCard, { ModCardProps, Mod } from "./ModCard";
import ModModal from "./ModModal";

import InstalledModsPage from "./components/InstalledModsPage";
import GameActionButtons from "./components/GameActionButtons";
import ModLogs from "./pages/ModLogs/ModLogs";
import LoadOrder from "./pages/LoadOrder/LoadOrder";
import ModCreation from "./pages/ModCreation/ModCreation";
import ModAlerts from "./pages/ModAlerts/ModAlerts";
import PopupModal from "./PopupModal";
import ModUpdates from "./pages/ModUpdates/ModUpdates";
import ModDebugger from "./pages/ModDebugger/ModDebugger";

import "./workshop.css";

const GAME_ICONS: Record<string, string> = {
  projectzomboid:
    "https://steamcdn-a.akamaihd.net/steam/apps/108600/header.jpg",
  rimworld: "https://steamcdn-a.akamaihd.net/steam/apps/294100/header.jpg",
  dayz: "https://steamcdn-a.akamaihd.net/steam/apps/221100/header.jpg",
  rust: "https://steamcdn-a.akamaihd.net/steam/apps/252490/header.jpg",
  minecraft:
    "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png",
  squad: "https://steamcdn-a.akamaihd.net/steam/apps/393380/header.jpg",
  fivem: "https://fivem.net/images/fivem_logo.png",
  spaceengineers:
    "https://steamcdn-a.akamaihd.net/steam/apps/244850/header.jpg",
  kerbalspaceprogram:
    "https://steamcdn-a.akamaihd.net/steam/apps/220200/header.jpg",
};

interface ExportModalProps {
  modIds: string[];
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ modIds, onClose }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
    <div className="modal-overlay">
      <div className="modal-content">
        <textarea
          ref={textareaRef}
          readOnly
          value={formattedIds}
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

const GAME_APPIDS: Record<string, number> = {
  projectzomboid: 108600,
  rimworld: 294100,
  dayz: 221100,
  rust: 252490,
  squad: 393380,
  spaceengineers: 244850,
  kerbalspaceprogram: 220200,
};

export default function WorkshopPage() {
  const [input, setInput] = useState<string>("");
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [selectedGame, setSelectedGame] = useState<string>(
    localStorage.getItem("selectedGame") || "projectzomboid"
  );
  const appid = GAME_APPIDS[selectedGame] || 108600;

  const [favorites, setFavorites] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem(`${selectedGame}_favorites`) || "[]")
  );
  const [modlists, setModlists] = useState<Record<string, string[]>>(() =>
    JSON.parse(localStorage.getItem(`${selectedGame}_modlists`) || "{}")
  );
  const [activeList, setActiveList] = useState<string>("");
  const [showListOnly, setShowListOnly] = useState<boolean>(false);

  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [showExport, setShowExport] = useState<boolean>(false);
  const [modColors, setModColors] = useState<Record<string, string>>(() =>
    JSON.parse(localStorage.getItem(`${selectedGame}_modColors`) || "{}")
  );

  const [serverIniFile, setServerIniFile] = useState<File | null>(null);
  const [serverIniContent, setServerIniContent] = useState<string>("");
  const [installedMods, setInstalledMods] = useState<string[]>([]);

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
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      `${selectedGame}_favorites`,
      JSON.stringify(favorites)
    );
  }, [favorites, selectedGame]);

  useEffect(() => {
    localStorage.setItem(`${selectedGame}_modlists`, JSON.stringify(modlists));
  }, [modlists, selectedGame]);

  useEffect(() => {
    localStorage.setItem(
      `${selectedGame}_modColors`,
      JSON.stringify(modColors)
    );
  }, [modColors, selectedGame]);

  const parseInstalledMods = (content: string) => {
    const line = content
      .split("\n")
      .find((l) => l.startsWith("WorkshopItems="));
    if (!line) return [];
    return line
      .replace("WorkshopItems=", "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const updateServerIniContent = (modIds: string[]) => {
    let lines = serverIniContent.split("\n");
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("WorkshopItems=")) {
        lines[i] = `WorkshopItems=${modIds.join(",")}`;
        found = true;
        break;
      }
    }
    if (!found) lines.push(`WorkshopItems=${modIds.join(",")}`);
    setServerIniContent(lines.join("\n"));
    setInstalledMods(modIds);
  };

  const addModToServer = (modId: string) => {
    if (!installedMods.includes(modId)) {
      const newInstalled = [...installedMods, modId];
      updateServerIniContent(newInstalled);
    }
  };

  const fetchModInfo = async (modId: string): Promise<Mod> => {
    try {
      const url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${modId}`;
      const response = await fetch(`https://corsproxy.io/?${url}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const title =
        doc.querySelector(".workshopItemTitle")?.textContent?.trim() ||
        `Mod ${modId}`;

      let image =
        (
          doc.querySelector(
            ".workshopItemPreviewImageMain img"
          ) as HTMLImageElement
        )?.src ||
        (doc.querySelector(".workshopItemPreviewImage img") as HTMLImageElement)
          ?.src ||
        "https://via.placeholder.com/260x140?text=No+Image";

      const lastUpdateText =
        doc.querySelector(".detailsStatRight")?.textContent?.trim() || null;

      let lastUpdate: string | undefined;
      if (lastUpdateText) {
        const parsedDate = Date.parse(lastUpdateText);
        if (!isNaN(parsedDate)) lastUpdate = new Date(parsedDate).toISOString();
      }

      const descriptionBlock =
        doc.querySelector(".workshopItemDescription")?.textContent || "";
      const versionMatch = descriptionBlock.match(/v?\d+(\.\d+)+/i);
      let version: string | undefined = versionMatch?.[0];

      return {
        modId,
        title,
        image,
        lastUpdate,
        version,
        description: descriptionBlock.slice(0, 300).trim(),
      };
    } catch (err) {
      console.error("Failed to fetch mod info:", err);
      return {
        modId,
        title: `Mod ${modId}`,
        image: "https://via.placeholder.com/260x140?text=No+Image",
      };
    }
  };

  useEffect(() => {
    if (!installedMods.length) return;
    const fetchAllInstalledMods = async () => {
      const installedInfo = await Promise.all(
        installedMods.map((id) => fetchModInfo(id))
      );
      setMods((prev) => {
        const filtered = prev.filter((m) => !installedMods.includes(m.modId));
        return [...filtered, ...installedInfo];
      });
    };
    fetchAllInstalledMods();
  }, [installedMods]);

  const downloadServerIni = () => {
    const blob = new Blob([serverIniContent], {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = serverIniFile?.name || "server.ini";
    link.click();
  };

  const isCollectionId = (text) => /^\d{6,}$/.test(text.trim());
  const handleConflictChecker = () => alert("Conflict Checker clicked!");
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
      : `https://steamcommunity.com/workshop/browse/?appid=${appid}&searchtext=${encodeURIComponent(
          query
        )}&browsesort=trend`;

    try {
      const response = await fetch(`https://corsproxy.io/?${url}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      let items = [];
      if (isCollectionId(query)) {
        const modLinks = [...doc.querySelectorAll(".collectionItem a")];
        for (let linkEl of modLinks) {
          const link = linkEl.href;
          const modId = link.match(/id=(\d+)/)?.[1];
          if (!modId) continue;
          const info = await fetchModInfo(modId);
          items.push(info);
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
      console.error("Workshop fetch failed:", err);
      setError("Failed to load mods. Try again.");
    } finally {
      setLoading(false);
    }
  }, [input, appid]);

  useEffect(() => {
    fetchMods();
  }, [fetchMods]);

  const displayedMods = useMemo(() => {
    if (activeList === "__installed__")
      return mods.filter((mod) => installedMods.includes(mod.modId));
    return showListOnly && activeList
      ? mods.filter((mod) => (modlists[activeList] || []).includes(mod.modId))
      : mods;
  }, [showListOnly, activeList, modlists, mods, installedMods]);

  const createNewModlist = () => {
    const name = prompt("Enter a new modlist:");
    if (!name || modlists[name]) return alert("Invalid or duplicate name.");
    setModlists((prev) => ({ ...prev, [name]: [] }));
    setActiveList(name);
  };

  const renameModlist = () => {
    if (!activeList || activeList === "__installed__") return;
    const newName = prompt("New name:");
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
    if (!activeList || activeList === "__installed__") return;
    if (!window.confirm(`Delete "${activeList}"?`)) return;
    setModlists((prev) => {
      const updated = { ...prev };
      delete updated[activeList];
      return updated;
    });
    setActiveList("");
  };

  return (
    <div className="workshop-container">
      {/* Top Game Selector + Action Buttons with URL Game Icons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "15px",
          padding: "8px 12px",
          backgroundColor: "#1b1b1b",
          borderRadius: 8,
          border: "1px solid #333",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Game Selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexGrow: 1,
            minWidth: 200,
          }}
        >
          {/* Game Icon */}
          {selectedGame && (
            <img
              src={GAME_ICONS[selectedGame]} // URL mapping for each game
              alt={selectedGame}
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                objectFit: "cover",
                border: "1px solid #555",
              }}
            />
          )}

          <label style={{ fontWeight: 600, color: "#fff" }}>
            🎮 Select Game:
          </label>

          <select
            value={selectedGame}
            onChange={(e) => {
              setSelectedGame(e.target.value);
              localStorage.setItem("selectedGame", e.target.value);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #555",
              backgroundColor: "#2a2a2a",
              color: "#fff",
              cursor: "pointer",
              flexGrow: 1,
              minWidth: 120,
            }}
          >
            {Object.keys(GAME_APPIDS).map((game) => (
              <option key={game} value={game}>
                {game.charAt(0).toUpperCase() + game.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <GameActionButtons
            onModUpdates={() => setPopup("updates")}
            onModLogs={() => setPopup("logs")}
            onLoadOrder={() => setPopup("loadorder")}
            onModCreation={() => setPopup("modcreation")}
            onModAlerts={() => setPopup("alerts")}
            onModCreation={() => setPopup("moddebugger")}
          />
        </div>
      </div>

      {/* Search */}
      <div className="search-container">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchMods()}
          placeholder="Search mods or enter Collection ID..."
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

      {/* Server.ini loader */}
      {/* Server.ini Loader */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          margin: "15px 0",
          padding: "12px",
          backgroundColor: "#1e1e1e",
          borderRadius: 8,
          border: "1px solid #333",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <label style={{ fontWeight: 600, fontSize: 14 }}>
          🗄 Load server.ini
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="file"
            accept=".ini"
            style={{
              cursor: "pointer",
              color: "#fff",
              flex: 1,
              padding: "6px",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: 4,
            }}
            onChange={async (e) => {
              try {
                if (!e.target.files?.length) return;
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                  const content = reader.result as string;
                  setServerIniContent(content);
                  // Safely parse installed mods
                  const mods =
                    content
                      .split("\n")
                      .find((l) => l.startsWith("WorkshopItems="))
                      ?.replace("WorkshopItems=", "")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean) || [];
                  setInstalledMods(mods);
                  setServerIniFile(file);
                };
                reader.readAsText(file);
              } catch (err) {
                console.error("Failed to read server.ini:", err);
                alert("Error loading server.ini. See console for details.");
              }
            }}
          />

          {serverIniFile && (
            <button
              onClick={() => {
                try {
                  const blob = new Blob([serverIniContent], {
                    type: "text/plain;charset=utf-8",
                  });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = serverIniFile.name || "server.ini";
                  link.click();
                } catch (err) {
                  console.error("Failed to download server.ini:", err);
                  alert(
                    "Error downloading server.ini. See console for details."
                  );
                }
              }}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                backgroundColor: "#1DB954",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#17a845")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#1DB954")
              }
            >
              💾 Download Updated server.ini
            </button>
          )}
        </div>

        {serverIniFile && (
          <div
            style={{
              marginTop: "6px",
              fontSize: 12,
              color: "#ccc",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <span>
              Loaded file:{" "}
              <strong style={{ color: "#fff" }}>{serverIniFile.name}</strong>
            </span>
            <span>
              Installed mods:{" "}
              <strong style={{ color: "#1DB954" }}>
                {installedMods.length}
              </strong>
            </span>
            {installedMods.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginTop: 4,
                }}
              >
                {installedMods.slice(0, 10).map((modId) => (
                  <span
                    key={modId}
                    style={{
                      padding: "2px 6px",
                      backgroundColor: "#2a2a2a",
                      borderRadius: 4,
                      fontSize: 11,
                      color: "#fff",
                      border: "1px solid #444",
                    }}
                  >
                    {modId}
                  </span>
                ))}
                {installedMods.length > 10 && (
                  <span style={{ fontSize: 11, color: "#999" }}>
                    +{installedMods.length - 10} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modlists */}
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
          <button onClick={createNewModlist}>➕ New</button>
          {activeList && activeList !== "__installed__" && (
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

      {/* Mods grid or installed mods */}
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
            onClick={() => setSelectedMod(mod)} // Opens modal for all mods
            onToggleInList={() => {
              if (!activeList || activeList === "__installed__") return;
              const current = modlists[activeList] || [];
              const updated = current.includes(mod.modId)
                ? current.filter((id) => id !== mod.modId)
                : [...current, mod.modId];
              setModlists((prev) => ({ ...prev, [activeList]: updated }));
            }}
            onAddToServer={() => addModToServer(mod.modId)}
            onSetColor={(color) =>
              setModColors((prev) => ({ ...prev, [mod.modId]: color }))
            }
          />
        ))}
      </div>

      {/* Mod modal */}
      {selectedMod && (
        <ModModal mod={selectedMod} onClose={() => setSelectedMod(null)} />
      )}

      {/* Export modal */}
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

      {/* Error */}
      {error && <div className="error-message">{error}</div>}

      {/* Popup modals */}
      {popup && (
        <PopupModal onClose={() => setPopup(null)}>
          {popup === "updates" && (
            <ModUpdates
              updates={installedMods
                .map((id) => {
                  const mod = mods.find((m) => m.modId === id);
                  return mod
                    ? {
                        modId: mod.modId,
                        modName: mod.title,
                        lastWorkshopUpdate: mod.lastUpdate || undefined,
                        currentVersion: mod.version || undefined,
                        description: mod.description || undefined,
                      }
                    : null;
                })
                .filter(Boolean)}
            />
          )}

          {popup === "logs" && (
            <ModLogs
              installedMods={installedMods.map((id) => {
                const mod = mods.find((m) => m.modId === id);
                return mod
                  ? { modId: mod.modId, title: mod.title }
                  : { modId: id, title: `Mod ${id}` };
              })}
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
