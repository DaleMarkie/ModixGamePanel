"use client";

import React from "react";
import { FaClock, FaFolderOpen } from "react-icons/fa";
import "./ModUpdater.css";

const updatedMods = [
  {
    id: "2346789012",
    name: "Better Sorting",
    lastUpdated: "June 23, 2025 14:12",
    path: "C:/Steam/steamapps/workshop/content/108600/2346789012",
  },
  {
    id: "1987654321",
    name: "True Actions: Sit, Sleep, and Lay Down",
    lastUpdated: "June 24, 2025 10:05",
    path: "C:/Steam/steamapps/workshop/content/108600/1987654321",
  },
  {
    id: "2098765432",
    name: "Hydrocraft",
    lastUpdated: "June 22, 2025 19:47",
    path: "C:/Steam/steamapps/workshop/content/108600/2098765432",
  },
];

const ModUpdater = () => {
  return (
    <section className="mod-updater">
      <header className="mod-updater-header">
        <h2>Mod Updater</h2>
        <p>
          Recently updated mods detected in your Project Zomboid workshop
          folder.
        </p>
      </header>

      <div className="mod-cards">
        {updatedMods.map((mod, idx) => {
          let posClass = "";
          if (idx === 0) posClass = "left-card";
          else if (idx === 1) posClass = "middle-card";
          else if (idx === 2) posClass = "right-card";

          return (
            <article className={`mod-card ${posClass}`} key={mod.id}>
              <div className="mod-header">
                <h3 className="mod-name">{mod.name}</h3>
                <button
                  className="mod-open"
                  onClick={() => window.open("file://" + mod.path)}
                  title="Open mod folder"
                  aria-label={`Open folder for ${mod.name}`}
                >
                  <FaFolderOpen />
                </button>
              </div>

              <div className="mod-info">
                <div className="mod-meta">
                  <span className="mod-id">ID: {mod.id}</span>
                  <span className="mod-updated">
                    <FaClock className="icon" />
                    {mod.lastUpdated}
                  </span>
                </div>
                <div className="mod-path" title={mod.path}>
                  {mod.path}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ModUpdater;
