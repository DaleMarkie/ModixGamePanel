"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./filebrowser.css";

interface FileItem {
  type: "file" | "folder";
  name: string;
  path: string;
  children?: FileItem[];
}

interface Mod {
  modId: string;
  title: string;
  version?: string;
  files: FileItem[];
}

export default function WorkshopFileManager() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchMods = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/projectzomboid/workshop-mods");

      if (!res.data.mods || res.data.mods.length === 0) {
        if (res.data.message?.includes("Workshop folder not found")) {
          setError(
            `GAME_002: Cannot load Project Zomboid Steam Workshop mods — Steam does not appear to be installed on this PC.\n` +
              "➡ To fix: Install Steam, log in, and subscribe to Project Zomboid mods via the Steam Workshop.\n" +
              "The Workshop mods folder should exist at: C:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\108600"
          );
        } else {
          setError(
            `GAME_002: No mods found — Steam installed but no mods downloaded.\n` +
              "➡ To fix: Subscribe to mods in the Project Zomboid Steam Workshop and refresh this page."
          );
        }
        setMods([]);
      } else {
        setMods(res.data.mods);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data) {
        const { code, message, detail } = err.response.data;
        setError(
          `${code || "NET_001"}: ${
            message || detail || "Unknown error"
          }\n➡ Ensure the backend API is running.`
        );
      } else {
        setError(
          "NET_001: Could not reach backend API\n➡ Ensure the backend server is running."
        );
      }
      setMods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMods();
  }, []);

  const fetchFileContent = async (filePath: string) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/projectzomboid/workshop-mods/file", {
        params: { path: filePath },
      });
      setSelectedFile(filePath);
      setFileContent(res.data.content || "");
    } catch (err) {
      console.error(err);
      setError(`Failed to load file: ${filePath}`);
    } finally {
      setLoading(false);
    }
  };

  const saveFileContent = async () => {
    if (!selectedFile) return;
    try {
      setSaving(true);
      setError("");
      await axios.post("/api/projectzomboid/workshop-mods/file/save", {
        path: selectedFile,
        content: fileContent,
      });
      alert("File saved successfully!");
    } catch (err) {
      console.error(err);
      setError(`Failed to save file: ${selectedFile}`);
    } finally {
      setSaving(false);
    }
  };

  const renderTree = (items: FileItem[]): JSX.Element[] =>
    items.map((item) => {
      if (item.type === "folder") {
        return (
          <div key={item.path} className="folder-item">
            <span className="folder-name">📁 {item.name}</span>
            {item.children && renderTree(item.children)}
          </div>
        );
      } else {
        return (
          <div
            key={item.path}
            className="file-item"
            onClick={() => fetchFileContent(item.path)}
          >
            <span className="file-name">📄 {item.name}</span>
          </div>
        );
      }
    });

  return (
    <div className="container">
      <div className="left-panel">
        <h2>Workshop Mods</h2>
        {loading && <p>Loading...</p>}
        {error && <pre className="error-message">{error}</pre>}
        {!loading && !error && mods.length === 0 && <p>No mods found.</p>}
        {mods.map((mod) => (
          <div key={mod.modId} className="mod-block">
            <div className="folder-name">
              {mod.title} {mod.version && `v${mod.version}`}
            </div>
            {renderTree(mod.files)}
          </div>
        ))}
      </div>

      <div className="right-panel">
        <h2>File Editor</h2>
        {selectedFile ? (
          <>
            <div className="file-path">{selectedFile}</div>
            <textarea
              className="file-editor-textarea"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
            />
            <button
              className="save-button"
              onClick={saveFileContent}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save File"}
            </button>
          </>
        ) : (
          <p>Select a file to view/edit its content</p>
        )}
      </div>
    </div>
  );
}
