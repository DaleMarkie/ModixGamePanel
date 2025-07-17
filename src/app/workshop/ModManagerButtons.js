import React, { useState } from "react";
//import DownloadMod from "./DownloadMod";
//import DeleteMod from "./DeleteMod";
//import EditMod from "./EditMod";
// Import other submenu components...

const submenuItems = [
  { key: "download", label: "Download Mod", component: DownloadMod },
  { key: "delete", label: "Delete Mod", component: DeleteMod },
  { key: "edit", label: "Edit Mod", component: EditMod },
  // Add more submenu entries here
];

function ModManager() {
  const [activeSubmenu, setActiveSubmenu] = useState("download");

  // Find the component for active submenu
  const ActiveComponent = submenuItems.find(item => item.key === activeSubmenu)?.component;

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar / submenu buttons */}
      <nav style={{ width: 200, borderRight: "1px solid #333", padding: 10 }}>
        {submenuItems.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveSubmenu(key)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 8,
              padding: "8px 12px",
              backgroundColor: key === activeSubmenu ? "#5566ff" : "#222",
              color: key === activeSubmenu ? "#fff" : "#ccc",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Main content area for submenu component */}
      <main style={{ flexGrow: 1, padding: 20 }}>
        {ActiveComponent ? <ActiveComponent /> : <div>Select an option</div>}
      </main>
    </div>
  );
}

export default ModManager;
