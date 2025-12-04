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

interface Game {
  id: string;
  name: string;
  steamAppId: number;
}

interface WorkshopPageProps {
  currentGame?: Game;
}

export default function WorkshopPage({ currentGame }: WorkshopPageProps) {
  const defaultGame: Game = {
    id: "108600",
    name: "Project Zomboid",
    steamAppId: 108600,
  };

  const [detectedGame, setDetectedGame] = useState<Game | null>(
    currentGame || null
  );

  useEffect(() => {
    if (currentGame) setDetectedGame(currentGame);
  }, [currentGame]);

  useEffect(() => {
    if (currentGame) return;
    const activeId = localStorage.getItem("activeGameId");
    if (activeId) {
      const steamAppId = /^\d+$/.test(activeId)
        ? Number(activeId)
        : defaultGame.steamAppId;
      setDetectedGame({ id: activeId, name: `Game ${activeId}`, steamAppId });
    } else {
      setDetectedGame(defaultGame);
    }

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "activeGameId") {
        const newId = ev.newValue;
        if (!newId) {
          setDetectedGame(defaultGame);
        } else {
          const steamAppId = /^\d+$/.test(newId)
            ? Number(newId)
            : defaultGame.steamAppId;
          setDetectedGame({ id: newId, name: `Game ${newId}`, steamAppId });
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [currentGame]);

  const game = detectedGame || defaultGame;
  const appid = game.steamAppId;

  const [input, setInput] = useState("");
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState<string[]>([]);
  const [modlists, setModlists] = useState<Record<string, string[]>>({});
  const [activeList, setActiveList] = useState("");
  const [showListOnly, setShowListOnly] = useState(false);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [modColors, setModColors] = useState<Record<string, string>>({});
  const [serverIniFile, setServerIniFile] = useState<File | null>(null);
  const [serverIniContent, setServerIniContent] = useState("");
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
  useEffect(() => inputRef.current?.focus(), []);

  /* -------------------- Load per-game settings -------------------- */
  useEffect(() => {
    if (!game?.id) return;
    try {
      const savedFavorites = localStorage.getItem(`${game.id}_favorites`);
      setFavorites(savedFavorites ? JSON.parse(savedFavorites) : []);

      const savedModlists = localStorage.getItem(`${game.id}_modlists`);
      setModlists(savedModlists ? JSON.parse(savedModlists) : {});

      const savedColors = localStorage.getItem(`${game.id}_modColors`);
      setModColors(savedColors ? JSON.parse(savedColors) : {});

      const savedInstalled = localStorage.getItem(`${game.id}_installed`);
      setInstalledMods(savedInstalled ? JSON.parse(savedInstalled) : []);

      const savedIni = localStorage.getItem(`${game.id}_serverIniContent`);
      setServerIniContent(savedIni || "");
    } catch (err) {
      console.warn("Failed to parse per-game localStorage data:", err);
    }
  }, [game?.id]);

  /* -------------------- Save per-game settings -------------------- */
  useEffect(() => {
    if (!game?.id) return;
    localStorage.setItem(`${game.id}_favorites`, JSON.stringify(favorites));
  }, [favorites, game?.id]);

  useEffect(() => {
    if (!game?.id) return;
    localStorage.setItem(`${game.id}_modlists`, JSON.stringify(modlists));
  }, [modlists, game?.id]);

  useEffect(() => {
    if (!game?.id) return;
    localStorage.setItem(`${game.id}_modColors`, JSON.stringify(modColors));
  }, [modColors, game?.id]);

  useEffect(() => {
    if (!game?.id) return;
    localStorage.setItem(`${game.id}_installed`, JSON.stringify(installedMods));
  }, [installedMods, game?.id]);

  useEffect(() => {
    if (!game?.id) return;
    localStorage.setItem(`${game.id}_serverIniContent`, serverIniContent || "");
  }, [serverIniContent, game?.id]);

  /* -------------------- Server INI parsing -------------------- */
  const parseInstalledMods = (content: string) =>
    content
      .split("\n")
      .find((l) => l.startsWith("WorkshopItems="))
      ?.replace("WorkshopItems=", "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) || [];

  const handleServerIniUpload = (file: File | null) => {
    if (!file) return;
    setServerIniFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setServerIniContent(text);
      const parsed = parseInstalledMods(text);
      if (parsed.length) setInstalledMods(parsed);
      alert("server.ini loaded and installed mods parsed.");
    };
    reader.readAsText(file);
  };

  const updateServerIniContent = (modIds: string[]) => {
    const lines = serverIniContent ? serverIniContent.split("\n") : [];
    let found = false;
    const newLines = lines.map((line) => {
      if (line.startsWith("WorkshopItems=")) {
        found = true;
        return `WorkshopItems=${modIds.join(",")}`;
      }
      return line;
    });
    if (!found) newLines.push(`WorkshopItems=${modIds.join(",")}`);
    const joined = newLines.join("\n");
    setServerIniContent(joined);
    setInstalledMods(modIds);
  };

  const addModToServer = (modId: string) => {
    if (!installedMods.includes(modId))
      updateServerIniContent([...installedMods, modId]);
  };

  /* -------------------- Fetching mod info -------------------- */
  const fetchModInfo = async (modId: string): Promise<Mod> => {
    try {
      const url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${modId}`;
      const html = await (await fetch(`https://corsproxy.io/?${url}`)).text();
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
      const descriptionBlock =
        doc.querySelector(".workshopItemDescription")?.textContent || "";
      const versionMatch = descriptionBlock.match(/v?\d+(\.\d+)+/i);
      const version = versionMatch?.[0];
      const lastUpdateText = doc
        .querySelector(".detailsStatRight")
        ?.textContent?.trim();
      const lastUpdate = lastUpdateText
        ? new Date(Date.parse(lastUpdateText)).toISOString()
        : undefined;

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

  /* -------------------- Collection / search handling -------------------- */
  const isCollectionId = (text: string) => /^\d{6,}$/.test(text.trim());

  const fetchMods = useCallback(
    async (queryOverride?: string) => {
      const query = (queryOverride ?? input).trim();
      if (!query) return setError("Enter a mod keyword or Collection ID.");
      setLoading(true);
      setError("");
      setMods([]);
      try {
        const url = isCollectionId(query)
          ? `https://steamcommunity.com/sharedfiles/filedetails/?id=${query}`
          : `https://steamcommunity.com/workshop/browse/?appid=${appid}&searchtext=${encodeURIComponent(
              query
            )}&browsesort=trend`;

        const html = await (await fetch(`https://corsproxy.io/?${url}`)).text();
        const doc = new DOMParser().parseFromString(html, "text/html");

        let items: Mod[] = [];
        if (isCollectionId(query)) {
          const modLinks = [...doc.querySelectorAll(".collectionItem a")];
          for (let linkEl of modLinks) {
            const modId = linkEl.href.match(/id=(\d+)/)?.[1];
            if (!modId) continue;
            items.push(await fetchModInfo(modId));
          }
        } else {
          items = [...doc.querySelectorAll(".workshopItem")].map((item) => {
            const link = item.querySelector("a")?.href || "#";
            const modId = link.match(/id=(\d+)/)?.[1] || crypto.randomUUID();
            const title =
              item.querySelector(".workshopItemTitle")?.textContent?.trim() ||
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
    },
    [input, appid]
  );

  useEffect(() => {
    if (input.trim()) fetchMods();
  }, [fetchMods]);

  useEffect(() => {
    if (!installedMods.length) return;
    (async () => {
      const info = await Promise.all(
        installedMods.map((id) => fetchModInfo(id))
      );
      setMods((prev) => {
        const other = prev.filter((m) => !installedMods.includes(m.modId));
        return [...other, ...info];
      });
    })();
  }, [installedMods.join(",")]);

  const displayedMods = useMemo(() => {
    if (activeList === "__installed__")
      return mods.filter((m) => installedMods.includes(m.modId));
    return showListOnly && activeList
      ? mods.filter((m) => (modlists[activeList] || []).includes(m.modId))
      : mods;
  }, [showListOnly, activeList, modlists, mods, installedMods]);

  /* -------------------- Modlist CRUD -------------------- */
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

  const addAllToModlist = (listName: string, sourceMods?: Mod[]) => {
    if (!listName) return;
    const toAdd = (sourceMods || mods).map((m) => m.modId);
    setModlists((prev) => ({
      ...prev,
      [listName]: Array.from(new Set([...(prev[listName] || []), ...toAdd])),
    }));
  };

  const saveActiveModlist = () => {
    if (!activeList || activeList === "__installed__")
      return setToast("No modlist selected to save.");

    // Save to localStorage
    localStorage.setItem(`${game.id}_modlists`, JSON.stringify(modlists));

    // Show toast
    setToast(`Modlist "${activeList}" saved!`);

    // Auto-hide toast after 2 seconds
    setTimeout(() => setToast(null), 2000);
  };

  const [toast, setToast] = useState<string | null>(null);

  /* -------------------- UI -------------------- */
  return (
    <div className="workshop-container">
      {/* HEADER */}
      <div className="workshop-header-container">
        <div className="workshop-title">{game.name} Workshop</div>
        <div className="workshop-subtitle">
          Search, organize, and manage mods like a pro (active game id:{" "}
          {game.id})
        </div>
      </div>

      {/* SEARCH */}
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
          onClick={() => fetchMods()}
          disabled={loading}
          className="search-button"
        >
          {loading ? "Loading..." : "Search"}
        </button>

        {/* COLLECTION: Add all to modlist UI */}
        {isCollectionId(input) && mods.length > 0 && (
          <>
            {Object.keys(modlists).length > 0 ? (
              <select
                onChange={(e) => {
                  const target = e.target as HTMLSelectElement;
                  const listName = target.value;
                  if (!listName) return;
                  addAllToModlist(listName, mods);
                  target.value = "";
                  alert("Collection mods added to list.");
                }}
                defaultValue=""
                className="ml-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1 cursor-pointer"
              >
                <option value="">Add Entire Collection to List</option>
                {Object.keys(modlists).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              // If no lists exist, give quick-create button
              <button
                onClick={() => {
                  const name = prompt(
                    "No modlists found. Enter a name to create a new modlist for this collection:"
                  );
                  if (!name) return;
                  setModlists((prev) => ({
                    ...prev,
                    [name]: mods.map((m) => m.modId),
                  }));
                  setActiveList(name);
                  alert("Modlist created and collection added.");
                }}
                className="ml-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg"
              >
                ➕ Create list & add collection
              </button>
            )}
          </>
        )}
      </div>

      {/* MODLIST BAR */}
      <div className="modlist-bar flex flex-wrap items-center gap-3 p-4 bg-gray-900/80 border border-gray-700 rounded-xl shadow-lg">
        {/* Dropdown */}
        <select
          value={activeList}
          onChange={(e) => setActiveList(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-750 transition-all"
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

        {/* Show only mods from this list */}
        {activeList && activeList !== "__installed__" && (
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={showListOnly}
              onChange={() => setShowListOnly((prev) => !prev)}
              className="accent-indigo-500"
            />
            Show only this list
          </label>
        )}

        {/* NEW */}
        <button
          onClick={createNewModlist}
          className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-3 py-2 rounded-lg shadow-md transition-all"
        >
          ➕ New
        </button>

        {activeList && activeList !== "__installed__" && (
          <>
            {/* RENAME */}
            <button
              onClick={renameModlist}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg shadow-md transition-all"
            >
              ✏ Rename
            </button>

            {/* DELETE */}
            <button
              onClick={deleteModlist}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3 py-2 rounded-lg shadow-md transition-all"
            >
              🗑 Delete
            </button>
          </>
        )}

        {/* EXPORT */}
        {displayedMods.length > 0 && (
          <button
            onClick={() => setShowExport(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-2 rounded-lg shadow-md transition-all"
          >
            📤 Export
          </button>
        )}

        {/* server.ini upload (parse installed mods) */}
        <label className="ml-auto flex items-center gap-2 text-sm text-gray-300">
          <input
            type="file"
            accept=".ini,.txt"
            onChange={(e) => handleServerIniUpload(e.target.files?.[0] || null)}
            className="hidden"
            id="serverIniFileInput"
          />
          <button
            onClick={() =>
              document.getElementById("serverIniFileInput")?.click()
            }
            className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-white"
          >
            Upload server.ini
          </button>
        </label>
      </div>

      {/* SAVE */}
      {activeList && activeList !== "__installed__" && (
        <button
          onClick={saveActiveModlist}
          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-3 py-2 rounded-lg shadow-md transition-all"
        >
          💾 Save
        </button>
      )}

      {/* MOD GRID */}
      <div className="mod-grid-container">
        <div className="mod-grid">
          {displayedMods.map((mod) => {
            const inList =
              activeList && activeList !== "__installed__"
                ? modlists[activeList]?.includes(mod.modId)
                : false;
            const isInstalled = installedMods.includes(mod.modId);

            return (
              <div
                key={mod.modId}
                className="mod-card hover:scale-105 transition-transform duration-200 shadow-lg rounded-xl overflow-hidden bg-gray-900 text-white flex flex-col"
              >
                <div className="mod-image-wrapper relative">
                  <img
                    src={mod.image}
                    alt={mod.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="mod-status-overlay absolute top-2 right-2 flex gap-1">
                    {isInstalled && (
                      <span className="bg-green-500 text-xs px-2 py-1 rounded-full">
                        Installed
                      </span>
                    )}
                    {inList && (
                      <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                        In List
                      </span>
                    )}
                  </div>
                </div>
                <div className="mod-content p-3 flex flex-col flex-1">
                  <h3 className="mod-title font-semibold text-lg line-clamp-2">
                    {mod.title}
                  </h3>
                  {mod.version && (
                    <p className="mod-version text-sm text-gray-400 mt-1">
                      v{mod.version}
                    </p>
                  )}
                  <p className="mod-description text-sm text-gray-300 mt-2 line-clamp-3 flex-1">
                    {mod.description || "No description available."}
                  </p>
                  <div className="mod-actions mt-3 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedMod(mod)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm py-1 rounded-md"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => addModToServer(mod.modId)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-1 rounded-md"
                    >
                      Add to Server
                    </button>
                    {Object.keys(modlists).length > 0 && (
                      <select
                        onChange={(e) => {
                          const listName = e.target.value;
                          if (!listName) return;
                          setModlists((prev) => {
                            const updated = {
                              ...prev,
                              [listName]: Array.from(
                                new Set([...(prev[listName] || []), mod.modId])
                              ),
                            };
                            localStorage.setItem(
                              `${game.id}_modlists`,
                              JSON.stringify(updated)
                            );
                            return updated;
                          });
                          e.target.value = "";
                        }}
                        defaultValue=""
                        className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1 cursor-pointer"
                      >
                        <option value="">Add to List</option>
                        {Object.keys(modlists).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOD MODAL */}
      {selectedMod && (
        <ModModal mod={selectedMod} onClose={() => setSelectedMod(null)} />
      )}

      {/* EXPORT MODAL */}
      {showExport && (
        <ExportModal
          modIds={
            activeList && activeList !== "__installed__"
              ? modlists[activeList] || []
              : displayedMods.map((mod) => mod.modId) // export collection search results or filtered view
          }
          onClose={() => setShowExport(false)}
        />
      )}

      {/* ERROR */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
