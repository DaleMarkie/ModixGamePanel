"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";
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

interface Tab {
  filePath: string;
  content: string;
  language: string;
  unsaved: boolean;
}

export default function WorkshopFileManager() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [osMode, setOsMode] = useState<"windows" | "linux">("windows");

  const editorRef = useRef<any>(null);

  // Fetch Workshop mods
  const fetchMods = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/projectzomboid/workshop-mods", {
        params: { os: osMode },
      });

      if (!res.data.mods || res.data.mods.length === 0) {
        setError("No mods found. Subscribe in Steam Workshop.");
        setMods([]);
      } else {
        setMods(res.data.mods);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch mods.");
      setMods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMods();
  }, [osMode]);

  // Open file in tab
  const openFile = async (filePath: string) => {
    const existing = tabs.find((t) => t.filePath === filePath);
    if (existing) {
      setActiveTab(filePath);
      return;
    }

    try {
      const res = await axios.get("/api/projectzomboid/workshop-mods/file", {
        params: { path: filePath },
      });

      const language = filePath.endsWith(".lua")
        ? "lua"
        : filePath.endsWith(".json")
        ? "json"
        : "plaintext";

      const newTab: Tab = {
        filePath,
        content: res.data.content || "",
        language,
        unsaved: false,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTab(filePath);
    } catch (err) {
      console.error(err);
      setError(`Failed to open file: ${filePath}`);
    }
  };

  // Save tab
  const saveTab = async (filePath: string) => {
    const tab = tabs.find((t) => t.filePath === filePath);
    if (!tab) return;

    try {
      setSaving(true);
      await axios.post("/api/projectzomboid/workshop-mods/file/save", {
        path: filePath,
        content: tab.content,
      });

      setTabs((prev) =>
        prev.map((t) =>
          t.filePath === filePath ? { ...t, unsaved: false } : t
        )
      );
    } catch (err) {
      console.error(err);
      setError(`Failed to save file: ${filePath}`);
    } finally {
      setSaving(false);
    }
  };

  // Close tab
  const closeTab = (filePath: string) => {
    const tab = tabs.find((t) => t.filePath === filePath);
    if (!tab) return;

    if (tab.unsaved && !confirm("You have unsaved changes. Close anyway?")) return;

    setTabs((prev) => prev.filter((t) => t.filePath !== filePath));
    if (activeTab === filePath) setActiveTab(tabs[0]?.filePath || null);
  };

  // Editor mount
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Editor change
  const handleTabChange: OnChange = (value) => {
    if (!activeTab) return;
    setTabs((prev) =>
      prev.map((t) =>
        t.filePath === activeTab
          ? { ...t, content: value || "", unsaved: true }
          : t
      )
    );
  };

  // Autosave every 5s
  useEffect(() => {
    if (!activeTab) return;
    const timer = setTimeout(() => {
      saveTab(activeTab);
    }, 5000);
    return () => clearTimeout(timer);
  }, [tabs, activeTab]);

  // Toggle folder collapse
  const toggleFolder = (path: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // File icons
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".lua")) return "📜";
    if (fileName.endsWith(".json")) return "🗄️";
    if (fileName.endsWith(".txt")) return "📄";
    return "📄";
  };

  // Render file tree
  const renderTree = (items: FileItem[]): JSX.Element[] =>
    items
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((item) => {
        if (item.type === "folder") {
          const isCollapsed = collapsedFolders[item.path];
          return (
            <div key={item.path} className="folder-item">
              <span
                className="folder-name"
                onClick={() => toggleFolder(item.path)}
              >
                {isCollapsed ? "▶" : "▼"} {item.name}
              </span>
              {!isCollapsed && item.children && renderTree(item.children)}
            </div>
          );
        } else {
          const tab = tabs.find((t) => t.filePath === item.path);
          const unsaved = tab?.unsaved;
          return (
            <div
              key={item.path}
              className={`file-item ${unsaved ? "unsaved" : ""}`}
              onClick={() => openFile(item.path)}
            >
              <span className="file-name">
                {getFileIcon(item.name)} {item.name} {unsaved && "*"}
              </span>
            </div>
          );
        }
      });

  // Undo/Redo
  const handleUndo = () => editorRef.current?.trigger("keyboard", "undo", null);
  const handleRedo = () => editorRef.current?.trigger("keyboard", "redo", null);

  // Collapse/Expand All
  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    mods.forEach((mod) => {
      const stack: FileItem[] = [...mod.files];
      while (stack.length) {
        const item = stack.pop()!;
        if (item.type === "folder") {
          all[item.path] = true;
          if (item.children) stack.push(...item.children);
        }
      }
    });
    setCollapsedFolders(all);
  };

  const expandAll = () => setCollapsedFolders({});

  return (
    <div className="container">
      <div className="left-panel">
        <h2>Workshop Mods</h2>

        <div className="os-switcher">
          <span>OS Mode:</span>
          <button
            className={osMode === "windows" ? "active" : ""}
            onClick={() => setOsMode("windows")}
          >
            Windows
          </button>
          <button
            className={osMode === "linux" ? "active" : ""}
            onClick={() => setOsMode("linux")}
          >
            Linux
          </button>
        </div>

        <input
          type="text"
          placeholder="Search mods/files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <div className="tree-buttons">
          <button onClick={collapseAll}>Collapse All</button>
          <button onClick={expandAll}>Expand All</button>
        </div>

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
        {tabs.length > 0 && (
          <div className="tab-bar">
            {tabs.map((tab) => (
              <div
                key={tab.filePath}
                className={`tab ${tab.filePath === activeTab ? "active" : ""}`}
                onClick={() => setActiveTab(tab.filePath)}
              >
                {tab.filePath.split("/").pop()}
                {tab.unsaved && "*"}
                <button
                  className="close-tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.filePath);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab ? (
          <>
            <div className="file-editor-toolbar">
              <div className="editor-buttons">
                <button onClick={handleUndo}>Undo</button>
                <button onClick={handleRedo}>Redo</button>
                <button
                  onClick={() => saveTab(activeTab)}
                  disabled={saving}
                  className="save-button"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <Editor
              height="70vh"
              language={tabs.find((t) => t.filePath === activeTab)?.language || "plaintext"}
              value={tabs.find((t) => t.filePath === activeTab)?.content || ""}
              onChange={handleTabChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: "on",
              }}
            />
          </>
        ) : (
          <p>Select a file to view/edit its content</p>
        )}
      </div>
    </div>
  );
}
