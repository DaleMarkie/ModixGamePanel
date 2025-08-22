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
        onKeyDown={(e) => e.key === "Enter" && toggleOpen()}
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
        node.children?.map((child) => (
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

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function FileBrowser() {
  const [treeData, setTreeData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [editorSearchTerm, setEditorSearchTerm] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matchIndices, setMatchIndices] = useState([]);
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);

  // figure out which game is selected
  const selectedGame = localStorage.getItem("selectedGame") || "pz";
  const API_BASE =
    selectedGame === "rimworld"
      ? "http://localhost:2010/api/rimworld"
      : "http://localhost:2010/api/projectzomboid";

  // fetch file tree
  const fetchTree = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/files`);
      if (!response.ok) throw new Error("Failed to fetch file tree");
      const data = await response.json();
      setTreeData(data);
    } catch (error) {
      console.error("Error loading tree:", error);
      setTreeData([]);
    }
  }, [API_BASE]);

  // fetch file content
  const fetchFileContent = useCallback(
    async (path) => {
      try {
        const response = await fetch(
          `${API_BASE}/files/content?path=${encodeURIComponent(path)}`
        );
        if (!response.ok) throw new Error("Failed to fetch file content");
        const data = await response.json();
        setFileContent(data.content || "// No content for this file.");
      } catch (error) {
        console.error("Error loading file:", error);
        setFileContent("// Error loading file content.");
      } finally {
        setEditorSearchTerm("");
        setCurrentMatchIndex(0);
        setMatchIndices([]);
      }
    },
    [API_BASE]
  );

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

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

  useEffect(() => {
    if (!editorSearchTerm) {
      setMatchIndices([]);
      setCurrentMatchIndex(0);
      return;
    }
    const regex = new RegExp(escapeRegExp(editorSearchTerm), "gi");
    const matches = [];
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
      matches.push({ start: match.index, end: regex.lastIndex });
      if (match.index === regex.lastIndex) regex.lastIndex++;
    }
    setMatchIndices(matches);
    setCurrentMatchIndex(matches.length ? 0 : -1);
  }, [editorSearchTerm, fileContent]);

  useEffect(() => {
    if (
      currentMatchIndex >= 0 &&
      currentMatchIndex < matchIndices.length &&
      textareaRef.current
    ) {
      const { start } = matchIndices[currentMatchIndex];
      textareaRef.current.selectionStart = start;
      textareaRef.current.selectionEnd = start + editorSearchTerm.length;
      textareaRef.current.focus();
    }
  }, [currentMatchIndex, matchIndices, editorSearchTerm]);

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  const getHighlightedContent = () => {
    if (!editorSearchTerm) return escapeHtml(fileContent);
    let result = "";
    let lastIndex = 0;
    matchIndices.forEach(({ start, end }, idx) => {
      result += escapeHtml(fileContent.slice(lastIndex, start));
      result += `<mark class="${
        idx === currentMatchIndex ? "current-match" : ""
      }">${escapeHtml(fileContent.slice(start, end))}</mark>`;
      lastIndex = end;
    });
    result += escapeHtml(fileContent.slice(lastIndex));
    return result;
  };

  const filterAndSortTree = (nodes) => {
    if (!nodes) return [];
    let filtered = nodes
      .map((node) => {
        if (node.type === "folder" && node.children) {
          const filteredChildren = filterAndSortTree(node.children);
          if (filteredChildren.length > 0)
            return { ...node, children: filteredChildren };
          if (node.name.toLowerCase().includes(searchTerm.toLowerCase()))
            return { ...node, children: [] };
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

  const saveFile = () => {
    alert(
      `Saving file "${selectedFile.name}" with content:\n\n${fileContent.slice(
        0,
        200
      )}...`
    );
  };

  const goToNextMatch = () =>
    setCurrentMatchIndex((i) =>
      matchIndices.length ? (i + 1) % matchIndices.length : i
    );
  const goToPrevMatch = () =>
    setCurrentMatchIndex((i) =>
      matchIndices.length
        ? (i - 1 + matchIndices.length) % matchIndices.length
        : i
    );

  const onScroll = (e) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.target.scrollTop;
      overlayRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const filteredTree = filterAndSortTree(treeData);

  return (
    <div className="filemanager-container">
      <aside className="file-tree">
        <header className="file-tree-header">
          <h2>📁 File Manager ({selectedGame})</h2>
          <div className="file-tree-controls">
            <input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => setSortAsc(!sortAsc)}>
              {sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            </button>
          </div>
        </header>
        <div className="file-tree-list">
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
                <button onClick={saveFile}>💾 Save</button>
              </header>

              <section className="editor-search-bar">
                <FaSearch />
                <input
                  placeholder="Search in file..."
                  value={editorSearchTerm}
                  onChange={(e) => setEditorSearchTerm(e.target.value)}
                />
                <button onClick={goToPrevMatch}>◀</button>
                <button onClick={goToNextMatch}>▶</button>
                <span>
                  {matchIndices.length > 0
                    ? `${currentMatchIndex + 1} / ${matchIndices.length}`
                    : "0 / 0"}
                </span>
                <button onClick={() => setEditorSearchTerm("")}>
                  <FaTimes />
                </button>
              </section>

              <div className="editor-wrapper">
                <pre
                  className="editor-overlay"
                  ref={overlayRef}
                  dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
                />
                <textarea
                  ref={textareaRef}
                  className="editor-textarea"
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  onScroll={onScroll}
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
