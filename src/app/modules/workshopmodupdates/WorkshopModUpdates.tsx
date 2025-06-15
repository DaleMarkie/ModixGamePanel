"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaCheckCircle,
  FaTimes,
  FaSyncAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./WorkshopModUpdates.css";

function Loading() {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      Loading mods...
    </div>
  );
}

function NoMods() {
  return <p className="no-mods">No mods found matching your criteria.</p>;
}

function ModCard({ mod, onClick }) {
  return (
    <div
      className={`mod-card ${mod.hasUpdate ? "update-available" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onClick(mod)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(mod);
      }}
      aria-label={`View details for mod ${mod.title}`}
      title={mod.title}
    >
      <img
        src={mod.thumbnail || "/default-mod.png"}
        alt={`Thumbnail for ${mod.title}`}
        className="mod-thumbnail"
        loading="lazy"
      />
      <div className="mod-info">
        <h3>{mod.title}</h3>
        <p className="mod-author">by {mod.author}</p>
        <p className="mod-updated">
          Latest Version: {mod.latestVersion}{" "}
          {mod.hasUpdate && (
            <span className="update-badge" title="Update available">
              <FaSyncAlt />
            </span>
          )}
        </p>
        {mod.hasMissingDeps && (
          <p className="mod-warning" title="Missing dependencies">
            <FaExclamationTriangle /> Missing dependencies
          </p>
        )}
      </div>
      <div className="mod-status">
        {mod.isInstalled ? (
          <FaCheckCircle className="installed-icon" title="Installed" />
        ) : (
          <FaTimes className="not-installed-icon" title="Not installed" />
        )}
      </div>
    </div>
  );
}

function Controls({
  search,
  setSearch,
  filter,
  setFilter,
  sortKey,
  setSortKey,
}) {
  return (
    <div className="wmu-controls">
      <div className="search-bar" title="Search mods by title or author">
        <FaSearch />
        <input
          type="text"
          placeholder="Search mods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search mods"
        />
      </div>
      <div className="filter-group" role="group" aria-label="Filter mods">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
          aria-pressed={filter === "all"}
        >
          All
        </button>
        <button
          className={filter === "installed" ? "active" : ""}
          onClick={() => setFilter("installed")}
          aria-pressed={filter === "installed"}
        >
          Installed
        </button>
        <button
          className={filter === "updates" ? "active" : ""}
          onClick={() => setFilter("updates")}
          aria-pressed={filter === "updates"}
        >
          Updates
        </button>
      </div>
      <div className="sort-group" role="group" aria-label="Sort mods">
        <button
          className={sortKey === "title" ? "active" : ""}
          onClick={() => setSortKey("title")}
          aria-pressed={sortKey === "title"}
          title="Sort by Title"
        >
          Title
        </button>
        <button
          className={sortKey === "author" ? "active" : ""}
          onClick={() => setSortKey("author")}
          aria-pressed={sortKey === "author"}
          title="Sort by Author"
        >
          Author
        </button>
        <button
          className={sortKey === "updated" ? "active" : ""}
          onClick={() => setSortKey("updated")}
          aria-pressed={sortKey === "updated"}
          title="Sort by Latest Update"
        >
          Updated
        </button>
      </div>
    </div>
  );
}

function ModDetailModal({ mod, onClose }) {
  if (!mod) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <button
          className="modal-close-btn"
          aria-label="Close mod details"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        <h2 id="modal-title">{mod.title} - Mod Details</h2>
        <img
          src={mod.thumbnail || "/default-mod.png"}
          alt={`Thumbnail for ${mod.title}`}
          className="modal-thumbnail"
        />
        <div className="modal-body">
          <p>
            <strong>Author:</strong> {mod.author}
          </p>
          <p>
            <strong>Latest Version:</strong> {mod.latestVersion}
          </p>
          {mod.hasMissingDeps && (
            <p className="modal-warning">
              <FaExclamationTriangle /> Missing Dependencies Detected
            </p>
          )}
          <p>{mod.description || "No description available."}</p>
          {mod.dependencies && mod.dependencies.length > 0 && (
            <>
              <h3>Dependencies</h3>
              <ul>
                {mod.dependencies.map((dep) => (
                  <li key={dep.id}>
                    {dep.title}{" "}
                    {dep.isMissing && (
                      <span className="missing">(Missing)</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkshopModUpdates() {
  const [mods, setMods] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, installed, updates
  const [sortKey, setSortKey] = useState("title"); // title, author, updated
  const [loading, setLoading] = useState(true);
  const [selectedMod, setSelectedMod] = useState(null);

  // Example: mock fetch mods
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setMods([
        {
          id: "1001",
          title: "Enhanced Graphics",
          author: "ModderX",
          latestVersion: "2.3.1",
          isInstalled: true,
          hasUpdate: true,
          hasMissingDeps: false,
          description: "Improves visual effects and textures.",
          thumbnail: "https://example.com/thumbs/enhanced-graphics.jpg",
          dependencies: [],
        },
        {
          id: "1002",
          title: "Realistic Weather",
          author: "WeatherWizard",
          latestVersion: "1.4.0",
          isInstalled: false,
          hasUpdate: false,
          hasMissingDeps: true,
          description: "Adds dynamic weather patterns and storms.",
          thumbnail: "https://example.com/thumbs/realistic-weather.jpg",
          dependencies: [
            { id: "1003", title: "Base Weather Lib", isMissing: false },
            { id: "9999", title: "Missing Dep Mod", isMissing: true },
          ],
        },
        {
          id: "1003",
          title: "Base Weather Lib",
          author: "LibraryDev",
          latestVersion: "1.0.0",
          isInstalled: true,
          hasUpdate: false,
          hasMissingDeps: false,
          description: "Provides foundational weather features for other mods.",
          thumbnail: "https://example.com/thumbs/base-weather-lib.jpg",
          dependencies: [],
        },
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  const filteredMods = useMemo(() => {
    return mods
      .filter((mod) => {
        const matchesSearch =
          mod.title.toLowerCase().includes(search.toLowerCase()) ||
          mod.author.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
          filter === "all" ||
          (filter === "installed" && mod.isInstalled) ||
          (filter === "updates" && mod.hasUpdate);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortKey === "title") return a.title.localeCompare(b.title);
        if (sortKey === "author") return a.author.localeCompare(b.author);
        if (sortKey === "updated") {
          // Sort by hasUpdate first, then title
          if (a.hasUpdate && !b.hasUpdate) return -1;
          if (!a.hasUpdate && b.hasUpdate) return 1;
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [mods, search, filter, sortKey]);

  const closeModal = () => setSelectedMod(null);

  return (
    <div className="workshop-mod-updates">
      <header className="wmu-header">
        <h2>Workshop Mod Updates</h2>
        <Controls
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          sortKey={sortKey}
          setSortKey={setSortKey}
        />
      </header>

      <main className="mod-list" aria-live="polite">
        {loading ? (
          <Loading />
        ) : filteredMods.length === 0 ? (
          <NoMods />
        ) : (
          filteredMods.map((mod) => (
            <ModCard key={mod.id} mod={mod} onClick={setSelectedMod} />
          ))
        )}
      </main>

      <ModDetailModal mod={selectedMod} onClose={closeModal} />
    </div>
  );
}
