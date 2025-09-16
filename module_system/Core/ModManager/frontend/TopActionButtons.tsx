"use client";

import React from "react";
import { FaSyncAlt } from "react-icons/fa";

interface TopActionButtonsProps {
  onRefresh: () => void;
  onLoadOrder: () => void;
  onSelectModDir?: () => void; // Optional handler for Select Mod DIR
}

const TopActionButtons: React.FC<TopActionButtonsProps> = ({
  onRefresh,
  onLoadOrder,
  onSelectModDir,
}) => {
  const SyncIcon: JSX.Element = <FaSyncAlt />; // Explicitly typed

  return (
    <>
      <button onClick={onRefresh} title="Refresh Mods">
        {SyncIcon} Refresh
      </button>
      <button onClick={onLoadOrder} title="Load Project Zomboid Order">
        {SyncIcon} Load Order
      </button>
      <button onClick={onSelectModDir} title="Select Mod DIR">
        {SyncIcon} Select Mod DIR
      </button>
    </>
  );
};

export default TopActionButtons;
