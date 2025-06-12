import React, { useState, useEffect } from "react";
import "./FileManager.css"; // ✅ Move styles here for cleaner JSX

const BASE_FOLDER = "Zomboid";
const API_URL = "http://localhost:2010/api";

const FileManager = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editFileName, setEditFileName] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fullPath = () => (currentPath ? `${BASE_FOLDER}/${currentPath}` : BASE_FOLDER);

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    setSelectedIndex(null);
    try {
      const res = await fetch(`${API_URL}/files?path=${encodeURIComponent(fullPath())}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const sorted = [...(data.files || [])].sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "folder" ? -1 : 1;
      });
      setFiles(sorted);
    } catch (err) {
      setFiles([]);
      setError(err.message || "Error loading files.");
    } finally {
      setLoading(false);
    }
  };

  const enterFolder = (name) => {
    setCurrentPath(currentPath ? `${currentPath}/${name}` : name);
  };

  const goToPath = (index) => {
    if (index === -1) return setCurrentPath("");
    const parts = currentPath.split("/").slice(0, index + 1);
    setCurrentPath(parts.join("/"));
  };

  const goUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  const openFile = async (file) => {
    setEditLoading(true);
    setIsEditing(true);
    setEditFileName(file.name);
    setEditError("");
    try {
      const path = `${fullPath()}/${file.name}`;
      const res = await fetch(`${API_URL}/file?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      setEditContent(await res.text());
    } catch (err) {
      setEditContent("");
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const saveFile = async () => {
    setEditLoading(true);
    setEditError("");
    try {
      const path = `${fullPath()}/${editFileName}`;
      const res = await fetch(`${API_URL}/file?path=${encodeURIComponent(path)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      setIsEditing(false);
      fetchFiles();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="file-manager">
      <header className="file-manager-header">
        <h2>📁 File Manager</h2>
        <button onClick={goUp} disabled={!currentPath}>
          ⬆ Up
        </button>
      </header>

      <nav className="breadcrumbs">
        <span onClick={() => goToPath(-1)}>{BASE_FOLDER}</span>
        {currentPath.split("/").map((part, i, arr) => (
          <span key={i} onClick={() => goToPath(i)}>
            / {part}
          </span>
        ))}
      </nav>

      <input
        type="text"
        className="search"
        placeholder="🔍 Search files or folders..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading && <div className="status">Loading...</div>}
      {error && <div className="error">❌ {error}</div>}

      {!loading && !error && (
        <table className="file-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Modified</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={3}>No results found.</td>
              </tr>
            ) : (
              filteredFiles.map((file, i) => (
                <tr
                  key={file.name}
                  onClick={() => setSelectedIndex(i)}
                  onDoubleClick={() =>
                    file.type === "folder" ? enterFolder(file.name) : openFile(file)
                  }
                  className={i === selectedIndex ? "selected" : ""}
                >
                  <td>{file.type === "folder" ? "📂" : "📄"} {file.name}</td>
                  <td>{file.type === "folder" ? "-" : file.size}</td>
                  <td>{file.modified}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {isEditing && (
        <div className="modal">
          <div className="modal-content" role="dialog" aria-modal="true">
            <h3>Editing: {editFileName}</h3>
            {editLoading ? (
              <p>Loading...</p>
            ) : editError ? (
              <p className="error">Error: {editError}</p>
            ) : (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
            )}
            <div className="modal-actions">
              <button onClick={() => setIsEditing(false)} disabled={editLoading}>
                Cancel
              </button>
              <button onClick={saveFile} disabled={editLoading}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
