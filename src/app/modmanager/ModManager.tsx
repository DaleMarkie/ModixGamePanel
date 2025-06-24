"use client";

import React, { useState } from "react";
import "./ModManager.css";

const initialMods = [
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
  const [search, setSearch] = useState("");
  const [checkingId, setCheckingId] = useState(null);
  const [mods, setMods] = useState(initialMods);
  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredMods = mods.filter(
    (mod) =>
      (activeCategory === "All" || mod.category === activeCategory) &&
      (mod.name.toLowerCase().includes(search.toLowerCase()) ||
        mod.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCheckUpdate = (id) => {
    setCheckingId(id);
    setTimeout(() => {
      alert("✅ Mod is up to date!");
      setCheckingId(null);
    }, 1000);
  };

  const handleCategoryChange = (modId, newCategory) => {
    setMods((prevMods) =>
      prevMods.map((mod) =>
        mod.id === modId ? { ...mod, category: newCategory } : mod
      )
    );
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      setNewCategory("");
    }
  };

  return (
    <div className="container">
      <div className="modlist-wrapper">
        <h1 className="modlist-title">🧩 Mod Manager</h1>

        <div
          className="category-filters"
          style={{
            marginBottom: "1rem",
            flexWrap: "wrap",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <button
            className={`mod-btn ${activeCategory === "All" ? "blue" : "gray"}`}
            onClick={() => setActiveCategory("All")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`mod-btn ${activeCategory === cat ? "blue" : "gray"}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search mods..."
          className="modlist-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ margin: "1rem 0" }}>
          <input
            type="text"
            placeholder="Add new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            style={{ marginRight: "0.5rem" }}
          />
          <button onClick={handleAddCategory} className="mod-btn green">
            Add Category
          </button>
        </div>

        <div className="modlist-list">
          {filteredMods.length === 0 && (
            <p className="modlist-empty">🔍 No mods match your filters.</p>
          )}
          {filteredMods.map((mod) => (
            <div className="modlist-item vertical" key={mod.id}>
              <img
                src={mod.thumbnail}
                alt={mod.name}
                className="modlist-thumb"
              />
              <div className="modlist-info">
                <h3>{mod.name}</h3>
                <span className="mod-id">{mod.mod_id}</span>
                <p>{mod.description}</p>
                <label>
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
                </label>
                <div
                  className="modlist-buttons"
                  style={{ marginTop: "0.5rem" }}
                >
                  <button className="mod-btn green">Enable</button>
                  <button className="mod-btn yellow">Disable</button>
                  <button className="mod-btn red">Uninstall</button>
                  <button
                    className="mod-btn blue"
                    onClick={() => handleCheckUpdate(mod.id)}
                    disabled={checkingId === mod.id}
                  >
                    {checkingId === mod.id
                      ? "Checking..."
                      : "Check for Updates"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
