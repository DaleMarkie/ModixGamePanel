"use client";

import React, { useEffect, useState } from "react";
import { FaClock, FaFolderOpen, FaDownload } from "react-icons/fa";
import "./ModUpdater.css";

const ModUpdater = () => {
  const [updatedMods, setUpdatedMods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdatedMods = async () => {
      try {
        const response = await fetch("http://localhost:8000/mods/updated"); // Replace with your API host if needed
        const data = await response.json();
        setUpdatedMods(data);
      } catch (err) {
        console.error("Failed to fetch updated mods:", err);
        setUpdatedMods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdatedMods();
  }, []);

  const backupAndUpdateMod = (mod) => {
    alert(`Backing up and updating mod:\n${mod.name} (ID: ${mod.id})`);
  };

  return (
    <section className="mod-updater">
      <header className="mod-updater-header">
        <h2>Mod Updater</h2>
        <p>
          You can review these updates and choose to back up and update each mod
          to keep your game running smoothly and with the latest features.
        </p>
      </header>

      {loading ? (
        <div className="loading">Checking for mod updates...</div>
      ) : updatedMods.length === 0 ? (
        <div className="no-updates">
          <p>
            <strong>No mods to update!</strong>
          </p>
          <p>
            Your Project Zomboid workshop folder doesn’t have any recently
            updated mods. Once new updates are detected, they will appear here
            for backup and update actions.
          </p>
        </div>
      ) : (
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
                  <div className="mod-actions">
                    <button
                      className="mod-open"
                      onClick={() => window.open("file://" + mod.path)}
                      title="Open mod folder"
                      aria-label={`Open folder for ${mod.name}`}
                    >
                      <FaFolderOpen />
                    </button>
                    <button
                      className="mod-backup-update"
                      onClick={() => backupAndUpdateMod(mod)}
                      title="Backup and update this mod"
                      aria-label={`Backup and update ${mod.name}`}
                    >
                      <FaDownload />
                      <span style={{ marginLeft: "0.3rem" }}>Update Mod</span>
                    </button>
                  </div>
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
      )}
    </section>
  );
};

export default ModUpdater;
