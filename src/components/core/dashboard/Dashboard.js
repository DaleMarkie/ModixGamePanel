import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { stats, updateLogs } from "./dashboardData";
import StatCard from "./StatCard";
import UpdateLogs from "./UpdateLogs";
import LicenseModal from "./LicenseModal";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const buttons = [
  { label: "View License", icon: "📜", onClick: () => setShowModal(true) },         // Scroll for license
  { label: "Documentation", icon: "📚", path: "/dashboard/documentation" },         // Books for docs
  { label: "Setup SteamCMD", icon: "🛠️", path: "/dashboard/setup-steamcmd" },      // Hammer & wrench for setup
  { label: "Panel Settings", icon: "⚙️", path: "/help" },                          // Gear for panel settings
  { label: "User Settings", icon: "👤", path: "/usersettings" },                    // User icon for user settings
  { label: "Steam Parser", icon: "🔍", path: "/steamParser" },                      // Magnifying glass for parser
  { label: "Webhook", icon: "🔗", path: "/webhook" },                              // Link chain for webhook
  { label: "Help", icon: "❓", path: "/help" },                                    // Question mark for help
  { label: "Panel Health", icon: "🔗", path: "/modix-health" },   
];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 System Dashboard</h1>
        <p className="dashboard-subtitle">
          Monitor your server's system performance, resource usage, and port
          status at a glance.
        </p>
      </header>

      <div
        className="dashboard-buttons"
        role="group"
        aria-label="Dashboard navigation buttons"
      >
        {buttons.map(({ label, icon, onClick, path }) => (
          <button
            key={label}
            className="dashboard-btn"
            onClick={onClick ?? (() => navigate(path))}
            aria-label={label}
            title={label}
            type="button"
          >
            <span className="btn-icon" aria-hidden="true">
              {icon}
            </span>{" "}
            {label}
          </button>
        ))}
      </div>

      <section
        className="dashboard-stats"
        style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}
      >
        {Object.entries(stats).map(([section, values]) =>
          Object.entries(values).map(([label, value]) => (
            <StatCard
              key={`${section}-${label}`}
              title={`${section.toUpperCase()} ${label}`}
              value={value}
            />
          ))
        )}
      </section>

      <UpdateLogs logs={updateLogs} />

      {showModal && <LicenseModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Dashboard;
