"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import "./filebrowser.css";

interface Mod {
  id: string;
  name: string;
  description?: string;
  path: string;
  files?: FileNode[];
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
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

  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [search, setSearch] = useState("");
  const [modSearch, setModSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- FILTER MODS ----------------
  const filteredMods = useMemo(() => {
    return mods.filter((m) =>
      `${m.name} ${m.id}`.toLowerCase().includes(modSearch.toLowerCase())
    );
  }, [mods, modSearch]);

  // ---------------- LOAD WORKSHOP ----------------
  const loadMods = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${WORKSHOP_API}`);
      const data = res.data;

      const list = data?.mods || data || [];

      setMods(Array.isArray(list) ? list : []);
      setError("");
    } catch {
      setError("Failed to load Steam Workshop mods");
      setMods([]);
    } finally {
      setLoading(false);
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

      const language =
        ext === "lua"
          ? "lua"
          : ext === "json"
          ? "json"
          : ext === "ts"
          ? "typescript"
          : ext === "js"
          ? "javascript"
          : "plaintext";

      setTabs((prev) => [
        ...prev,
        { filePath: path, content, unsaved: false, language },
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

  // ---------------- SAVE ----------------
  const save = async () => {
    if (!active) return;

    const tab = tabs.find((t) => t.filePath === active);
    if (!tab) return;

    await axios.post(`${FILE_API}/file/save`, {
      path: tab.filePath,
      content: tab.content,
    });

    setTabs((prev) =>
      prev.map((t) =>
        t.filePath === active ? { ...t, unsaved: false } : t
      )
    );
  };

  // ---------------- EDIT ----------------
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

  // ---------------- KEYBINDS ----------------
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };

    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [active, tabs]);

  const current = tabs.find((t) => t.filePath === active);

  // ---------------- RENDER TREE ----------------
  const renderTree = (nodes?: FileNode[]) => {
    if (!nodes) return null;

    return nodes.map((n) => (
      <div key={n.path} className="fb-tree-item">
        {n.type === "folder" ? (
          <div className="fb-folder">
            📁 {n.name}
            <div className="fb-folder-children">
              {renderTree(n.children)}
            </div>
          </div>
        ) : (
          <div
            className="fb-file-item"
            onClick={() => openFile(n.path)}
          >
            📄 {n.name}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="fb-root">
      {/* LEFT SIDEBAR */}
      <div className="fb-sidebar">

        <div className="fb-sidebar-header">
          <input
            className="fb-search"
            placeholder="Search mods..."
            value={modSearch}
            onChange={(e) => setModSearch(e.target.value)}
          />

          <button className="fb-btn" onClick={loadMods}>
            {loading ? "loading..." : "refresh"}
          </button>
        </div>

        {error && <div className="fb-error">{error}</div>}

        <div className="fb-mod-list">
          {filteredMods.map((mod) => (
            <div
              key={mod.id}
              className={`fb-mod ${
                selectedMod?.id === mod.id ? "active" : ""
              }`}
              onClick={() => setSelectedMod(mod)}
            >
              <div className="fb-mod-title">{mod.name}</div>
              <div className="fb-mod-id">{mod.id}</div>

              <button className="fb-small-btn">
                open
              </button>

              <button className="fb-small-btn">
                subscribe
              </button>
            </div>
          ))}
        </div>

        {/* FILE TREE */}
        {selectedMod && (
          <div className="fb-tree">
            <div className="fb-tree-title">
              {selectedMod.name}
            </div>
            {renderTree(selectedMod.files)}
          </div>
        )}
      </div>

      {/* MAIN EDITOR */}
      <div className="fb-main">

        {/* TABS */}
        <div className="fb-tabs">
          {tabs.map((t) => (
            <div
              key={t.filePath}
              className={`fb-tab ${
                active === t.filePath ? "active" : ""
              }`}
              onClick={() => setActive(t.filePath)}
            >
              {t.filePath.split("/").pop()}
              {t.unsaved && " ●"}
            </div>
          ))}
        </div>

        {/* TOPBAR */}
        <div className="fb-topbar">
          <button className="fb-btn" onClick={save}>
            save
          </button>

          <div className="fb-path">
            {active || "no file selected"}
          </div>
        </div>

        {/* EDITOR */}
        <div className="fb-editor">
          {current ? (
            <Editor
              height="100%"
              theme="vs-dark"
              value={current.content}
              language={current.language}
              onChange={update}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                smoothScrolling: true,
                cursorBlinking: "smooth",
              }}
            />
          ) : (
            <div className="fb-placeholder">
              select a mod file from the tree
            </div>
          )}
        </div>
      </div>
    </div>
  );
}