"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaFolder,
  FaFolderOpen,
  FaFileAlt,
  FaSearch,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaChevronDown,
  FaChevronRight,
  FaPlus,
  FaUpload,
  FaTrash,
  FaFolderPlus,
  FaChevronLeft,
  FaChevronRight as FaChevronRightIcon,
  FaTimes,
} from "react-icons/fa";
import "./filebrowser.css";

function FileNode({ node, level = 0, onFileSelect, selectedFile }) {
  const [open, setOpen] = useState(false);

  const isSelected = selectedFile?.path === node.path;

  const toggleOpen = () => {
    if (node.type === "folder") setOpen(!open);
    else onFileSelect(node);
  };

  return (
    <>
      <div
        className={`tree-node ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: 12 + level * 16 }}
        onClick={toggleOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") toggleOpen();
        }}
        role="treeitem"
        aria-expanded={node.type === "folder" ? open : undefined}
        aria-selected={isSelected}
      >
        {node.type === "folder" ? (
          open ? (
            <FaChevronDown className="icon" />
          ) : (
            <FaChevronRight className="icon" />
          )
        ) : (
          <span className="icon-placeholder" />
        )}
        {node.type === "folder" ? (
          open ? (
            <FaFolderOpen className="icon folder-icon" />
          ) : (
            <FaFolder className="icon folder-icon" />
          )
        ) : (
          <FaFileAlt className="icon file-icon" />
        )}
        <span className="node-name">{node.name}</span>
      </div>
      {open &&
        node.children &&
        node.children.map((child) => (
          <FileNode
            key={child.path}
            node={child}
            level={level + 1}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}
    </>
  );
}

// Helper function to escape RegExp special chars
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function FileBrowser() {
  const exampleTree = [
    {
      name: "server",
      type: "folder",
      path: "/server",
      children: [
        { name: "server.ini", type: "file", path: "/server/server.ini" },
        {
          name: "mods",
          type: "folder",
          path: "/server/mods",
          children: [
            { name: "mod1.txt", type: "file", path: "/server/mods/mod1.txt" },
            { name: "mod2.txt", type: "file", path: "/server/mods/mod2.txt" },
          ],
        },
      ],
    },
    { name: "config.lua", type: "file", path: "/config.lua" },
    { name: "readme.md", type: "file", path: "/readme.md" },
  ];

  const [treeData, setTreeData] = useState(exampleTree);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Editor search state
  const [editorSearchTerm, setEditorSearchTerm] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matchIndices, setMatchIndices] = useState([]);

  const textareaRef = useRef(null);
  const overlayRef = useRef(null);

  const fetchFileContent = useCallback(async (path) => {
    setLoadingFile(true);
    // Simulated file content for demo purposes
    const fileSamples = {
      "/server/server.ini":
        "; server.ini config file\n[Server]\nPublicName=My Server\nMaxPlayers=10\n",
      "/server/mods/mod1.txt":
        "Mod 1 description and data...\nLine 2 of mod1\nAnother line.",
      "/server/mods/mod2.txt": "Mod 2 description and data...\nMore info here.",
      "/config.lua":
        "-- Lua config file example\nreturn {\n  setting = true\n}\n",
      "/readme.md":
        "# Readme\nWelcome to your Project Zomboid server!\nEnjoy editing your files!",
    };
    await new Promise((r) => setTimeout(r, 250)); // simulate delay
    setFileContent(fileSamples[path] || "// No content for this file.");
    setLoadingFile(false);
    setEditorSearchTerm("");
    setCurrentMatchIndex(0);
    setMatchIndices([]);
  }, []);

  useEffect(() => {
    if (selectedFile?.type === "file") {
      fetchFileContent(selectedFile.path);
    } else {
      setFileContent("");
      setEditorSearchTerm("");
      setCurrentMatchIndex(0);
      setMatchIndices([]);
    }
  }, [selectedFile, fetchFileContent]);

  // Compute match indices for the editor search
  useEffect(() => {
    if (!editorSearchTerm) {
      setMatchIndices([]);
      setCurrentMatchIndex(0);
      return;
    }
    const regex = new RegExp(escapeRegExp(editorSearchTerm), "gi");
    let matches = [];
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
      matches.push({ start: match.index, end: regex.lastIndex });
      if (match.index === regex.lastIndex) regex.lastIndex++; // avoid zero-length loop
    }
    setMatchIndices(matches);
    setCurrentMatchIndex(matches.length ? 0 : -1);
  }, [editorSearchTerm, fileContent]);

  // Scroll textarea to current match on change
  useEffect(() => {
    if (
      currentMatchIndex >= 0 &&
      currentMatchIndex < matchIndices.length &&
      textareaRef.current
    ) {
      const { start } = matchIndices[currentMatchIndex];
      // Move cursor to start of match
      textareaRef.current.selectionStart = start;
      textareaRef.current.selectionEnd = start + editorSearchTerm.length;
      textareaRef.current.focus();
      // Scroll to caret position
      const textarea = textareaRef.current;
      const linesBefore = fileContent.slice(0, start).split("\n").length - 1;
      const lineHeight = 20; // approx line height px, adjust if needed
      textarea.scrollTop = linesBefore * lineHeight;
    }
  }, [currentMatchIndex, matchIndices, editorSearchTerm, fileContent]);

  // Highlight matches for overlay, injecting <mark> tags
  const getHighlightedContent = () => {
    if (!editorSearchTerm) {
      return fileContent;
    }
    let result = "";
    let lastIndex = 0;
    matchIndices.forEach(({ start, end }, idx) => {
      // Append non-matched part
      result += escapeHtml(fileContent.slice(lastIndex, start));
      // Highlight matched part
      if (idx === currentMatchIndex) {
        result += `<mark class="current-match">${escapeHtml(
          fileContent.slice(start, end)
        )}</mark>`;
      } else {
        result += `<mark>${escapeHtml(fileContent.slice(start, end))}</mark>`;
      }
      lastIndex = end;
    });
    // Append remainder
    result += escapeHtml(fileContent.slice(lastIndex));
    return result;
  };

  // Escape html entities for safe injection
  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Filter and sort tree same as before
  const filterAndSortTree = (nodes) => {
    if (!nodes) return [];
    let filtered = nodes
      .map((node) => {
        if (node.type === "folder" && node.children) {
          const filteredChildren = filterAndSortTree(node.children);
          if (filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
          if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return { ...node, children: [] };
          }
          return null;
        } else {
          return node.name.toLowerCase().includes(searchTerm.toLowerCase())
            ? node
            : null;
        }
      })
      .filter(Boolean);

    filtered.sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return sortAsc ? -1 : 1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return sortAsc ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // All other file operations (addNewNode, deleteSelected, handleImport, findNodeAndParent, generateUniqueName)
  // ... Keep same as your original code

  // We must copy those helper functions here for completeness

  function findNodeAndParent(path, nodes = treeData, parent = null) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].path === path) {
        return { node: nodes[i], index: i, parent };
      }
      if (nodes[i].type === "folder" && nodes[i].children) {
        const found = findNodeAndParent(path, nodes[i].children, nodes[i]);
        if (found) return found;
      }
    }
    return null;
  }

  function generateUniqueName(baseName, children, ext = "") {
    let name = baseName + ext;
    let counter = 1;
    const existingNames = children.map((c) => c.name);
    while (existingNames.includes(name)) {
      name = `${baseName} (${counter})${ext}`;
      counter++;
    }
    return name;
  }

  const addNewNode = (type) => {
    let parentNode = null;
    if (selectedFile?.type === "folder") {
      parentNode = selectedFile;
    } else if (selectedFile?.type === "file") {
      const found = findNodeAndParent(selectedFile.path);
      if (found && found.parent) parentNode = found.parent;
    }

    setTreeData((oldTree) => {
      const newTree = JSON.parse(JSON.stringify(oldTree)); // deep copy

      const children = parentNode
        ? (function getChildren() {
            function findNodeByPath(nodes, path) {
              for (let node of nodes) {
                if (node.path === path) return node;
                if (node.type === "folder" && node.children) {
                  const res = findNodeByPath(node.children, path);
                  if (res) return res;
                }
              }
              return null;
            }
            const node = findNodeByPath(newTree, parentNode.path);
            if (!node.children) node.children = [];
            return node.children;
          })()
        : newTree;

      if (type === "file") {
        const baseName = "newfile";
        const name = generateUniqueName(baseName, children, ".txt");
        const newPath = parentNode ? parentNode.path + "/" + name : "/" + name;
        children.push({ name, type: "file", path: newPath });
        setSelectedFile({ name, type: "file", path: newPath });
      } else if (type === "folder") {
        const baseName = "newfolder";
        const name = generateUniqueName(baseName, children);
        const newPath = parentNode ? parentNode.path + "/" + name : "/" + name;
        children.push({ name, type: "folder", path: newPath, children: [] });
        setSelectedFile({ name, type: "folder", path: newPath });
      }

      return newTree;
    });
  };

  const deleteSelected = () => {
    if (!selectedFile) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${selectedFile.name}"? This cannot be undone!`
      )
    )
      return;

    setTreeData((oldTree) => {
      const newTree = JSON.parse(JSON.stringify(oldTree)); // deep copy

      function removeNode(path, nodes) {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].path === path) {
            nodes.splice(i, 1);
            return true;
          }
          if (nodes[i].type === "folder" && nodes[i].children) {
            if (removeNode(path, nodes[i].children)) return true;
          }
        }
        return false;
      }

      removeNode(selectedFile.path, newTree);
      return newTree;
    });

    setSelectedFile(null);
  };

  const handleImport = (e) => {
    const files = e.target.files;
    if (!files.length) return;

    let parentNode = null;
    if (selectedFile?.type === "folder") {
      parentNode = selectedFile;
    } else if (selectedFile?.type === "file") {
      const found = findNodeAndParent(selectedFile.path);
      if (found && found.parent) parentNode = found.parent;
    }

    setTreeData((oldTree) => {
      const newTree = JSON.parse(JSON.stringify(oldTree)); // deep copy

      const children = parentNode
        ? (function getChildren() {
            function findNodeByPath(nodes, path) {
              for (let node of nodes) {
                if (node.path === path) return node;
                if (node.type === "folder" && node.children) {
                  const res = findNodeByPath(node.children, path);
                  if (res) return res;
                }
              }
              return null;
            }
            const node = findNodeByPath(newTree, parentNode.path);
            if (!node.children) node.children = [];
            return node.children;
          })()
        : newTree;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const name = generateUniqueName(file.name, children);
        const newPath = parentNode ? parentNode.path + "/" + name : "/" + name;
        children.push({ name, type: "file", path: newPath });
      }

      return newTree;
    });

    e.target.value = null;
  };

  const filteredTree = filterAndSortTree(treeData);

  // Save file function (just alert here, you should replace with real save)
  const saveFile = () => {
    alert(
      `Saving file "${selectedFile.name}" with content:\n\n${fileContent.slice(
        0,
        200
      )}${fileContent.length > 200 ? "..." : ""}`
    );
    // TODO: Add real backend save integration here
  };

  // Move to next match
  const goToNextMatch = () => {
    if (matchIndices.length === 0) return;
    setCurrentMatchIndex((idx) => (idx + 1) % matchIndices.length);
  };

  // Move to previous match
  const goToPrevMatch = () => {
    if (matchIndices.length === 0) return;
    setCurrentMatchIndex((idx) =>
      idx === 0 ? matchIndices.length - 1 : idx - 1
    );
  };

  // Sync scroll of overlay to textarea
  const onScroll = (e) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.target.scrollTop;
      overlayRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  return (
    <div className="filemanager-container">
      <aside className="file-tree" role="tree" aria-label="File manager tree">
        <header className="file-tree-header">
          <h2>📁 File Manager</h2>

          <div className="file-tree-buttons">
            <button
              onClick={() => addNewNode("file")}
              title="Create New File"
              aria-label="Create New File"
              className="btn"
            >
              <FaPlus /> New File
            </button>
            <button
              onClick={() => addNewNode("folder")}
              title="Create New Folder"
              aria-label="Create New Folder"
              className="btn"
            >
              <FaFolderPlus /> New Folder
            </button>

            <label
              htmlFor="import-file"
              className="btn btn-import"
              title="Import File"
            >
              <FaUpload /> Import
            </label>
            <input
              type="file"
              id="import-file"
              onChange={handleImport}
              multiple
              style={{ display: "none" }}
            />

            <button
              onClick={deleteSelected}
              title="Delete Selected"
              aria-label="Delete Selected"
              className="btn btn-delete"
              disabled={!selectedFile}
            >
              <FaTrash /> Delete
            </button>
          </div>

          <div className="file-tree-controls">
            <input
              type="search"
              aria-label="Search files and folders"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              spellCheck={false}
            />
            <button
              className="btn-sort"
              title={`Sort files ${sortAsc ? "descending" : "ascending"}`}
              aria-pressed={sortAsc}
              onClick={() => setSortAsc(!sortAsc)}
            >
              {sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            </button>
          </div>
        </header>

        <div className="file-tree-list" role="tree">
          {filteredTree.length > 0 ? (
            filteredTree.map((node) => (
              <FileNode
                key={node.path}
                node={node}
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            ))
          ) : (
            <div className="empty-tree-msg">No files or folders found</div>
          )}
        </div>
      </aside>

      <main className="file-editor-container">
        {selectedFile ? (
          selectedFile.type === "file" ? (
            <>
              <header className="editor-header">
                <h3>{selectedFile.name}</h3>
                <button onClick={saveFile} className="btn btn-save">
                  Save
                </button>
              </header>

              <section className="editor-search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="search"
                  aria-label="Search in file"
                  placeholder="Search in file..."
                  value={editorSearchTerm}
                  onChange={(e) => setEditorSearchTerm(e.target.value)}
                  spellCheck={false}
                />
                <button
                  onClick={goToPrevMatch}
                  disabled={matchIndices.length === 0}
                  aria-label="Previous match"
                  className="btn-nav"
                >
                  ◀
                </button>
                <button
                  onClick={goToNextMatch}
                  disabled={matchIndices.length === 0}
                  aria-label="Next match"
                  className="btn-nav"
                >
                  ▶
                </button>
                <span className="match-counter" aria-live="polite">
                  {matchIndices.length > 0
                    ? `${currentMatchIndex + 1} / ${matchIndices.length}`
                    : "0 / 0"}
                </span>
                <button
                  onClick={() => {
                    setEditorSearchTerm("");
                    setCurrentMatchIndex(0);
                    textareaRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="btn-clear-search"
                >
                  <FaTimes />
                </button>
              </section>

              <div
                className="editor-wrapper"
                aria-label="Code editor with search highlights"
              >
                <pre
                  className="editor-overlay"
                  ref={overlayRef}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
                />
                <textarea
                  ref={textareaRef}
                  className="editor-textarea"
                  spellCheck={false}
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  onScroll={onScroll}
                  aria-label={`Editing file content: ${selectedFile.name}`}
                />
              </div>
            </>
          ) : (
            <div className="folder-info">
              <h3>{selectedFile.name}</h3>
              <p>This is a folder. Select a file to edit.</p>
            </div>
          )
        ) : (
          <div className="no-file-selected">Select a file to view or edit.</div>
        )}
      </main>
    </div>
  );
}
