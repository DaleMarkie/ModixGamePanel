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

const ExportModal = ({
  modIds,
  onClose,
}: {
  modIds: string[];
  onClose: () => void;
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const copy = () =>
    navigator.clipboard?.writeText(modIds.join(","))?.catch(() => {
      ref.current?.select();
      document.execCommand("copy");
    });
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <textarea
          ref={ref}
          readOnly
          value={modIds.join(",")}
          className="modal-textarea"
        />
        <div className="modal-buttons">
          <button
            onClick={() => copy() && alert("Copied mod IDs to clipboard!")}
            className="modal-button copy-button"
          >
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

  useEffect(() => {
    const syncGame = () => {
      const g = localStorage.getItem("activeGameId");
      setActiveGame(g);
      setInput("");
      setMods([]);
    };
    window.addEventListener("storage", syncGame);
    syncGame();
    return () => window.removeEventListener("storage", syncGame);
  }, []);

  // Load saved data
  useEffect(() => {
    ["favorites", "modlists", "modColors"].forEach((k) => {
      const val = localStorage.getItem(k);
      if (val)
        (k === "favorites"
          ? setFavorites
          : k === "modlists"
          ? setModlists
          : setModColors)(JSON.parse(val));
    });
    const savedList = localStorage.getItem("activeList");
    if (savedList) setActiveList(savedList);
  }, []);

  // Persist data
  useEffect(
    () => localStorage.setItem("favorites", JSON.stringify(favorites)),
    [favorites]
  );
  useEffect(
    () => localStorage.setItem("modColors", JSON.stringify(modColors)),
    [modColors]
  );
  useEffect(() => localStorage.setItem("activeList", activeList), [activeList]);
  useEffect(
    () => localStorage.setItem("modlists", JSON.stringify(modlists)),
    [modlists]
  );

  const parseInstalledMods = (content: string) =>
    (
      content
        .split("\n")
        .find((l) => l.startsWith("WorkshopItems="))
        ?.replace("WorkshopItems=", "") || ""
    )
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const updateServerIniContent = (modIds: string[]) => {
    const lines = serverIniContent.split("\n");
    const idx = lines.findIndex((l) => l.startsWith("WorkshopItems="));
    if (idx >= 0) lines[idx] = `WorkshopItems=${modIds.join(",")}`;
    else lines.push(`WorkshopItems=${modIds.join(",")}`);
    setServerIniContent(lines.join("\n"));
    setInstalledMods(modIds);
  };
  const addModToServer = (modId: string) =>
    !installedMods.includes(modId) &&
    updateServerIniContent([...installedMods, modId]);

  const fetchModInfo = async (modId: string): Promise<Mod> => {
    try {
      const res = await fetch(
        `https://corsproxy.io/?https://steamcommunity.com/sharedfiles/filedetails/?id=${modId}`
      );
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const title =
        doc.querySelector(".workshopItemTitle")?.textContent?.trim() ||
        `Mod ${modId}`;
      const imgEl =
        doc.querySelector(".workshopItemPreviewImageMain img") ||
        doc.querySelector(".workshopItemPreviewImage img");
      const image =
        (imgEl as HTMLImageElement)?.src ||
        "https://via.placeholder.com/260x140?text=No+Image";
      const desc = (
        doc.querySelector(".workshopItemDescription")?.textContent || ""
      )
        .slice(0, 300)
        .trim();
      const version = desc.match(/v?\d+(\.\d+)+/i)?.[0];
      const lastUpdateText = doc
        .querySelector(".detailsStatRight")
        ?.textContent?.trim();
      const lastUpdate =
        lastUpdateText && !isNaN(Date.parse(lastUpdateText))
          ? new Date(lastUpdateText).toISOString()
          : undefined;
      return { modId, title, image, description: desc, version, lastUpdate };
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
      const res = await fetch(
        `https://corsproxy.io/?https://steamcommunity.com/workshop/browse/?appid=${activeGame}&browsesort=trend`
      );
      const doc = new DOMParser().parseFromString(
        await res.text(),
        "text/html"
      );
      setMods(
        [...doc.querySelectorAll(".workshopItem")].slice(0, 50).map((item) => {
          const link = item.querySelector("a")?.href || "#";
          const modId = link.match(/id=(\d+)/)?.[1] || crypto.randomUUID();
          const title =
            item.querySelector(".workshopItemTitle")?.textContent.trim() ||
            "Untitled";
          const image =
            item.querySelector("img")?.src ||
            "https://via.placeholder.com/260x140?text=No+Image";
          return { modId, title, image };
        })
      );
    } catch {
      setError("Failed to load Workshop mods.");
    } finally {
      setLoading(false);
    }
  }, [activeGame]);

  const fetchMods = useCallback(async () => {
    if (!activeGame) return;
    setLoading(true);
    setError("");
    setMods([]);
    const q = input.trim();
    try {
      if (!q) {
        await fetchDefaultWorkshopMods();
        return;
      }
      const isCollection = /^\d{6,}$/.test(q);
      const url = isCollection
        ? `https://steamcommunity.com/sharedfiles/filedetails/?id=${q}`
        : `https://steamcommunity.com/workshop/browse/?appid=${activeGame}&searchtext=${encodeURIComponent(
            q
          )}&browsesort=trend`;
      const doc = new DOMParser().parseFromString(
        await (await fetch(`https://corsproxy.io/?${url}`)).text(),
        "text/html"
      );
      const items: Mod[] = [];
      if (isCollection) {
        for (let linkEl of [...doc.querySelectorAll(".collectionItem a")]) {
          const id = linkEl.href.match(/id=(\d+)/)?.[1];
          if (!id) continue;
          items.push(await fetchModInfo(id));
        }
      } else {
        [...doc.querySelectorAll(".workshopItem")]
          .slice(0, 50)
          .forEach((item) => {
            const link = item.querySelector("a")?.href || "#";
            const modId = link.match(/id=(\d+)/)?.[1] || crypto.randomUUID();
            const title =
              item.querySelector(".workshopItemTitle")?.textContent.trim() ||
              "Untitled";
            const image =
              item.querySelector("img")?.src ||
              "https://via.placeholder.com/260x140?text=No+Image";
            items.push({ modId, title, image });
          });
      }
      if (!items.length) throw new Error("No mods found.");
      setMods(items);
    } catch {
      setError(
        "Oops! We couldn't load mods. Check if the active game supports Steam Workshop"
      );
    } finally {
      setLoading(false);
    }
  }, [input, fetchDefaultWorkshopMods, activeGame]);

  useEffect(() => {
    if (activeGame) fetchMods();
  }, [activeGame, fetchMods]);

  const displayedMods = useMemo(() => {
    if (activeList === "__workshop__") return mods;
    if (showListOnly && activeList)
      return mods.filter((m) => modlists[activeList]?.includes(m.modId));
    return mods;
  }, [mods, activeList, showListOnly, modlists]);

  const modlistActions = {
    create: () => {
      const n = prompt("Enter new modlist:");
      if (!n) return alert("Name required");
      if (modlists[n]) return alert("Exists");
      setModlists((prev) => ({ ...prev, [n]: [] }));
      setActiveList(n);
    },
    rename: () => {
      if (!activeList || activeList === "__workshop__") return;
      const n = prompt("New name:");
      if (!n) return alert("Name required");
      if (modlists[n]) return alert("Exists");
      setModlists((prev) => {
        const u = { ...prev, [n]: prev[activeList] };
        delete u[activeList];
        return u;
      });
      setActiveList(n);
    },
    delete: () => {
      if (!activeList || activeList === "__workshop__") return;
      if (!confirm(`Delete "${activeList}"?`)) return;
      setModlists((prev) => {
        const u = { ...prev };
        delete u[activeList];
        return u;
      });
      setActiveList("__workshop__");
    },
  };

  const downloadIni = () => {
    const b = new Blob([serverIniContent], {
      type: "text/plain;charset=utf-8",
    });
    const l = document.createElement("a");
    l.href = URL.createObjectURL(b);
    l.download = serverIniFile?.name || "server.ini";
    l.click();
  };

  return (
    <div className="workshop-container">
      <div className="search-container">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchMods()}
          placeholder="Search for mods..."
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

      <div className="server-ini-loader">
        <label>🗄 Load server.ini</label>
        <input
          type="file"
          accept=".ini"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => {
              const c = r.result as string;
              setServerIniContent(c);
              setInstalledMods(parseInstalledMods(c));
              setServerIniFile(f);
            };
            r.readAsText(f);
          }}
        />
        {serverIniFile && (
          <button onClick={downloadIni}>💾 Download Updated server.ini</button>
        )}
      </div>

      <div className="modlist-bar">
        <select
          value={activeList}
          onChange={(e) => setActiveList(e.target.value)}
        >
          <option value="__workshop__">Workshop</option>
          {Object.keys(modlists).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button onClick={modlistActions.create}>➕ New</button>
        {activeList && activeList !== "__workshop__" && (
          <>
            <button onClick={modlistActions.rename}>✏ Rename</button>
            <button onClick={modlistActions.delete}>🗑 Delete</button>
            <label>
              <input
                type="checkbox"
                checked={showListOnly}
                onChange={() => setShowListOnly(!showListOnly)}
              />{" "}
              Show List Only
            </label>
            <button onClick={() => setShowExport(true)}>📤 Export</button>
            <button onClick={() => alert(`Modlist "${activeList}" saved! ✅`)}>
              💾 Save Modlist
            </button>
          </>
        )}
      </div>

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
                  const cur = prev[activeList] || [];
                  const upd = cur.includes(mod.modId)
                    ? cur.filter((i) => i !== mod.modId)
                    : [...cur, mod.modId];
                  return { ...prev, [activeList]: upd };
                });
              }}
              onAddToServer={() => addModToServer(mod.modId)}
              onSetColor={(c) =>
                setModColors((prev) => ({ ...prev, [mod.modId]: c }))
              }
            />
          </Suspense>
        ))}
      </div>

      {selectedMod && (
        <ModModal mod={selectedMod} onClose={() => setSelectedMod(null)} />
      )}
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
      {error && <div className="error-message">{error}</div>}

      {popup && (
        <PopupModal onClose={() => setPopup(null)}>
          {popup === "updates" && (
            <ModUpdates
              updates={installedMods
                .map((id) => mods.find((m) => m.modId === id))
                .filter(Boolean)
                .map((m) => ({
                  modId: m!.modId,
                  modName: m!.title,
                  lastWorkshopUpdate: m!.lastUpdate,
                  currentVersion: m!.version,
                  description: m!.description,
                }))}
            />
          )}
          {popup === "logs" && (
            <ModLogs
              installedMods={installedMods.map(
                (id) =>
                  mods.find((m) => m.modId === id) || { modId: id, title: id }
              )}
            />
          )}
        </PopupModal>
      )}
    </div>
  );
}
