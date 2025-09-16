"use client";

import React from "react";
import { FaCog, FaFolderOpen, FaTrash } from "react-icons/fa";
import { BsFolderSymlink } from "react-icons/bs";

interface ModActionButtonsProps {
  onSettings: () => void;
  onOpenFolder: () => void;
  onSelectSymlink?: () => void;
  onDelete?: () => void;
}

const ModActionButtons: React.FC<ModActionButtonsProps> = ({
  onSettings,
  onOpenFolder,
  onSelectSymlink,
  onDelete,
}) => {
  return (
    <div className="mod-action-buttons flex gap-2">
      <button onClick={onSettings} title="Settings">
        <>{<FaCog />} Settings</>
      </button>
      <button onClick={onOpenFolder} title="Open Folder">
        <>{<FaFolderOpen />} Open</>
      </button>
      <button onClick={onSelectSymlink} title="Select Symlink">
        <>{<BsFolderSymlink />} Symlink</>
      </button>
      <button onClick={onDelete} title="Delete">
        <>{<FaTrash />} Delete</>
      </button>
    </div>
  );
};

export default ModActionButtons;
