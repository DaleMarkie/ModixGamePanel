import React, { useState } from "react";
import { FaCog, FaFolderOpen, FaTrash } from "react-icons/fa";
import { BsFolderSymlink } from "react-icons/bs"; // new icon for select dir
import * as modService from "./modService";

interface ModActionButtonsProps {
  modId: string;
  modPath: string;
  enabled: boolean;
  onUpdate: () => void;
}

const ModActionButtons: React.FC<ModActionButtonsProps> = ({
  modId,
  modPath,
  enabled,
  onUpdate,
}) => {
  const [newDir, setNewDir] = useState("");

  const handleToggle = async () => {
    try {
      await modService.toggleMod(modId);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenFolder = async () => {
    try {
      await modService.openModFolder(modPath);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this mod?")) return;
    try {
      await modService.deleteMod(modId);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectModDir = async () => {
    const path = prompt(
      "Enter the path to your mod directory:",
      newDir || modPath
    );
    if (!path) return;

    try {
      await modService.setModDirectory(path);
      setNewDir(path);
      alert("✅ Mod directory updated!");
      onUpdate();
    } catch (err) {
      console.error("Failed to set mod directory:", err);
    }
  };

  return (
    <div className="mod-actions">
      <label className="switch">
        <input type="checkbox" checked={enabled} onChange={handleToggle} />
        <span className="slider"></span>
      </label>
      <button
        className="settings-btn"
        onClick={() => alert("Settings not implemented yet")}
      >
        <FaCog />
      </button>
      <button className="open-btn" onClick={handleOpenFolder}>
        <FaFolderOpen />
      </button>
      <button
        className="select-dir-btn"
        onClick={handleSelectModDir}
        title="Select Mod Dir"
      >
        <BsFolderSymlink />
      </button>
      <button className="delete-btn" onClick={handleDelete}>
        <FaTrash />
      </button>
    </div>
  );
};

export default ModActionButtons;
