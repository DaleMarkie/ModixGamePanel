"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import ModCard, { Mod } from "./ModCard";
import ModModal from "./ModModal";
import PopupModal from "./PopupModal";
import ModUpdates from "./pages/ModUpdates/ModUpdates";
import ModLogs from "./pages/ModLogs/ModLogs";

import "./Workshop.css";

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

  const handleCopyAll = () => {
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
          <button onClick={handleCopyAll} className="modal-button copy-button">
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

  const [favorites, setFavorites] = useState<string[]>([]);
  const [modlists, setModlists] = useState<Record<string, string[]>>({});
  const [activeList, setActiveList] = useState<string>("__workshop__");
  const [showListOnly, setShowListOnly] = useState(false);

  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [modColors, setModColors] = useState<Record<string, string>>({});

  const [serverIniFile, setServerIniFile] = useState<File | null>(null);
  const [serverIniContent, setServerIniContent] = useState("");
  const [installedMods, setInstalledMods] = useState<string[]>([]);

  const [popup, setPopup] = useState<null | "updates" | "logs">(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  /** ------------------ Load saved data ------------------ **/
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const savedModlists = localStorage.getItem("modlists");
    if (savedModlists) setModlists(JSON.parse(savedModlists));

    const savedColors = localStorage.getItem("modColors");
    if (savedColors) setModColors(JSON.parse(savedColors));

    const savedActiveList = localStorage.getItem("activeList");
    if (savedActiveList) setActiveList(savedActiveList);

    const gameId = localStorage.getItem("activeGameId");
    if (gameId) setActiveGame(gameId);
  }, []);

  /** ------------------ Persist data ------------------ **/
  useEffect(
    () => localStorage.setItem("favorites", JSON.stringify(favorites)),
    [favorites]
  );
  useEffect(
    () => localStorage.setItem("modColors", JSON.stringify(modColors)),
    [modColors]
  );
  useEffect(() => localStorage.setItem("activeList", activeList), [activeList]);

  // <-- FIX: Auto-save modlists whenever it changes
  useEffect(() => {
    localStorage.setItem("modlists", JSON.stringify(modlists));
  }, [modlists]);

  /** ------------------ server.ini helpers ------------------ **/
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
    const lines = serverIniContent.split("\n");
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
      updateServerIniContent([...installedMods, modId]);
    }
  };

  /** ------------------ Fetch mods ------------------ **/
  const fetchModInfo = async (modId: string): Promise<Mod> => {
    try {
      const url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${modId}`;
      const response = await fetch(`https://corsproxy.io/?${url}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const title =
        doc.querySelector(".workshopItemTitle")?.textContent?.trim() ||
        `Mod ${modId}`;
      const image =
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
      const version: string | undefined = versionMatch?.[0];

      return {
        modId,
        title,
        image,
        lastUpdate,
        version,
        description: descriptionBlock.slice(0, 300).trim(),
      };
    } catch {
      return {
        modId,
        title: `Mod ${modId}`,
        image: "https://via.placeholder.com/260x140?text=No+Image",
      };
    }
  };

  const fetchDefaultWorkshopMods = useCallback(async () => {
    if (!activeGame) return;
    setLoading(true);
    setError("");
    try {
      const url = `https://steamcommunity.com/workshop/browse/?appid=${activeGame}&browsesort=trend`;
      const response = await fetch(`https://corsproxy.io/?${url}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const items: Mod[] = [...doc.querySelectorAll(".workshopItem")]
        .slice(0, 50)
        .map((item) => {
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

      setMods(items);
    } catch {
      setError("Failed to load Workshop mods.");
    } finally {
      setLoading(false);
    }
  }, [activeGame]);

  const fetchMods = useCallback(async () => {
    if (!input.trim()) return fetchDefaultWorkshopMods();
    if (!activeGame) return;
    setLoading(true);
    setError("");
    setMods([]);

    const isCollectionId = /^\d{6,}$/.test(input.trim());
    const query = input.trim();

    try {
      const url = isCollectionId
        ? `https://steamcommunity.com/sharedfiles/filedetails/?id=${query}`
        : `https://steamcommunity.com/workshop/browse/?appid=${activeGame}&searchtext=${encodeURIComponent(
            query
          )}&browsesort=trend`;

      const response = await fetch(`https://corsproxy.io/?${url}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      let items: Mod[] = [];

      if (isCollectionId) {
        const modLinks = [...doc.querySelectorAll(".collectionItem a")];
        for (let linkEl of modLinks) {
          const modId = linkEl.href.match(/id=(\d+)/)?.[1];
          if (!modId) continue;
          items.push(await fetchModInfo(modId));
        }
      } else {
        items = [...doc.querySelectorAll(".workshopItem")]
          .slice(0, 50)
          .map((item) => {
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
    } catch {
      setError("Failed to load mods. Try again.");
    } finally {
      setLoading(false);
    }
  }, [input, fetchDefaultWorkshopMods, activeGame]);

  useEffect(() => {
    if (activeList === "__workshop__") fetchMods();
  }, [input, fetchMods, activeList]);

  /** ------------------ Displayed mods ------------------ **/
  const displayedMods = useMemo(() => {
    if (activeList === "__workshop__") return mods;
    if (showListOnly && activeList)
      return mods.filter((mod) => modlists[activeList]?.includes(mod.modId));
    return mods;
  }, [mods, activeList, showListOnly, modlists]);

  /** ------------------ Modlist actions ------------------ **/
  const createNewModlist = () => {
    const name = prompt("Enter a new modlist:");
    if (!name) return alert("Modlist name cannot be empty!");
    if (modlists[name]) return alert("Modlist already exists!");
    setModlists((prev) => ({ ...prev, [name]: [] }));
    setActiveList(name);
  };

  const renameModlist = () => {
    if (!activeList || activeList === "__workshop__") return;
    const newName = prompt("New name for modlist:");
    if (!newName) return alert("Name cannot be empty!");
    if (modlists[newName]) return alert("Name already exists!");
    setModlists((prev) => {
      const updated: Record<string, string[]> = {
        ...prev,
        [newName]: prev[activeList],
      };
      delete updated[activeList];
      return updated;
    });
    setActiveList(newName);
  };

  const deleteModlist = () => {
    if (!activeList || activeList === "__workshop__") return;
    if (!window.confirm(`Delete modlist "${activeList}"?`)) return;
    setModlists((prev) => {
      const updated = { ...prev };
      delete updated[activeList];
      return updated;
    });
    setActiveList("__workshop__");
  };

  const downloadServerIni = () => {
    const blob = new Blob([serverIniContent], {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = serverIniFile?.name || "server.ini";
    link.click();
  };

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
          placeholder="Search for mods on the Steam Workshop..."
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
      <div className="server-ini-loader">
        <label>🗄 Load server.ini</label>
        <input
          type="file"
          accept=".ini"
          onChange={(e) => {
            if (!e.target.files?.length) return;
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
              const content = reader.result as string;
              setServerIniContent(content);
              setInstalledMods(parseInstalledMods(content));
              setServerIniFile(file);
            };
            reader.readAsText(file);
          }}
        />
        {serverIniFile && (
          <button onClick={downloadServerIni}>
            💾 Download Updated server.ini
          </button>
        )}
      </div>

      {/* Modlists */}
      <div className="modlist-bar">
        <select
          value={activeList}
          onChange={(e) => setActiveList(e.target.value)}
        >
          <option value="__workshop__">Workshop</option>
          {Object.keys(modlists).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button onClick={createNewModlist}>➕ New</button>
        {activeList && activeList !== "__workshop__" && (
          <>
            <button onClick={renameModlist}>✏ Rename</button>
            <button onClick={deleteModlist}>🗑 Delete</button>
            <label>
              <input
                type="checkbox"
                checked={showListOnly}
                onChange={() => setShowListOnly(!showListOnly)}
              />
              Show List Only
            </label>
            <button onClick={() => setShowExport(true)}>📤 Export</button>
            <button
              onClick={() => {
                alert(`Modlist "${activeList}" saved! ✅`);
              }}
            >
              💾 Save Modlist
            </button>
          </>
        )}
      </div>

      {/* Mods grid */}
      <div className="mod-grid">
        {displayedMods.map((mod) => (
          <Suspense
            key={mod.modId}
            fallback={<div className="mod-card-placeholder" />}
          >
            <ModCard
              mod={mod}
              inList={
                activeList && activeList !== "__workshop__"
                  ? modlists[activeList]?.includes(mod.modId)
                  : false
              }
              isInstalled={installedMods.includes(mod.modId)}
              onClick={() => setSelectedMod(mod)}
              onToggleInList={() => {
                if (!activeList || activeList === "__workshop__") return;
                setModlists((prev) => {
                  const current = prev[activeList] || [];
                  const updated = current.includes(mod.modId)
                    ? current.filter((id) => id !== mod.modId)
                    : [...current, mod.modId];
                  return { ...prev, [activeList]: updated };
                });
              }}
              onAddToServer={() => addModToServer(mod.modId)}
              onSetColor={(color) =>
                setModColors((prev) => ({ ...prev, [mod.modId]: color }))
              }
            />
          </Suspense>
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
            activeList && activeList !== "__workshop__"
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
                        lastWorkshopUpdate: mod.lastUpdate,
                        currentVersion: mod.version,
                        description: mod.description,
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
        </PopupModal>
      )}
    </div>
  );
}
