"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Image,
  FileText,
  FileCode,
  FileAudio,
  Trash2,
  Edit2,
  Folder,
  Plus,
  AlertTriangle,
} from "lucide-react";
import "./ManageAssets.css";

const ManageAssets = () => {
  const [mods, setMods] = useState([]);
  const [selectedMod, setSelectedMod] = useState(null);
  const [assets, setAssets] = useState([]);
  const [savePath, setSavePath] = useState(
    localStorage.getItem("modSavePath") || ""
  );
  const [uploadFiles, setUploadFiles] = useState([]);

  // WIP popup state
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    fetchMods();
  }, [savePath]);

  const fetchMods = async () => {
    try {
      const res = await fetch("/api/projectzomboid/mods");
      const data = await res.json();
      setMods(data.mods);
    } catch (err) {
      console.error("Error fetching mods:", err);
    }
  };

  const selectMod = (mod) => {
    setSelectedMod(mod);
    fetchAssets(mod);
  };

  const fetchAssets = async (mod) => {
    try {
      const res = await fetch(
        `/api/projectzomboid/mods/${encodeURIComponent(mod.name)}/assets`
      );
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) {
      console.warn("No assets endpoint yet, using placeholder");
      setAssets([]);
    }
  };

  const deleteMod = async (modName) => {
    if (!confirm(`Delete mod "${modName}"?`)) return;
    try {
      await fetch(
        `/api/projectzomboid/mods/delete?modName=${encodeURIComponent(
          modName
        )}`,
        { method: "DELETE" }
      );
      fetchMods();
      setSelectedMod(null);
      setAssets([]);
    } catch (err) {
      console.error(err);
    }
  };

  const editMod = async () => {
    const newName = prompt("Enter new mod name:", selectedMod.name);
    if (!newName) return;
    const newDescription = prompt(
      "Enter new mod description:",
      selectedMod.description
    );
    try {
      await fetch("/api/projectzomboid/mods/update-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modName: selectedMod.name,
          newName,
          description: newDescription,
        }),
      });
      fetchMods();
      setSelectedMod(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getFileType = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    if (["png", "jpg", "jpeg"].includes(ext)) return "image";
    if (["txt", "json", "xml", "lua"].includes(ext)) return "text";
    if (["mp3", "ogg", "wav"].includes(ext)) return "audio";
    if (["js", "py", "cs"].includes(ext)) return "code";
    return "other";
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
    if (!selectedMod) return alert("Select a mod first!");

    for (let file of files) {
      const formData = new FormData();
      formData.append("modName", selectedMod.name);
      formData.append("file", file);
      try {
        await fetch("/api/projectzomboid/mods/upload", {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        console.error(err);
      }
    }

    fetchAssets(selectedMod);
  };

  const deleteAsset = async (assetName) => {
    if (!confirm(`Delete asset "${assetName}"?`)) return;
    try {
      await fetch(
        `/api/projectzomboid/mods/${encodeURIComponent(
          selectedMod.name
        )}/delete-asset?fileName=${encodeURIComponent(assetName)}`,
        { method: "DELETE" }
      );
      fetchAssets(selectedMod);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="manageassets-page">
      {/* Glowing Warning Popup */}
      {showWarning && (
        <div className="warning-popup">
          <div className="warning-card">
            <div className="warning-glow"></div>
            <div className="warning-icon">
              <AlertTriangle size={36} />
            </div>
            <h2>🚧 Work in Progress</h2>
            <p>
              This page isn’t fully developed yet, but we’re actively working on
              it!
            </p>
            <p>
              You can request features or give feedback on our{" "}
              <a
                href="https://discord.gg/EwWZUSR9tM"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord server
              </a>
              .
            </p>
            <button
              className="warning-btn"
              onClick={() => setShowWarning(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="manageassets-header">
        <h1>🎨 Mod Management</h1>
        <p>Manage mods, edit info, upload assets, and preview files.</p>
        <p>
          Current save path: <Folder size={14} /> {savePath || "Default folder"}
        </p>
      </div>

      <div className="mods-list">
        {mods.length ? (
          mods.map((mod) => (
            <div
              key={mod.name}
              className={`mod-card ${
                selectedMod?.name === mod.name ? "selected" : ""
              }`}
              onClick={() => selectMod(mod)}
            >
              <div className="mod-header">
                <h3>{mod.name}</h3>
                <div className="mod-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      editMod(mod);
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMod(mod.name);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p>{mod.description || "No description"}</p>
              {mod.poster && (
                <img
                  src={`${mod.path}/${mod.poster}`}
                  alt="Poster"
                  className="mod-poster"
                />
              )}
            </div>
          ))
        ) : (
          <p className="no-mods">No mods created yet.</p>
        )}
      </div>

      {selectedMod && (
        <div className="assets-section">
          <h2>Assets for "{selectedMod.name}"</h2>

          <label className="upload-btn">
            <Plus size={16} /> Upload Assets
            <input type="file" multiple onChange={handleUpload} />
          </label>

          <div className="asset-grid">
            {assets.length ? (
              assets.map((asset) => (
                <div key={asset.name} className="asset-card">
                  <div className="asset-preview">
                    {getFileType(asset.name) === "image" ? (
                      <img
                        src={
                          asset.url || `${selectedMod.path}/media/${asset.name}`
                        }
                        alt={asset.name}
                      />
                    ) : getFileType(asset.name) === "text" ? (
                      <FileText size={40} />
                    ) : getFileType(asset.name) === "code" ? (
                      <FileCode size={40} />
                    ) : getFileType(asset.name) === "audio" ? (
                      <FileAudio size={40} />
                    ) : (
                      <Image size={40} />
                    )}
                  </div>
                  <p className="asset-name">{asset.name}</p>
                  <button
                    className="delete-btn"
                    onClick={() => deleteAsset(asset.name)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="no-assets">No assets uploaded yet.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageAssets;
