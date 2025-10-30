"use client";

import React, { useState } from "react";
import {
  Rocket,
  ImagePlus,
  Settings,
  FileText,
  FileCode,
  FileAudio,
  FolderPlus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import "./CreateNewMod.css";

interface Script {
  id: number;
  name: string;
  content: string;
}

interface Asset {
  id: number;
  name: string;
  type: "image" | "audio" | "text";
  file: File | null;
}

const CreateNewMod = () => {
  const [modName, setModName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedScript, setSelectedScript] = useState<number | null>(null);

  // Warning popup state
  const [showWarning, setShowWarning] = useState(true);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewImage(file);
  };

  const addScript = () => {
    const newScript: Script = { id: Date.now(), name: "", content: "" };
    setScripts([...scripts, newScript]);
    setSelectedScript(newScript.id);
  };

  const updateScript = (id: number, key: keyof Script, value: string) => {
    setScripts(scripts.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const removeScript = (id: number) => {
    setScripts(scripts.filter((s) => s.id !== id));
    if (selectedScript === id) setSelectedScript(null);
  };

  const addAsset = (type: "image" | "audio" | "text") => {
    const newAsset: Asset = { id: Date.now(), name: "", type, file: null };
    setAssets([...assets, newAsset]);
  };

  const updateAsset = (
    id: number,
    key: keyof Asset,
    value: string | File | null
  ) => {
    setAssets(
      assets.map((a) =>
        a.id === id ? { ...a, [key]: value as string | File | null } : a
      )
    );
  };

  const removeAsset = (id: number) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  const handleCreateMod = () => {
    if (!modName) return alert("⚠️ Please enter a mod name!");

    const modData = {
      modName,
      description,
      tags,
      visibility,
      previewImage,
      scripts,
      assets,
    };

    console.log("Prepared Mod Data:", modData);
    alert("🎉 Mod prepared! Ready for Workshop or download.");
  };

  return (
    <main className="createmod-page">
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

      {/* Left: File Tree */}
      <div className="filetree-panel">
        <h2>📂 Project Files</h2>

        <div className="preview-section">
          <label>Preview Image</label>
          <div className="createmod-upload">
            {previewImage ? (
              <img
                src={URL.createObjectURL(previewImage)}
                alt="Preview"
                className="preview-img"
              />
            ) : (
              <div className="upload-placeholder">
                <ImagePlus size={40} />
                <p>Click to select preview image</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>

        <div className="filetree-scripts">
          <h3>📝 Scripts</h3>
          {scripts.map((s) => (
            <div
              key={s.id}
              className={`file-item ${
                selectedScript === s.id ? "selected" : ""
              }`}
              onClick={() => setSelectedScript(s.id)}
            >
              <FileCode size={16} /> {s.name || "New Script.lua"}
              <Trash2
                size={14}
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeScript(s.id);
                }}
              />
            </div>
          ))}
          <button type="button" onClick={addScript}>
            <FolderPlus size={16} /> Add Script
          </button>
        </div>

        <div className="filetree-assets">
          <h3>📁 Assets</h3>
          {assets.map((a) => (
            <div key={a.id} className="file-item">
              {a.type === "image" ? (
                <FileText size={16} />
              ) : a.type === "audio" ? (
                <FileAudio size={16} />
              ) : (
                <FileCode size={16} />
              )}{" "}
              {a.name || "New Asset"}
              <Trash2
                size={14}
                className="delete-icon"
                onClick={() => removeAsset(a.id)}
              />
            </div>
          ))}
          <button type="button" onClick={() => addAsset("image")}>
            <FolderPlus size={16} /> Add Asset
          </button>
        </div>
      </div>

      {/* Right: Editor */}
      <div className="editor-panel">
        <div className="createmod-card">
          <div className="createmod-header">
            <h1>🆕 {modName || "New Mod"}</h1>
            <p>Configure your mod for Steam Workshop upload.</p>
          </div>

          <form className="createmod-form" onSubmit={(e) => e.preventDefault()}>
            <label>Mod Name</label>
            <input
              type="text"
              placeholder="Enter mod title"
              value={modName}
              onChange={(e) => setModName(e.target.value)}
              required
            />

            <label>Description</label>
            <textarea
              placeholder="Describe your mod..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            <label>Tags (comma separated)</label>
            <input
              type="text"
              placeholder="zombies, survival, UI"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            <label>Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>

            {selectedScript && (
              <div className="script-editor">
                <h3>
                  Editing: {scripts.find((s) => s.id === selectedScript)?.name}
                </h3>
                <input
                  type="text"
                  placeholder="Script Name.lua"
                  value={scripts.find((s) => s.id === selectedScript)?.name}
                  onChange={(e) =>
                    updateScript(selectedScript, "name", e.target.value)
                  }
                />
                <CodeMirror
                  value={scripts.find((s) => s.id === selectedScript)?.content}
                  height="400px"
                  onChange={(value) =>
                    updateScript(selectedScript, "content", value)
                  }
                />
              </div>
            )}

            <button
              type="button"
              className="create-btn"
              onClick={handleCreateMod}
            >
              <Rocket size={18} /> Prepare Mod
            </button>
          </form>
        </div>

        {/* Tips Panel */}
        <div className="createmod-sideinfo">
          <div className="info-box">
            <Settings size={24} />
            <h3>Workshop Tips</h3>
            <ul>
              <li>✔ Unique mod name</li>
              <li>🖼️ 512x512 preview recommended</li>
              <li>🏷️ Relevant tags for discovery</li>
              <li>📝 Include scripts & assets properly</li>
              <li>☁️ Ready to publish to Steam Workshop</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateNewMod;
