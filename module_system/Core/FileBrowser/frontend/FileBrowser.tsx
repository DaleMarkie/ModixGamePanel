"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";

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
  unsaved: boolean;
  language: string;
}

const API = "/api/filemanager";

export default function FileBrowser() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [active, setActive] = useState<string | null>(null);

  // -------------------------
  // LOAD MODS
  // -------------------------
  const loadMods = async () => {
    const res = await axios.get(`${API}/workshop-mods`);
    setMods(res.data?.mods || []);
  };

  useEffect(() => {
    loadMods();
  }, []);

  // -------------------------
  // OPEN FILE
  // -------------------------
  const openFile = async (path: string) => {
    const exists = tabs.find((t) => t.filePath === path);

    if (exists) {
      setActive(path);
      return;
    }

    const res = await axios.get(`${API}/file`, {
      params: { path },
    });

    const content = res.data?.content || "";

    setTabs((prev) => [
      ...prev,
      {
        filePath: path,
        content,
        unsaved: false,
        language: path.endsWith(".lua")
          ? "lua"
          : path.endsWith(".json")
          ? "json"
          : "plaintext",
      },
    ]);

    setActive(path);
  };

  // -------------------------
  // SAVE FILE
  // -------------------------
  const save = async () => {
    if (!active) return;

    const tab = tabs.find((t) => t.filePath === active);
    if (!tab) return;

    await axios.post(`${API}/file/save`, {
      path: tab.filePath,
      content: tab.content,
    });

    setTabs((prev) =>
      prev.map((t) => (t.filePath === active ? { ...t, unsaved: false } : t))
    );
  };

  // -------------------------
  // UPDATE CONTENT
  // -------------------------
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
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT */}
      <div style={{ width: "300px", overflow: "auto" }}>
        <button onClick={loadMods}>Refresh</button>

        {mods.map((mod) => (
          <div key={mod.modId}>
            <h3>{mod.title}</h3>
            {mod.files.map((file) => (
              <div
                key={file.path}
                onClick={() => file.type === "file" && openFile(file.path)}
              >
                {file.type === "folder" ? "📁" : "📄"} {file.name}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1 }}>
        <button onClick={save}>Save</button>

        {current ? (
          <Editor
            height="100vh"
            theme="vs-dark"
            value={current.content}
            onChange={update}
          />
        ) : (
          <div>No file selected</div>
        )}
      </div>
    </div>
  );
}
