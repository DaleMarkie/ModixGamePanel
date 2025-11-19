"use client";

import React, { useEffect, useState, useRef } from "react";
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
  files: FileItem[];
}
interface Tab {
  filePath: string;
  content: string;
  language: string;
  unsaved: boolean;
}
type ModalAction = "file" | "folder" | "color" | "move" | "delete";
interface ModalTarget {
  modId: string;
  path?: string;
}

interface WorkshopFileManagerProps {
  activeGameId: string; // ID of the active game selected from the Games page
}

const ActionModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (a: ModalAction) => void;
}> = ({ visible, onClose, onSelect }) => {
  if (!visible) return null;
  const actions: ModalAction[] = ["file", "folder", "color", "move", "delete"];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Choose an action</h3>
        {actions.map((a) => (
          <button key={a} onClick={() => onSelect(a)}>
            {a === "file"
              ? "＋ New File"
              : a === "folder"
              ? "＋ New Folder"
              : a === "color"
              ? "🎨 Set Color"
              : a === "move"
              ? "📦 Move / Rename"
              : "🗑️ Delete"}
          </button>
        ))}
        <button className="close-btn" onClick={onClose}>
          × Close
        </button>
      </div>
    </div>
  );
};

const getFileIcon = (name: string) =>
  name.endsWith(".lua")
    ? "🐍"
    : name.endsWith(".json")
    ? "🧩"
    : name.endsWith(".txt")
    ? "📄"
    : name.endsWith(".xml")
    ? "🗂️"
    : "📃";

export default function WorkshopFileManager({
  activeGameId,
}: WorkshopFileManagerProps) {
  const [mods, setMods] = useState<Mod[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [colors, setColors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);
  const editorRef = useRef<any>(null);

  // Load saved states
  useEffect(() => {
    setCollapsed(JSON.parse(localStorage.getItem("collapsedState") || "{}"));
    setFavorites(JSON.parse(localStorage.getItem("favoritesState") || "{}"));
    setColors(JSON.parse(localStorage.getItem("colorsState") || "{}"));
  }, []);
  useEffect(() => {
    localStorage.setItem("collapsedState", JSON.stringify(collapsed));
  }, [collapsed]);
  useEffect(() => {
    localStorage.setItem("favoritesState", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem("colorsState", JSON.stringify(colors));
  }, [colors]);

  // Fetch mods based on active game
  const fetchMods = async () => {
    if (!activeGameId) return;
    try {
      const res = await axios.get("/api/filemanager/workshop-mods", {
        params: { appId: activeGameId }, // use activeGameId
      });
      const fetched: Mod[] = res.data.mods || [];
      setMods(fetched);

      const init: Record<string, boolean> = { ...collapsed };
      const mark = (items: FileItem[]) =>
        items.forEach((i) => {
          if (i.type === "folder" && init[i.path] === undefined)
            init[i.path] = true;
          if (i.children) mark(i.children);
        });
      fetched.forEach((m) => mark(m.files));
      setCollapsed(init);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch mods.");
    }
  };

  // Refetch mods whenever the active game changes
  useEffect(() => {
    fetchMods();
  }, [activeGameId]);

  const toggle = (path: string) =>
    setCollapsed((p) => ({ ...p, [path]: !p[path] }));
  const toggleFav = (path: string) =>
    setFavorites((p) => ({ ...p, [path]: !p[path] }));
  const setColor = (path: string) => {
    const c = prompt("Enter color:");
    if (c) setColors((p) => ({ ...p, [path]: c }));
  };

  const openFile = async (path: string) => {
    if (tabs.find((t) => t.filePath === path)) return setActiveTab(path);
    try {
      const res = await axios.get("/api/filemanager/file", {
        params: { path },
      });
      const lang = path.endsWith(".lua")
        ? "lua"
        : path.endsWith(".json")
        ? "json"
        : "plaintext";
      setTabs((prev) => [
        ...prev,
        {
          filePath: path,
          content: res.data.content || "",
          language: lang,
          unsaved: false,
        },
      ]);
      setActiveTab(path);
    } catch (e) {
      console.error(e);
      alert("Failed to open file.");
    }
  };

  const saveTab = async (path: string | null) => {
    if (!path) return;
    const tab = tabs.find((t) => t.filePath === path);
    if (!tab) return;
    try {
      setSaving(true);
      await axios.post("/api/filemanager/file/save", {
        path,
        content: tab.content,
      });
      setTabs((prev) =>
        prev.map((t) => (t.filePath === path ? { ...t, unsaved: false } : t))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const createItem = async (
    modId: string,
    folderPath?: string,
    isFolder = false
  ) => {
    const name = prompt(
      `New ${isFolder ? "folder" : "file"} name${
        !isFolder ? " (with extension)" : ""
      }:`
    );
    if (!name) return;
    try {
      await axios.post(
        `/api/filemanager/${isFolder ? "folder/new" : "file/new"}`,
        isFolder
          ? { modId, folderName: name, folderPath }
          : { modId, name, folderPath }
      );
      fetchMods();
    } catch (e) {
      console.error(e);
      alert(`Failed to create ${isFolder ? "folder" : "file"}.`);
    }
  };

  const deleteItem = async (path: string) => {
    if (!confirm(`Delete ${path}?`)) return;
    try {
      await axios.post("/api/filemanager/file/delete", { path });
      setTabs((prev) => prev.filter((t) => !t.filePath.startsWith(path)));
      if (activeTab?.startsWith(path)) setActiveTab(null);
      fetchMods();
      alert("Deleted.");
    } catch (e) {
      console.error(e);
      alert("Failed to delete.");
    }
  };

  const moveItem = async (path: string) => {
    const newName = prompt("New name or path:");
    if (!newName) return;
    const base = path.split("/").slice(0, -1).join("/");
    const dest = newName.includes("/") ? newName : `${base}/${newName}`;
    try {
      await axios.post("/api/filemanager/file/move", {
        source: path,
        destination: dest,
      });
      setTabs((prev) =>
        prev.map((t) =>
          t.filePath === path
            ? { ...t, filePath: dest }
            : t.filePath.startsWith(path + "/")
            ? { ...t, filePath: t.filePath.replace(path, dest) }
            : t
        )
      );
      if (activeTab === path) setActiveTab(dest);
      fetchMods();
      alert("Moved/Renamed.");
    } catch (e) {
      console.error(e);
      alert("Failed to move.");
    }
  };

  const handleEditorMount: OnMount = (e) => (editorRef.current = e);
  const handleTabChange: OnChange = (v) => {
    if (!activeTab) return;
    setTabs((prev) =>
      prev.map((t) =>
        t.filePath === activeTab ? { ...t, content: v || "", unsaved: true } : t
      )
    );
  };

  const filterTree = (items: FileItem[]): FileItem[] =>
    !search
      ? items
      : (items
          .map((i) => {
            if (i.type === "folder" && i.children) {
              const c = filterTree(i.children);
              if (
                c.length > 0 ||
                i.name.toLowerCase().includes(search.toLowerCase())
              )
                return { ...i, children: c };
            } else if (
              i.type === "file" &&
              i.name.toLowerCase().includes(search.toLowerCase())
            )
              return i;
            return null;
          })
          .filter(Boolean) as FileItem[]);

  const renderTree = (
    items: FileItem[],
    lvl = 0,
    modId?: string
  ): JSX.Element[] =>
    items.map((item) => {
      const pad = 16 + lvl * 16,
        col = colors[item.path] || "inherit",
        fav = favorites[item.path];
      if (item.type === "folder")
        return (
          <div key={item.path}>
            <div
              className="folder-item"
              style={{ paddingLeft: pad, color: col }}
              onClick={() => toggle(item.path)}
              onContextMenu={(e) => {
                e.preventDefault();
                setModalTarget({ modId: modId!, path: item.path });
                setModalVisible(true);
              }}
            >
              {collapsed[item.path] ? "▶" : "▼"} {item.name}{" "}
              <span
                className="fav-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFav(item.path);
                }}
              >
                {fav ? "★" : "☆"}
              </span>
            </div>
            {!collapsed[item.path] &&
              item.children &&
              renderTree(item.children, lvl + 1, modId)}
          </div>
        );
      else {
        const tab = tabs.find((t) => t.filePath === item.path);
        return (
          <div
            key={item.path}
            className={`file-item ${tab?.unsaved ? "unsaved" : ""}`}
            style={{ paddingLeft: pad, color: col }}
            onClick={() => openFile(item.path)}
            onContextMenu={(e) => {
              e.preventDefault();
              setModalTarget({ modId: modId!, path: item.path });
              setModalVisible(true);
            }}
          >
            <span className="file-icon">{getFileIcon(item.name)}</span>{" "}
            {item.name} {tab?.unsaved ? "*" : ""}{" "}
            <span
              className="fav-toggle"
              onClick={(e) => {
                e.stopPropagation();
                toggleFav(item.path);
              }}
            >
              {fav ? "★" : "☆"}
            </span>
          </div>
        );
      }
    });

  const favoriteItems: FileItem[] = [];
  mods.forEach((mod) => {
    const collect = (items: FileItem[]) => {
      items.forEach((i) => {
        if (favorites[i.path]) favoriteItems.push(i);
        if (i.children) collect(i.children);
      });
    };
    collect(mod.files);
  });

  const handleModalSelect = (action: ModalAction) => {
    if (!modalTarget) return;
    const { modId, path } = modalTarget;
    switch (action) {
      case "file":
        createItem(modId, path);
        break;
      case "folder":
        createItem(modId, path, true);
        break;
      case "color":
        setColor(path!);
        break;
      case "move":
        moveItem(path!);
        break;
      case "delete":
        deleteItem(path!);
        break;
    }
    setModalVisible(false);
    setModalTarget(null);
  };

  const expandCollapseAll = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    const recurse = (items: FileItem[]) =>
      items.forEach((i) => {
        if (i.type === "folder") {
          newState[i.path] = !expand;
          i.children && recurse(i.children);
        }
      });
    mods.forEach((m) => recurse(m.files));
    setCollapsed(newState);
  };

  return (
    <div className="container">
      <ActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleModalSelect}
      />
      <div className="left-panel">
        <h2>Mod Manager</h2>
        <input
          className="search-input"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="left-panel-buttons">
          <button onClick={fetchMods}>Refresh</button>
          <button onClick={() => expandCollapseAll(true)}>Expand All</button>
          <button onClick={() => expandCollapseAll(false)}>Collapse All</button>
          <button
            onClick={() => {
              const id = activeGameId;
              if (id) createItem(id, undefined, true);
            }}
          >
            ＋ New Folder
          </button>
        </div>
        {favoriteItems.length > 0 && (
          <div className="favorites-section">
            <h3>★ Favorites</h3>
            {renderTree(favoriteItems)}
          </div>
        )}
        <div className="mods-list">
          {mods
            .map((mod) => ({ ...mod, files: filterTree(mod.files) }))
            .filter((m) => m.files.length > 0)
            .map((mod) => (
              <div key={mod.modId} className="mod-block">
                <div className="mod-title">
                  <span>{mod.title}</span>
                  <div>
                    <button onClick={() => createItem(mod.modId)}>
                      ＋ New File
                    </button>
                    <button
                      onClick={() => {
                        createItem(mod.modId, undefined, true);
                      }}
                    >
                      ＋ Folder
                    </button>
                  </div>
                </div>
                {renderTree(mod.files, 0, mod.modId)}
              </div>
            ))}
        </div>
      </div>

      <div className="right-panel">
        <div className="editor-header">
          <h2>📝 Editor</h2>
        </div>
        {tabs.length > 0 ? (
          <>
            <div className="tab-bar">
              {tabs.map((tab) => (
                <div
                  key={tab.filePath}
                  className={`tab ${
                    tab.filePath === activeTab ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.filePath)}
                >
                  <span className="tab-name">
                    {tab.filePath.split("/").pop()}
                  </span>
                  {tab.unsaved && (
                    <span className="unsaved-dot" title="Unsaved changes" />
                  )}
                  <button
                    className="close-tab"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTabs((prev) =>
                        prev.filter((t) => t.filePath !== tab.filePath)
                      );
                      if (activeTab === tab.filePath) setActiveTab(null);
                    }}
                    title="Close tab"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="editor-container">
              <div className="editor-toolbar">
                <button
                  className={`save-btn ${saving ? "saving" : ""}`}
                  onClick={() => saveTab(activeTab)}
                  disabled={saving || !activeTab}
                >
                  💾 {saving ? "Saving..." : "Save File"}
                </button>
                <button className="refresh-btn" onClick={fetchMods}>
                  ↻ Reload Mods
                </button>
              </div>
              <Editor
                height="100%"
                language={
                  tabs.find((t) => t.filePath === activeTab)?.language ||
                  "plaintext"
                }
                value={
                  tabs.find((t) => t.filePath === activeTab)?.content || ""
                }
                onChange={handleTabChange}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  automaticLayout: true,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  fontSize: 15,
                  fontFamily: "JetBrains Mono, monospace",
                  smoothScrolling: true,
                }}
              />
            </div>
          </>
        ) : (
          <div className="empty-editor">
            <h3>No file selected</h3>
            <p>Select a file from the left to start editing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
