import React, { useState, useEffect, useMemo } from "react";
import { Copy, Download } from "lucide-react";

interface ModInfo {
  modId: string;
  title: string;
  dependencies: string[];
  thumbnail?: string;
  description?: string;
}

const SteamParser = () => {
  const [input, setInput] = useState("");
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [collectionAuthor, setCollectionAuthor] = useState<{
    name: string;
    url?: string;
  } | null>(null);
  const [filter, setFilter] = useState("");
  const [showDeps, setShowDeps] = useState(true);
  const [sortBy, setSortBy] = useState<"title" | "modId">("title");
  const [selectedMods, setSelectedMods] = useState<Set<string>>(new Set());
  const [hoveredModId, setHoveredModId] = useState<string | null>(null);

  // Detect if input is a collection ID (only digits)
  const isCollectionId = (text: string) => /^\d+$/.test(text.trim());

  const fetchHtml = async (url: string) => {
    const res = await fetch(`https://corsproxy.io/?${url}`);
    if (!res.ok) throw new Error("Network error");
    return res.text();
  };

  // Fetch mod details page for title, dependencies, thumbnail, description
  const fetchModDetails = async (
    id: string
  ): Promise<{
    title: string;
    deps: string[];
    thumbnail?: string;
    description?: string;
  }> => {
    try {
      const html = await fetchHtml(
        `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`
      );
      const doc = new DOMParser().parseFromString(html, "text/html");
      const title =
        doc.querySelector(".workshopItemTitle")?.textContent?.trim() ?? id;
      const deps = Array.from(doc.querySelectorAll(".requiredItems a"))
        .map((a) => a.getAttribute("href")?.match(/id=(\d+)/)?.[1])
        .filter((d): d is string => !!d);

      // Thumbnail image
      // Workshop page usually has <img class="workshopItemPreviewImage" src="...">
      // Or a div with style background-image inside .workshopItemPreviewImage or similar
      const thumbEl =
        doc.querySelector(".workshopItemPreviewImage img") ||
        doc.querySelector(".workshopItemPreviewImage");
      let thumbnail: string | undefined;
      if (thumbEl) {
        if (thumbEl.tagName === "IMG") {
          thumbnail = (thumbEl as HTMLImageElement).src;
        } else {
          // maybe background-image style
          const style = (thumbEl as HTMLElement).style.backgroundImage;
          if (style) {
            const match = style.match(/url\("(.*?)"\)/);
            if (match) thumbnail = match[1];
          }
        }
      }

      // Description (inside #highlightContent or .workshopItemDescription)
      // Let's try .workshopItemDescription > div:first-child, fallback to #highlightContent
      let description = "";
      const descEl = doc
        .querySelector(".workshopItemDescription")
        ?.textContent?.trim();
      if (descEl) {
        description = descEl;
      } else {
        const altDescEl = doc.querySelector("#highlightContent");
        if (altDescEl) {
          description = altDescEl.textContent?.trim() ?? "";
        }
      }

      return { title, deps, thumbnail, description };
    } catch {
      return { title: id, deps: [] };
    }
  };

  const fetchMods = async () => {
    if (!input.trim()) {
      setError("Enter a valid input.");
      return;
    }
    setLoading(true);
    setError("");
    setMods([]);
    setCollectionAuthor(null);
    setSelectedMods(new Set());
    setHoveredModId(null);

    try {
      const url = isCollectionId(input)
        ? `https://steamcommunity.com/sharedfiles/filedetails/?id=${input.trim()}`
        : `https://steamcommunity.com/workshop/browse/?appid=108600&searchtext=${encodeURIComponent(
            input.trim()
          )}`;

      const html = await fetchHtml(url);
      const doc = new DOMParser().parseFromString(html, "text/html");

      if (isCollectionId(input)) {
        const authorEl = doc.querySelector(".friendBlockContent");
        const authorName = authorEl?.textContent?.trim();
        const profileUrl =
          authorEl?.parentElement?.getAttribute("href") ?? undefined;
        if (authorName) {
          setCollectionAuthor({ name: authorName, url: profileUrl });
        }
      }

      const items = isCollectionId(input)
        ? Array.from(doc.querySelectorAll(".collectionItem"))
        : Array.from(doc.querySelectorAll(".workshopItem"));

      if (!items.length) throw new Error("No mods found");

      const parsed = await Promise.all(
        items.map(async (item) => {
          const link = item.querySelector("a")?.href || "";
          const modId = link.match(/id=(\d+)/)?.[1] || "Unknown";
          const { title, deps, thumbnail, description } = await fetchModDetails(
            modId
          );
          return { modId, title, dependencies: deps, thumbnail, description };
        })
      );

      setMods(parsed);
      setSelectedMods(new Set(parsed.map((m) => m.modId)));
    } catch (e) {
      setError("Failed to fetch mods.");
    } finally {
      setLoading(false);
    }
  };

  const allIds = useMemo(() => {
    const selected = mods.filter((m) => selectedMods.has(m.modId));
    const ids = selected.flatMap((m) =>
      showDeps ? [m.modId, ...m.dependencies] : [m.modId]
    );
    return Array.from(new Set(ids));
  }, [mods, selectedMods, showDeps]);

  const filteredMods = useMemo(() => {
    if (!filter.trim()) return mods;
    const lower = filter.toLowerCase();
    return mods.filter(
      (m) =>
        m.title.toLowerCase().includes(lower) ||
        m.modId.toLowerCase().includes(lower)
    );
  }, [mods, filter]);

  const sortedMods = useMemo(() => {
    return [...filteredMods].sort((a, b) =>
      sortBy === "title"
        ? a.title.localeCompare(b.title)
        : a.modId.localeCompare(b.modId)
    );
  }, [filteredMods, sortBy]);

  const toggleMod = (modId: string) => {
    setSelectedMods((prev) => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(allIds.join(","));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([allIds.join(",")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modids.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddToServer = () => {
    alert("⚠️ This feature is not working yet.");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white font-sans min-h-screen bg-neutral-900">
      <h1 className="text-4xl font-bold text-green-400 mb-2">
        Steam Parser + Dependency List
      </h1>
      <p className="mb-6 text-gray-300 max-w-3xl">
        This page allows you to analyze your Steam game mods to automatically
        detect dependencies and conflicts. Easily manage and organize your Steam
        Workshop mods by generating a comprehensive dependency list, ensuring
        your mods work seamlessly together and preventing compatibility issues.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          value={input}
          placeholder="Collection ID or Mod Search"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchMods()}
          className="flex-1 px-4 py-3 rounded bg-neutral-800 border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          onClick={fetchMods}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded transition"
          disabled={loading}
        >
          {loading ? "Fetching…" : "Fetch Mods"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 mb-6 font-semibold text-center">{error}</p>
      )}

      {collectionAuthor && (
        <p className="mb-6 text-sm text-gray-300 text-center">
          📁 Collection by{" "}
          {collectionAuthor.url ? (
            <a
              href={collectionAuthor.url}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-green-400"
            >
              {collectionAuthor.name}
            </a>
          ) : (
            collectionAuthor.name
          )}
        </p>
      )}

      {mods.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDeps}
                  onChange={() => setShowDeps((v) => !v)}
                  className="cursor-pointer"
                />
                Show Dependencies
              </label>

              <label className="flex items-center gap-1">
                Filter:{" "}
                <input
                  type="text"
                  placeholder="Search mods..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-neutral-800 text-white px-2 py-1 rounded border border-green-500"
                />
              </label>

              <label className="flex items-center gap-1">
                Sort by:{" "}
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value === "title" ? "title" : "modId")
                  }
                  className="bg-neutral-800 text-white px-2 py-1 rounded border border-green-500"
                >
                  <option value="title">Title</option>
                  <option value="modId">Mod ID</option>
                </select>
              </label>
            </div>

            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handleCopy}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                {copied ? (
                  "Copied ✓"
                ) : (
                  <>
                    <Copy className="inline-block w-4 h-4 mr-1" /> Copy IDs
                  </>
                )}
              </button>
              <button
                onClick={handleExport}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                <Download className="inline-block w-4 h-4 mr-1" /> Export .txt
              </button>
              <button
                onClick={handleAddToServer}
                className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700"
              >
                Add to Server (WIP)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-green-600">
            <table className="w-full table-auto text-left border-collapse border-green-600">
              <thead className="bg-green-800">
                <tr>
                  <th className="px-4 py-2 w-8"></th>
                  <th className="px-4 py-2">Preview</th>
                  <th className="px-4 py-2">Mod Title</th>
                  <th className="px-4 py-2">Mod ID</th>
                  <th className="px-4 py-2">Dependencies</th>
                </tr>
              </thead>
              <tbody>
                {sortedMods.map((mod) => (
                  <tr
                    key={mod.modId}
                    className="border-t border-green-700 hover:bg-green-900 relative"
                    onMouseEnter={() => setHoveredModId(mod.modId)}
                    onMouseLeave={() => setHoveredModId(null)}
                  >
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedMods.has(mod.modId)}
                        onChange={() => toggleMod(mod.modId)}
                        className="cursor-pointer"
                      />
                    </td>

                    <td className="px-4 py-2 w-24">
                      {mod.thumbnail ? (
                        <img
                          src={mod.thumbnail}
                          alt={`${mod.title} thumbnail`}
                          className="w-20 h-12 object-cover rounded border border-green-600"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-20 h-12 bg-neutral-700 flex items-center justify-center rounded text-xs text-gray-400">
                          No preview
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-2 max-w-xs break-words">
                      {mod.title}
                    </td>
                    <td className="px-4 py-2">{mod.modId}</td>
                    <td className="px-4 py-2 max-w-xs break-words">
                      {showDeps && mod.dependencies.length > 0
                        ? mod.dependencies.join(", ")
                        : "-"}
                    </td>

                    {/* Hover detail box */}
                    {hoveredModId === mod.modId && mod.description && (
                      <td
                        className="absolute left-full top-0 ml-2 z-50 max-w-xs p-3 bg-neutral-900 border border-green-600 rounded shadow-lg text-sm text-gray-300"
                        style={{ minWidth: "300px" }}
                      >
                        <strong>Description:</strong>
                        <p className="mt-1 whitespace-pre-wrap">
                          {mod.description}
                        </p>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default SteamParser;
