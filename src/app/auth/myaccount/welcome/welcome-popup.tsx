"use client";

import { useState } from "react";
import "./welcome-popup.css";

interface WelcomePopupProps {
  username: string;
  logs?: { date: string; event: string }[];
  onClose: () => void;
}

const PAGES = [
  {
    name: "Console",
    icon: "🖥️",
    status: "Operational",
  },
  {
    name: "Change Game",
    icon: "📁",
    status: "Operational",
  },
  {
    name: "Server Settings",
    icon: "🧩",
    status: "Operational",
  },
  {
    name: "Backups",
    icon: "🛠️",
    status: "Operational",
  },
  {
    name: "Steam Install",
    icon: "👤",
    status: "Under Development",
    dev: true,
  },
  {
    name: "Steam Install",
    icon: "👤",
    status: "Under Development",
    dev: true,
  },
  {
    name: "Steam Update",
    icon: "👤",
    status: "Under Development",
    dev: true,
  },
  {
    name: "Steam Validate Files",
    icon: "👤",
    status: "Under Development",
    dev: true,
  },
  {
    name: "My Mods",
    icon: "👤",
    status: "Under Development",
    dev: true,
  },
  {
    name: "Workshop Manager",
    icon: "👤",
    status: "Under Development",
    dev: true,
  },
];

const WelcomePopup = ({ username, logs = [], onClose }: WelcomePopupProps) => {
  const [search, setSearch] = useState("");

  const filteredPages = PAGES.filter((page) =>
    page.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="welcome-popup-overlay">
      <div className="welcome-popup-card">
        <header className="welcome-popup-header">
          <h2>👋 Welcome back, {username}!</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </header>

        <section className="welcome-popup-body">
          <p className="intro-text">
            <strong className="brand">Modix</strong> is an evolving project
            that’s <span className="highlight">actively being developed</span>{" "}
            by <span className="team">OV3RLORD</span> &{" "}
            <span className="team">GameSmithOnline</span>.
          </p>

          <p className="intro-subtext">
            Our goal is to build a{" "}
            <span className="highlight">powerful, modern game panel</span> for{" "}
            <span className="pz-highlight">Project Zomboid</span>, with future
            support planned for additional titles.
          </p>

          <div className="update-info">
            <p>
              🧩 Modix is under active development. Below you can check which
              panel pages are fully operational, still in development, or
              currently placeholders.
            </p>
          </div>

          {/* PANEL PAGES */}
          <div className="panel-pages">
            <h3 className="pages-header">📂 Panel Pages</h3>

            <input
              type="text"
              className="pages-search"
              placeholder="Search panel pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <ul className="pages-list compact">
              {filteredPages.map((page) => (
                <li
                  key={page.name}
                  className={`page-item ${page.dev ? "dev" : ""}`}
                >
                  {page.icon} {page.name}
                  <span className="dev-badge">{page.status}</span>
                </li>
              ))}

              {!filteredPages.length && (
                <li className="no-pages">No matching pages found.</li>
              )}
            </ul>
          </div>

          {logs.length ? (
            <>
              <h3 className="update-header">🆕 Recent Local Updates</h3>
              <ul className="welcome-logs">
                {logs.map((log, idx) => (
                  <li key={idx}>
                    <span className="log-date">
                      {new Date(log.date).toLocaleString()}
                    </span>{" "}
                    - <span className="log-event">{log.event}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="no-logs">
              By using Modix: Game Panel you agree to the terms of use.
            </p>
          )}
        </section>

        <footer className="welcome-popup-footer">
          <button className="close-footer-btn" onClick={onClose}>
            Continue to Panel 🚀
          </button>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePopup;
