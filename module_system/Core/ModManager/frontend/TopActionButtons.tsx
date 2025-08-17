import React from "react";
import { FaSyncAlt } from "react-icons/fa";

interface TopActionButtonsProps {
  onRefresh: () => void;
  onLoadOrder: () => void;
}

const TopActionButtons: React.FC<TopActionButtonsProps> = ({
  onRefresh,
  onLoadOrder,
}) => {
  return (
    <>
      <button onClick={onRefresh} title="Refresh Mods">
        <FaSyncAlt /> Refresh
      </button>
      <button onClick={onLoadOrder} title="Load Project Zomboid Order">
        <FaSyncAlt /> Load Order
      </button>
      <button onClick={onLoadOrder} title="Select Mod DIR">
        <FaSyncAlt /> Select Mod DIR
      </button>
    </>
  );
};

export default TopActionButtons;
