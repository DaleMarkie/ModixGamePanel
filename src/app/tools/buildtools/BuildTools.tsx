"use client";

import React, { useState } from "react";

const dummyMods = [
  {
    id: "mod1",
    name: "Awesome Mod",
    description: "Adds amazing new features to the game.",
    workshopId: "123456789",
    githubRepo: "user/awesome-mod",
    cdnEnabled: true,
  },
  {
    id: "mod2",
    name: "Fun Times Mod",
    description: "Makes gameplay more fun and chaotic.",
    workshopId: "987654321",
    cdnEnabled: false,
  },
  {
    id: "mod3",
    name: "Visual Upgrade",
    description: "Improves graphics and textures drastically.",
    cdnEnabled: true,
  },
];

const styles = {
  buildToolsPage: {
    backgroundColor: "#121212",
    color: "#e0e0e0",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "900px",
    margin: "2rem auto",
    padding: "1.5rem 2rem",
    borderRadius: "12px",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.7)",
    minHeight: "100vh",
  },
  title: {
    fontSize: "2.4rem",
    fontWeight: "800",
    marginBottom: "1.5rem",
    letterSpacing: "1.2px",
  },
  modSection: {
    backgroundColor: "#1f1f1f",
    padding: "1.5rem",
    borderRadius: "10px",
    marginBottom: "2rem",
    boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
  },
  modTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#f0f0f0",
    marginBottom: "0.6rem",
  },
  modDescription: {
    color: "#bdbdbd",
    marginBottom: "1rem",
    lineHeight: 1.4,
  },
  modDetails: {
    color: "#c7c7c7",
    marginBottom: "1rem",
    paddingLeft: "1.2rem",
    listStyleType: "disc",
  },
  buildButton: {
    backgroundColor: "#2962ff",
    color: "white",
    padding: "0.5rem 1.4rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    userSelect: "none",
  },
  buildButtonHover: {
    backgroundColor: "#0039cb",
  },
  buildStatus: {
    marginTop: "0.5rem",
    fontSize: "0.9rem",
    color: "#aaa",
    fontStyle: "italic",
  },
};

const BuildTools = () => {
  const [mods] = useState(dummyMods);
  const [buildStatus, setBuildStatus] = useState({});

  const triggerBuild = async (modId) => {
    setBuildStatus((s) => ({ ...s, [modId]: "Building..." }));
    await new Promise((r) => setTimeout(r, 2000));
    setBuildStatus((s) => ({ ...s, [modId]: "Build successful" }));
  };

  return (
    <div style={styles.buildToolsPage}>
      <h1 style={styles.title}>📤 Build & Distribution Tools</h1>

      {mods.length === 0 && <p>No mods available.</p>}

      {mods.map((mod) => (
        <section key={mod.id} style={styles.modSection}>
          <h2 style={styles.modTitle}>{mod.name}</h2>
          <p style={styles.modDescription}>{mod.description}</p>

          <ul style={styles.modDetails}>
            {mod.workshopId && (
              <li>
                <strong>Steam Workshop:</strong> {mod.workshopId}
              </li>
            )}
            {mod.githubRepo && (
              <li>
                <strong>GitHub Repo:</strong> {mod.githubRepo}
              </li>
            )}
            <li>
              <strong>CDN Enabled:</strong> {mod.cdnEnabled ? "Yes" : "No"}
            </li>
          </ul>

          <button
            style={styles.buildButton}
            onClick={() => triggerBuild(mod.id)}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#0039cb")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#2962ff")
            }
          >
            Build & Deploy
          </button>

          {buildStatus[mod.id] && (
            <p style={styles.buildStatus}>{buildStatus[mod.id]}</p>
          )}
        </section>
      ))}
    </div>
  );
};

export default BuildTools;
