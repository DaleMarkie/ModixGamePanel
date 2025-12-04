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
import ModGrid from "./ModGrid";
import ModlistBar from "./ModlistBar";

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
    } else setDetectedGame(defaultGame);

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "activeGameId") {
        const newId = ev.newValue;
        const steamAppId = /^\d+$/.test(newId || "")
          ? Number(newId)
          : defaultGame.steamAppId;
        setDetectedGame(
          newId ? { id: newId, name: `Game ${newId}`, steamAppId } : defaultGame
        );
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
  const [activeList, setActiveList] = useState(
    localStorage.getItem(`${game.id}_activeList`) || ""
  );
  const [showListOnly, setShowListOnly] = useState(false);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [modColors, setModColors] = useState<Record<string, string>>({});
  const [serverIniFile, setServerIniFile] = useState<File | null>(null);
  const [serverIniContent, setServerIniContent] = useState("");
  const [installedMods, setInstalledMods] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  // -------------------- Load per-game saved state --------------------
  useEffect(() => {
    if (!game?.id) return;
    try {
      const savedFavorites = localStorage.getItem(`${game.id}_favorites`);
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

      const savedModlists = localStorage.getItem(`${game.id}_modlists`);
      if (savedModlists) setModlists(JSON.parse(savedModlists));

      const savedColors = localStorage.getItem(`${game.id}_modColors`);
      if (savedColors) setModColors(JSON.parse(savedColors));

      const savedInstalled = localStorage.getItem(`${game.id}_installed`);
      if (savedInstalled) setInstalledMods(JSON.parse(savedInstalled));

      const savedIni = localStorage.getItem(`${game.id}_serverIniContent`);
      if (savedIni) setServerIniContent(savedIni);

      const savedActive = localStorage.getItem(`${game.id}_activeList`);
      if (savedActive) setActiveList(savedActive);
    } catch (err) {
      console.warn("Failed to parse per-game localStorage data:", err);
    }
  }, [game?.id]);

  // -------------------- Save per-game state --------------------
  useEffect(() => {
    if (game?.id)
      localStorage.setItem(`${game.id}_favorites`, JSON.stringify(favorites));
  }, [favorites, game?.id]);
  useEffect(() => {
    if (game?.id)
      localStorage.setItem(`${game.id}_modlists`, JSON.stringify(modlists));
  }, [modlists, game?.id]);
  useEffect(() => {
    if (game?.id)
      localStorage.setItem(`${game.id}_modColors`, JSON.stringify(modColors));
  }, [modColors, game?.id]);
  useEffect(() => {
    if (game?.id)
      localStorage.setItem(
        `${game.id}_installed`,
        JSON.stringify(installedMods)
      );
  }, [installedMods, game?.id]);
  useEffect(() => {
    if (game?.id)
      localStorage.setItem(
        `${game.id}_serverIniContent`,
        serverIniContent || ""
      );
  }, [serverIniContent, game?.id]);
  useEffect(() => {
    if (game?.id)
      localStorage.setItem(`${game.id}_activeList`, activeList || "");
  }, [activeList, game?.id]);

  // -------------------- Server INI --------------------
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

  // -------------------- Mod fetching --------------------
  const isCollectionId = (text: string) => /^\d{6,}$/.test(text.trim());

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
      return { modId, title, image };
    } catch {
      return {
        modId,
        title: `Mod ${modId}`,
        image: "https://via.placeholder.com/260x140?text=No+Image",
      };
    }
  };

  const fetchMods = useCallback(
    async (queryOverride?: string) => {
      const query = (queryOverride ?? input).trim();
      if (!query) return setError("Enter a mod keyword or Collection ID.");
      setLoading(true);
      setError("");
      setMods([]);
      try {
        let items: Mod[] = [];
        if (isCollectionId(query)) {
          const res = await fetch(
            "https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                collectioncount: 1,
                publishedfileids: [parseInt(query)],
                includechildren: true,
              }),
            }
          );
          const data = await res.json();
          const children =
            data.response?.collectiondetails?.[0]?.children || [];
          items = await Promise.all(
            children.map(
              async (c: any) => await fetchModInfo(String(c.publishedfileid))
            )
          );
        } else {
          const url = `https://steamcommunity.com/workshop/browse/?appid=${appid}&searchtext=${encodeURIComponent(
            query
          )}&browsesort=trend`;
          const html = await (
            await fetch(`https://corsproxy.io/?${url}`)
          ).text();
          const doc = new DOMParser().parseFromString(html, "text/html");
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

  // -------------------- Displayed mods --------------------
  const displayedMods = useMemo(() => {
    if (activeList === "__installed__")
      return mods.filter((m) => installedMods.includes(m.modId));
    return showListOnly && activeList
      ? mods.filter((m) => (modlists[activeList] || []).includes(m.modId))
      : mods;
  }, [showListOnly, activeList, modlists, mods, installedMods]);

  // -------------------- Modlist CRUD --------------------
  const createNewModlist = () => {
    const name = prompt("Enter a new modlist:");
    if (!name || modlists[name]) return alert("Invalid or duplicate name.");
    setModlists((prev) => ({ ...prev, [name]: [] }));
    setActiveList(name);
  };

  const renameModlist = () => {
    if (!activeList || activeList === "__installed__") return;
    const newName = prompt("Enter new name:", activeList);
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

  const saveModlistsManually = () => {
    if (!game?.id) return;
    localStorage.setItem(`${game.id}_modlists`, JSON.stringify(modlists));
    localStorage.setItem(`${game.id}_activeList`, activeList);
    alert("Modlists saved successfully.");
  };

  // -------------------- Render --------------------
  return (
    <div className="workshop-container p-6 bg-gray-900 min-h-screen text-white">
      {/* HEADER */}
      <header className="workshop-header-container mb-6">
        <div className="bg-gray-800/70 backdrop-blur-md p-6 rounded-3xl shadow-2xl flex flex-col gap-3">
          <h1 className="workshop-title text-5xl font-extrabold tracking-tight drop-shadow-lg">
            {game.name} Workshop
          </h1>
          <p className="workshop-subtitle text-lg md:text-xl">
            Effortless mod management (Game ID: {game.id})
          </p>
        </div>
      </header>

      {/* SEARCH */}
      <div className="search-container mb-4 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchMods()}
          placeholder="Search mods or enter Collection ID..."
          className="search-input flex-1 p-2 rounded-lg text-black"
        />
        <button
          onClick={() => fetchMods()}
          disabled={loading}
          className="search-button bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      <button
        onClick={saveModlistsManual}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        💾 Save Modlists
      </button>

      <ModlistBar
        activeList={activeList}
        setActiveList={setActiveList}
        showListOnly={showListOnly}
        setShowListOnly={setShowListOnly}
        modlists={modlists}
        installedMods={installedMods}
        displayedMods={displayedMods}
        createNewModlist={createNewModlist}
        renameModlist={renameModlist}
        deleteModlist={deleteModlist}
        setShowExport={setShowExport}
        setModlists={setModlists}
      />

      <ModGrid
        mods={displayedMods}
        installedMods={installedMods}
        activeList={activeList}
        modlists={modlists}
        setSelectedMod={setSelectedMod}
        addModToServer={addModToServer}
        setModlists={setModlists}
      />

      {selectedMod && (
        <ModModal mod={selectedMod} onClose={() => setSelectedMod(null)} />
      )}

      {showExport && (
        <ExportModal
          modIds={
            activeList && activeList !== "__installed__"
              ? modlists[activeList] || []
              : displayedMods.map((mod) => mod.modId)
          }
          onClose={() => setShowExport(false)}
        />
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
    
  );
}
