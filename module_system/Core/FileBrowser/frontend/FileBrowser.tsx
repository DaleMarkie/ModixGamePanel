"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import "./filebrowser.css";

interface Mod {
  id: string;
  name: string;
  description?: string;
  path: string;
}

interface Tab {
  filePath: string;
  content: string;
  unsaved: boolean;
  language: string;
}

const FILE_API = "http://localhost:2010/api/filemanager";
const WORKSHOP_API = "http://localhost:2010/api/workshop";

export default function FileBrowser() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  // ---------------- LOAD MODS ----------------
  const loadMods = async () => {
    try {
      const res = await axios.get(`${WORKSHOP_API}`);

      const data = res.data;

      if (!data) {
        setMods([]);
        setError("No workshop response");
        return;
      }

      // supports multiple backend shapes safely
      setMods(data.mods || data || []);
      setError("");
    } catch (err) {
      setError("Failed to load workshop mods");
      setMods([]);
    }
  };

  useEffect(() => {
    loadMods();
  }, []);

  // ---------------- OPEN FILE ----------------
  const openFile = async (path: string) => {
    const exists = tabs.find((t) => t.filePath === path);

    if (exists) {
      setActive(path);
      return;
    }

    try {
      const res = await axios.get(`${FILE_API}/file`, {
        params: { path },
      });

      const content = res.data?.content ?? "// file not found";

      const ext = path.split(".").pop();

      setTabs((prev) => [
        ...prev,
        {
          filePath: path,
          content,
          unsaved: false,
          language:
            ext === "lua"
              ? "lua"
              : ext === "json"
              ? "json"
              : ext === "ts"
              ? "typescript"
              : ext === "js"
              ? "javascript"
              : "plaintext",
        },
      ]);

      setActive(path);
    } catch {
      setTabs((prev) => [
        ...prev,
        {
          filePath: path,
          content: "// failed to load file",
          unsaved: false,
          language: "plaintext",
        },
      ]);

      setActive(path);
    }
  };

  // ---------------- SAVE FILE ----------------
  const save = async () => {
    if (!active) return;

    const tab = tabs.find((t) => t.filePath === active);
    if (!tab) return;

    try {
      await axios.post(`${FILE_API}/file/save`, {
        path: tab.filePath,
        content: tab.content,
      });

      setTabs((prev) =>
        prev.map((t) => (t.filePath === active ? { ...t, unsaved: false } : t))
      );
    } catch (err) {
      console.log("Save failed");
    }
  };

  // ---------------- EDIT CONTENT ----------------
  const update = (value?: string) => {
    if (!active) return;

    setTabs((prev) =>
      prev.map((t) =>
        t.filePath === active
          ? { ...t, content: value || "", unsaved: true }
          : t
      )
    );
  };

  const current = tabs.find((t) => t.filePath === active);

  return (
    <div className="fb-root">
      {/* SIDEBAR */}
      <div className="fb-sidebar">
        <div className="fb-header">
          <button className="fb-btn" onClick={loadMods}>
            refresh
          </button>
        </div>

        {error && <div className="fb-error">{error}</div>}

        {mods.length === 0 && !error && (
          <div className="fb-empty">No mods found</div>
        )}

        {mods.map((mod) => (
          <div key={mod.id} className="fb-mod">
            <div className="fb-mod-title">{mod.name}</div>
            <div className="fb-mod-id">{mod.id}</div>

            <div
              className="fb-file"
              onClick={() => openFile(`${mod.path}/mod.info`)}
            >
              📄 mod.info
            </div>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="fb-main">
        <div className="fb-topbar">
          <button className="fb-btn" onClick={save}>
            save
          </button>

          <div className="fb-path">{active || "no file selected"}</div>
        </div>

        <div className="fb-editor">
          {current ? (
            <Editor
              height="100%"
              theme="vs-dark"
              value={current.content}
              language={current.language}
              onChange={update}
            />
          ) : (
            <div className="fb-placeholder">select a file to begin</div>
          )}
        </div>
      </div>
    </div>
  );
}
