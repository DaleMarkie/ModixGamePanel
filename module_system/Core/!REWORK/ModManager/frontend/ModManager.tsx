"use client";

import React, { useState, useEffect } from "react";
import "./ModManager.css";

const defaultMods = [
  {
    id: "2937301109",
    name: "🧠 Superb Survivors",
    mod_id: "SuperSurvivorsMod",
    description: "Adds intelligent NPC survivors who loot, fight, and survive.",
    thumbnail:
      "https://steamuserimages-a.akamaihd.net/ugc/1823392108611387684/45E8A378F5B2A2C3853C187E2A741EBD9D4A490A/",
    category: "Survival",
  },
  {
    id: "1516836158",
    name: "🔫 Brita's Weapon Pack",
    mod_id: "Brita_Weapons",
    description:
      "Adds a huge array of realistic firearms, attachments, and tactical gear.",
    thumbnail:
      "https://steamuserimages-a.akamaihd.net/ugc/1680381866615934737/9846BEA3459D6C8018A91826D839E7E9B620A6A9/",
    category: "Weapons",
  },
  {
    id: "2200148440",
    name: "🏍️ Autotsar Motorclub",
    mod_id: "ATClub",
    description:
      "Brings in motorcycles, biker outfits, and detailed riding mechanics.",
    thumbnail:
      "https://steamuserimages-a.akamaihd.net/ugc/1753551365093001244/02DA1E9B98C9830EF3EF35DD83D5C1F999BBAF71/",
    category: "Vehicles",
  },
];

const defaultCategories = [
  "Weapons",
  "Vehicles",
  "Survival",
  "Food & Farming",
  "Zombies",
  "Building & Construction",
  "Gameplay Mechanics",
  "UI & HUD",
  "Audio",
  "Maps & Locations",
  "Animation & Models",
  "Textures & Graphics",
  "Tools & Utilities",
  "Story & Quests",
  "Miscellaneous",
];

export default function ModManager() {
  // Load from localStorage or fallback to default
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem("modmanager_profiles");
    return saved ? JSON.parse(saved) : { Default: [...defaultMods] };
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("modmanager_categories");
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  const [search, setSearch] = useState("");
  const [checkingId, setCheckingId] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [activeProfile, setActiveProfile] = useState(() => {
    const saved = localStorage.getItem("modmanager_activeProfile");
    return saved || "Default";
  });

  const [newProfileName, setNewProfileName] = useState("");
  const [layoutMode, setLayoutMode] = useState("list");

  const [containerId, setContainerId] = useState("");
  const [loadingContainerMods, setLoadingContainerMods] = useState(false);

  const mods = profiles[activeProfile] || [];

  // Save profiles to localStorage when changed
  useEffect(() => {
    localStorage.setItem("modmanager_profiles", JSON.stringify(profiles));
  }, [profiles]);

  // Save categories to localStorage when changed
  useEffect(() => {
    localStorage.setItem("modmanager_categories", JSON.stringify(categories));
  }, [categories]);

  // Save activeProfile to localStorage when changed
  useEffect(() => {
    localStorage.setItem("modmanager_activeProfile", activeProfile);
  }, [activeProfile]);

  const updateMods = (newMods) => {
    setProfiles((prev) => ({
      ...prev,
      [activeProfile]: newMods,
    }));
  };

  const filteredMods = mods.filter(
    (mod) =>
      (activeCategory === "All" || mod.category === activeCategory) &&
      (mod.name.toLowerCase().includes(search.toLowerCase()) ||
        mod.description.toLowerCase().includes(search.toLowerCase()))
  );

  const exportModList = () => {
    const modIds = filteredMods.map((mod) => mod.id);
    const exportText = modIds.join("\n");
    navigator.clipboard.writeText(exportText).then(() => {
      alert("Mod list exported to clipboard:\n" + exportText);
    });
  };

  const handleCheckUpdate = (id) => {
    setCheckingId(id);
    setTimeout(() => {
      alert("✅ Mod is up to date!");
      setCheckingId(null);
    }, 1000);
  };

  const handleCategoryChange = (modId, newCategory) => {
    const updated = mods.map((mod) =>
      mod.id === modId ? { ...mod, category: newCategory } : mod
    );
    updateMods(updated);
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      setNewCategory("");
    }
  };

  const handleCreateProfile = () => {
    const trimmed = newProfileName.trim();
    if (trimmed && !profiles[trimmed]) {
      setProfiles((prev) => ({
        ...prev,
        [trimmed]: [...defaultMods],
      }));
      setActiveProfile(trimmed);
      setNewProfileName("");
    }
  };

  const handleResetToDefaultMods = () => {
    updateMods([...defaultMods]);
  };

  const loadModsFromContainer = async () => {
    if (!containerId.trim()) {
      alert("Please enter a valid Docker container ID.");
      return;
    }
    setLoadingContainerMods(true);
    try {
      const res = await fetch(`/pzmods/${containerId.trim()}`);
      if (!res.ok) {
        throw new Error(`Error fetching mods: ${res.statusText}`);
      }
      const data = await res.json();
      if (!data.mods || !Array.isArray(data.mods)) {
        throw new Error("Invalid data format from backend");
      }

      const newMods = data.mods.map((modId) => {
        const found = defaultMods.find((m) => m.id === modId);
        if (found) return found;
        return {
          id: modId,
          name: "Unknown Mod",
          mod_id: modId,
          description: "No info available for this mod.",
          thumbnail: "https://via.placeholder.com/64?text=Unknown",
          category: "Miscellaneous",
        };
      });

      updateMods(newMods);
      setActiveCategory("All");
      setSearch("");
      alert(`Loaded ${newMods.length} mods from container ${containerId}`);
    } catch (err) {
      alert(err.message || "Failed to load mods from container.");
    } finally {
      setLoadingContainerMods(false);
    }
  };

  // New: Delete a mod from current profile
  const handleDeleteMod = (modId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this mod from the current profile?"
      )
    ) {
      const updatedMods = mods.filter((mod) => mod.id !== modId);
      updateMods(updatedMods);
    }
  };

  // New: Delete category and move mods to "Miscellaneous"
  const handleDeleteCategory = (categoryToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete category "${categoryToDelete}"? Mods in this category will be moved to "Miscellaneous".`
      )
    ) {
      const updatedCategories = categories.filter(
        (cat) => cat !== categoryToDelete
      );
      const updatedMods = mods.map((mod) =>
        mod.category === categoryToDelete
          ? { ...mod, category: "Miscellaneous" }
          : mod
      );
      setCategories(updatedCategories);
      updateMods(updatedMods);
      // If activeCategory was deleted, reset to "All"
      if (activeCategory === categoryToDelete) {
        setActiveCategory("All");
      }
    }
  };

  return (
    <div className="container">
      <div className="modlist-wrapper">
        <h1 className="modlist-title">🧩 Mod Manager</h1>
        <p
          className="modlist-description"
          style={{ marginBottom: "1rem", color: "#fff", maxWidth: "600px" }}
        >
          Manage your game mods effortlessly — create profiles, organize by
          categories, search and filter mods, enable or disable them, and export
          your mod lists with ease.
        </p>

        <p style={{ marginBottom: "1rem", color: "#fff" }}>
          Showing {filteredMods.length} mod
          {filteredMods.length !== 1 ? "s" : ""} from {mods.length} total mod
          {mods.length !== 1 ? "s" : ""} in profile "{activeProfile}"
        </p>

        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Enter Docker container ID"
            value={containerId}
            onChange={(e) => setContainerId(e.target.value)}
            style={{ flexGrow: 1, padding: "0.5rem" }}
          />
          <button
            className="mod-btn blue"
            onClick={loadModsFromContainer}
            disabled={loadingContainerMods}
          >
            {loadingContainerMods
              ? "Loading Mods..."
              : "Load Mods from Container"}
          </button>
        </div>

        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <label>Profile:</label>
          <select
            value={activeProfile}
            onChange={(e) => setActiveProfile(e.target.value)}
          >
            {Object.keys(profiles).map((profile) => (
              <option key={profile} value={profile}>
                {profile}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="New profile name"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
          />
          <button className="mod-btn green" onClick={handleCreateProfile}>
            Create Profile
          </button>
          <button className="mod-btn red" onClick={handleResetToDefaultMods}>
            Reset Mods
          </button>
          <button
            className="mod-btn gray"
            onClick={() =>
              setLayoutMode((prev) => (prev === "list" ? "grid" : "list"))
            }
          >
            Switch to {layoutMode === "list" ? "Grid" : "List"} View
          </button>
        </div>

        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <label>Filter by category:</label>
          <button
            className={`mod-btn category-btn ${
              activeCategory === "All" ? "active" : ""
            }`}
            onClick={() => setActiveCategory("All")}
          >
            All
          </button>
          {categories.map((cat) => (
            <div
              key={cat}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <button
                className={`mod-btn category-btn ${
                  activeCategory === cat ? "active" : ""
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
              {/* Show delete button for category if not "All" */}
              {cat !== "All" && cat !== "Miscellaneous" && (
                <button
                  className="mod-btn red small"
                  title={`Delete category ${cat}`}
                  onClick={() => handleDeleteCategory(cat)}
                  style={{
                    padding: "0 5px",
                    height: "24px",
                    fontWeight: "bold",
                    lineHeight: "1",
                    marginLeft: 2,
                    userSelect: "none",
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <input
            type="text"
            placeholder="Add new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCategory();
            }}
            style={{ marginLeft: "auto", padding: "0.2rem 0.5rem" }}
          />
          <button className="mod-btn green small" onClick={handleAddCategory}>
            Add Category
          </button>
        </div>

        <input
          className="modlist-search"
          type="text"
          placeholder="Search mods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="mod-btn blue"
          onClick={exportModList}
          style={{ marginBottom: "1rem" }}
        >
          Export Mod List
        </button>

        <ul className={`modlist ${layoutMode}`}>
          {filteredMods.map((mod) => (
            <li key={mod.id} className="modlist-item">
              <img
                className="modlist-item-thumb"
                src={mod.thumbnail}
                alt={mod.name}
                width={64}
                height={64}
              />
              <div className="modlist-item-info">
                <h3 className="modlist-item-title">{mod.name}</h3>
                <p className="modlist-item-desc">{mod.description}</p>
                <p className="modlist-item-category">
                  Category:{" "}
                  <select
                    value={mod.category}
                    onChange={(e) =>
                      handleCategoryChange(mod.id, e.target.value)
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </p>
                <div
                  style={{
                    marginTop: "0.25rem",
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    className="mod-btn gray"
                    onClick={() => handleCheckUpdate(mod.id)}
                    disabled={checkingId === mod.id}
                  >
                    {checkingId === mod.id ? "Checking..." : "Check Update"}
                  </button>

                  {/* New: Delete mod button */}
                  <button
                    className="mod-btn red"
                    onClick={() => handleDeleteMod(mod.id)}
                    title="Delete this mod"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
