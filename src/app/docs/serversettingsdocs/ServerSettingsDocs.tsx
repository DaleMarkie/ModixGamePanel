"use client";
import React, { useState, useMemo } from "react";
import "./ServerSettingsDocs.css"; // Use your existing CSS for styling

const allSettings = [
  {
    category: "🛡️ Server Info",
    description: "Basic server info and connection settings.",
    settings: [
      {
        name: "PublicName",
        label: "Server Name",
        tooltip: "The name that shows in server lists.",
        defaultValue: "My PZ Server",
        valueType: "string",
      },
      {
        name: "MaxPlayers",
        label: "Max Players",
        tooltip: "Maximum allowed players on the server.",
        defaultValue: 8,
        valueType: "number",
      },
      {
        name: "Password",
        label: "Password",
        tooltip: "Password players need to connect, optional.",
        defaultValue: "(empty)",
        valueType: "string",
      },
      {
        name: "PVP",
        label: "Enable PvP",
        tooltip: "Allow players to attack each other.",
        defaultValue: false,
        valueType: "boolean",
      },
    ],
  },
  {
    category: "🧟‍♂️ Zombies & Gameplay",
    description: "Customize zombies and gameplay mechanics.",
    settings: [
      {
        name: "ZombieCount",
        label: "Zombie Count (%)",
        tooltip: "Percent of default zombie spawn rate.",
        defaultValue: 50,
        valueType: "number",
      },
      {
        name: "XPMultiplier",
        label: "XP Multiplier",
        tooltip: "Speed multiplier for XP gain.",
        defaultValue: 1,
        valueType: "number",
      },
      {
        name: "DayLength",
        label: "Day Length (hours)",
        tooltip: "Duration of an in-game day.",
        defaultValue: 1,
        valueType: "number",
      },
    ],
  },
  {
    category: "🌍 World & Visuals",
    description: "World generation and visual settings.",
    settings: [
      {
        name: "StartMonth",
        label: "Start Month",
        tooltip: "Month the game world starts in.",
        defaultValue: 3,
        valueType: "number",
      },
      {
        name: "StartYear",
        label: "Start Year",
        tooltip: "Year the game world starts in.",
        defaultValue: 2025,
        valueType: "number",
      },
      {
        name: "Enable3rdPerson",
        label: "Enable 3rd Person View",
        tooltip: "Allow players to use 3rd person camera.",
        defaultValue: false,
        valueType: "boolean",
      },
    ],
  },
];

export default function ServerSettingsDocPage() {
  const [collapsedCategories, setCollapsedCategories] = useState({});

  function toggleCategory(catName) {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  }

  return (
    <div className="fancy-wrapper">
      <header className="fancy-header">
        <h1>⚙️ Server Settings Documentation</h1>
        <p
          className="category-desc"
          style={{
            marginTop: "-1rem",
            marginBottom: "1.5rem",
            fontStyle: "italic",
            color: "#555",
          }}
        >
          Here you can find detailed info about each server setting and its
          default value.
        </p>
      </header>

      <main className="settings-main">
        {allSettings.map(({ category, description, settings }) => (
          <section key={category} className="category-section">
            <button
              className="category-header"
              onClick={() => toggleCategory(category)}
              aria-expanded={!collapsedCategories[category]}
              aria-controls={`cat-panel-${category}`}
            >
              <span>{category}</span>
              <svg
                className={`arrow-icon ${
                  collapsedCategories[category] ? "collapsed" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <p className="category-desc">{description}</p>

            <div
              className={`category-content ${
                collapsedCategories[category] ? "collapsed" : ""
              }`}
              id={`cat-panel-${category}`}
            >
              {settings.map(
                ({ name, label, tooltip, defaultValue, valueType }) => (
                  <div
                    key={name}
                    className="setting-item"
                    title={tooltip}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.4rem 1rem",
                      borderBottom: "1px solid #ddd",
                      fontSize: "0.95rem",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: "1 1 60%" }}>
                      <strong>{label}</strong>
                      <p
                        style={{
                          margin: "0.15rem 0 0",
                          fontSize: "0.85rem",
                          color: "#666",
                        }}
                      >
                        {tooltip}
                      </p>
                    </div>
                    <div
                      style={{
                        flex: "0 0 35%",
                        textAlign: "right",
                        fontFamily: "monospace",
                        color: "#444",
                      }}
                    >
                      Default:{" "}
                      {typeof defaultValue === "boolean"
                        ? defaultValue
                          ? "True"
                          : "False"
                        : defaultValue}
                      <br />
                      <small style={{ fontSize: "0.75rem", color: "#888" }}>
                        {valueType}
                      </small>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
