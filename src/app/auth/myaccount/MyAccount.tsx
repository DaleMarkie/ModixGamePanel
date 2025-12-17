"use client";

import React, { useState, useEffect, Suspense, lazy, FC } from "react";
import "./MyAccount.css";
import Activity from "../activity/Activity";
import MyTickets from "../../support/mytickets/MyTickets";
import WelcomePopup from "./welcome/welcome-popup";
import Users from "./subusers/Users";
import { getServerUrl } from "@/app/config";
import License from "../License/License";

const Settings = lazy(() => import("./settings/mySettings"));

// ------------------ TAB BUTTON COMPONENT ------------------
interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const TabButton: FC<TabButtonProps> = ({ label, active, onClick, disabled }) => (
  <button
    className={`tab ${active ? "active" : ""} ${disabled ? "tab-disabled" : ""}`}
    onClick={disabled ? undefined : onClick}
    aria-current={active ? "page" : undefined}
    disabled={disabled}
  >
    {label}
  </button>
);

// ------------------ PANEL PAGE TYPES ------------------
interface FlatPage {
  label: string;
  status: "Operational" | "Under Development" | "Placeholder";
  description: string;
}

const ALL_PAGES: FlatPage[] = [
  {
    label: "🖥️ Terminal",
    status: "Operational",
    description: `- Access live server console to run commands directly
- Monitor server logs in real-time
- Restart or stop services quickly`,
  },
  {
    label: "📁 File Manager",
    status: "Operational",
    description: `- Upload, download, and edit server files
- Quick search to locate files
- Drag-and-drop functionality
- Manage configuration files securely`,
  },
  {
    label: "🧩 Mod Manager",
    status: "Operational",
    description: `- Install, enable, or disable mods
- View installed mods and versions
- Check for mod dependencies and conflicts
- Receive update notifications`,
  },
  {
    label: "🛠️ Workshop Manager",
    status: "Operational",
    description: `- Manage Steam Workshop subscriptions
- Install or unsubscribe from mods
- Track mod compatibility with server version
- Keep mods up-to-date effortlessly`,
  },
  {
    label: "👥 Player Manager",
    status: "Under Development",
    description: `- View and manage player accounts
- Track active sessions and playtime
- Review chat logs and ban history
- Monitor player stats and behavior`,
  },
];

// ------------------ MAIN COMPONENT ------------------
const MyAccount: FC = () => {
  const [activeTab, setActiveTab] = useState("📊 Dashboard");
  const [user, setUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPage, setSelectedPage] = useState<FlatPage | null>(null);

  // ------------------ LOAD USER ------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("modix_user");
    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.roles = parsedUser.roles || [parsedUser.role || "SubUser"];
      setUser(parsedUser);
      setShowWelcome(true);
    } catch {
      localStorage.removeItem("modix_user");
    }
  }, []);

  // ------------------ FETCH USER LOGS ------------------
  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("modix_token");
        const res = await fetch(`${getServerUrl()}/api/auth/logs`, {
          headers: { Authorization: token || "" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUserLogs(data.logs || []);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };

    fetchLogs();
  }, [user]);

  // ------------------ LOGOUT ------------------
  const handleLogout = async () => {
    try {
      await fetch(`${getServerUrl()}/api/auth/logout`, { method: "POST" });
    } catch {}
    localStorage.removeItem("modix_user");
    localStorage.removeItem("modix_token");
    window.location.href = "/auth/login";
  };

  if (!user)
    return <div className="not-logged">Please log in to access your account.</div>;

  // ------------------ TAB CONFIG ------------------
  const allTabs = [
    { label: "📊 Dashboard", roles: ["Owner", "SubUser", "Admin"] },
    { label: "🔐 Security", roles: ["Owner", "Admin"] },
    { label: "📜 Activity", roles: ["Owner", "SubUser", "Admin"] },
    { label: "🧾 My License", roles: ["Owner", "Admin"] },
    { label: "👥 Sub-Users", roles: ["Owner", "Admin"] },
    { label: "⚙️ Settings", roles: ["Owner", "Admin"] },
    { label: "🛠️ Support", roles: ["Owner", "SubUser", "Admin"] },
  ];

  const userRoles = user.roles || ["SubUser"];
  const hasRole = (tabRoles: string[]) => tabRoles.some((r) => userRoles.includes(r));

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleString();
  };

  const filteredPages = ALL_PAGES.filter((page) =>
    page.label.toLowerCase().includes(search.toLowerCase())
  );

  // ------------------ DASHBOARD INFO ------------------
  const dashboardInfo = [
    { label: "Username", value: user.username || "N/A" },
    { label: "Email", value: user.email || "N/A" },
    { label: "Role(s)", value: userRoles.join(", ") },
    { label: "Status", value: user.active ? "Active ✅" : "Inactive ❌", className: user.active ? "status-active" : "status-inactive" },
    { label: "Joined", value: formatDate(user.created_at) },
    { label: "Last Login", value: formatDate(user.last_login) },
    { label: "Account ID", value: user.id || "N/A" },
    { label: "Plan / License", value: user.license?.plan || "Free / N/A" },
    { label: "Active Sessions", value: userLogs.length || "0" },
  ];

  return (
    <div className="myaccount-container">
      {/* ------------------ HEADER ------------------ */}
      <header className="account-header">
        <h1>⚙️ My Account</h1>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </header>

      {/* ------------------ TABS ------------------ */}
      <nav className="tabs" aria-label="Account navigation">
        {allTabs.map((tab) => (
          <TabButton
            key={tab.label}
            label={tab.label}
            active={activeTab === tab.label}
            disabled={!hasRole(tab.roles)}
            onClick={() => setActiveTab(tab.label)}
          />
        ))}
      </nav>

      {/* ------------------ TAB CONTENT ------------------ */}
      {activeTab === "📊 Dashboard" && (
        <section className="dashboard-user-info">
          {dashboardInfo.map((info, idx) => (
            <div key={idx} className="info-card">
              <div className="info-details">
                <span className={`info-value ${info.className || ""}`}>{info.value}</span>
                <span className="info-label">{info.label}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === "🔐 Security" && <div>Security Tab Content</div>}
      {activeTab === "📜 Activity" && <Activity />}
      {activeTab === "👥 Sub-Users" && <Users />}
      {activeTab === "⚙️ Settings" && (
        <Suspense fallback={<div>Loading Settings...</div>}>
          <Settings />
        </Suspense>
      )}
      {activeTab === "🛠️ Support" && <MyTickets />}
      {activeTab === "🧾 My License" && <License />}

      {/* ------------------ WELCOME POPUP ------------------ */}
      {showWelcome && (
        <WelcomePopup
          username={user.username}
          logs={userLogs.slice(0, 5)}
          onClose={() => setShowWelcome(false)}
        />
      )}

      {/* ------------------ PANEL PAGES ------------------ */}
      <section className="panel-pages-bottom">
        <h3 className="pages-header">📂 Panel Pages Overview</h3>
        <p className="pages-overview-description">
          See which pages are fully operational, under development, or placeholders.
        </p>
        <input
          className="pages-search"
          placeholder="Search panel pages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="pages-list compact">
          {filteredPages.length > 0 ? filteredPages.map((page, idx) => (
            <li key={idx} className={`page-item ${page.status !== "Operational" ? "dev" : ""}`} onClick={() => setSelectedPage(page)}>
              {page.label} <span className="dev-badge">{page.status}</span>
            </li>
          )) : <li className="no-pages">No matching pages found.</li>}
        </ul>

        {/* ------------------ MODAL ------------------ */}
        {selectedPage && (
          <div className="page-description-modal">
            <div className="modal-content">
              <button className="modal-close" onClick={() => setSelectedPage(null)}>×</button>
              <h2>{selectedPage.label}</h2>
              <ul className="modal-bullet-list">
                {selectedPage.description.split("\n").map((line, idx) => (
                  <li key={idx}>{line.replace(/^-/, "").trim()}</li>
                ))}
              </ul>
              <span className={`status-badge ${selectedPage.status.replace(" ", "-").toLowerCase()}`}>
                {selectedPage.status}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyAccount;
