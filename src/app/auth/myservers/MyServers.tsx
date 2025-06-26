"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const MyServers = () => {
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    const handleEsc = (event) => {
      if (event.key === "Escape") setOpenDropdownId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const servers = [
    {
      id: "srv1",
      name: "Project Zomboid - Server 1",
      status: "Running",
      ip: "192.168.1.101",
      location: "US East",
      players: 12,
      maxPlayers: 30,
      uptime: "3d 14h",
      banner:
        "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/108600/capsule_616x353.jpg?t=1739309087",
    },
    {
      id: "srv2",
      name: "Minecraft - Survival World",
      status: "Stopped",
      ip: "192.168.1.102",
      location: "Europe West",
      players: 0,
      maxPlayers: 20,
      uptime: "0",
      banner:
        "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png",
    },
    {
      id: "srv3",
      name: "ARK - PvP Server",
      status: "Running",
      ip: "192.168.1.103",
      location: "US West",
      players: 18,
      maxPlayers: 50,
      uptime: "12h 43m",
      banner:
        "https://upload.wikimedia.org/wikipedia/en/e/e9/ARK_Survival_Evolved_cover.jpg",
    },
  ];

  const toggleDropdown = (id) =>
    setOpenDropdownId(openDropdownId === id ? null : id);
  const closeDropdown = () => setOpenDropdownId(null);

  const handleAction = (action, id) => {
    closeDropdown();
    alert(`${action} for server ${id} (implement)`);
  };

  const handleDelete = (id) => {
    closeDropdown();
    if (confirm("Are you sure you want to delete this server?")) {
      alert(`Deleted server ${id} (implement)`);
    }
  };

  return (
    <div className="myservers-container" ref={dropdownRef}>
      <h1>My Servers</h1>

      {servers.length === 0 ? (
        <p>No servers found.</p>
      ) : (
        <table
          className="myservers-table"
          role="grid"
          aria-label="User servers"
          cellSpacing={0}
        >
          <thead>
            <tr>
              <th>Server</th>
              <th>Status</th>
              <th>IP</th>
              <th>Location</th>
              <th>Players</th>
              <th>Uptime</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {servers.map(
              ({
                id,
                name,
                status,
                ip,
                location,
                players,
                maxPlayers,
                uptime,
                banner,
              }) => (
                <tr
                  key={id}
                  className={status === "Running" ? "running" : "stopped"}
                  tabIndex={0}
                  aria-label={`${name} server row`}
                >
                  <td className="server-name-cell" title={name}>
                    <img
                      src={banner}
                      alt={`${name} banner`}
                      className="server-banner"
                      loading="lazy"
                      width={40}
                      height={23}
                    />
                    <span>{name}</span>
                  </td>
                  <td
                    className={
                      status === "Running" ? "status-running" : "status-stopped"
                    }
                  >
                    {status}
                  </td>
                  <td>{ip}</td>
                  <td>{location}</td>
                  <td>
                    {players}/{maxPlayers}
                  </td>
                  <td>{uptime}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => toggleDropdown(id)}
                      className="manage-button"
                      aria-expanded={openDropdownId === id}
                      aria-haspopup="true"
                      aria-controls={`dropdown-menu-${id}`}
                    >
                      Manage
                      <span
                        className={`arrow ${
                          openDropdownId === id ? "open" : ""
                        }`}
                      />
                    </button>
                    {openDropdownId === id && (
                      <div
                        className="dropdown-menu"
                        role="menu"
                        id={`dropdown-menu-${id}`}
                        aria-label={`Actions for server ${name}`}
                      >
                        <button
                          onClick={() => handleAction("Manage Server", id)}
                          className="dropdown-item"
                          role="menuitem"
                        >
                          🛠 Manage Server
                        </button>
                        <button
                          onClick={() => handleAction("View Details", id)}
                          className="dropdown-item"
                          role="menuitem"
                        >
                          📄 View Details
                        </button>
                        <button
                          onClick={() => handleAction("Restart", id)}
                          className="dropdown-item"
                          role="menuitem"
                          disabled={status !== "Running"}
                          title={
                            status !== "Running"
                              ? "Can't restart stopped server"
                              : undefined
                          }
                        >
                          🔄 Restart
                        </button>
                        <button
                          onClick={() => handleAction("Stop", id)}
                          className="dropdown-item"
                          role="menuitem"
                          disabled={status !== "Running"}
                          title={
                            status !== "Running"
                              ? "Server is not running"
                              : undefined
                          }
                        >
                          ⏹ Stop
                        </button>
                        <hr className="dropdown-divider" />
                        <button
                          onClick={() => handleDelete(id)}
                          className="dropdown-item delete"
                          role="menuitem"
                        >
                          🗑 Delete Server
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}

      <style jsx>{`
        /* Container */
        .myservers-container {
          padding: 1rem 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
            sans-serif;
          background: #121212;
          color: #d0d0d0;
          min-height: 100vh;
        }

        h1 {
          font-size: 1.6rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #c8f1ec;
        }

        /* Table */
        .myservers-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 6px;
          background: transparent;
          font-size: 0.9rem;
        }

        thead tr {
          background: #1f1f1f;
          border-radius: 6px;
          user-select: none;
        }

        thead th {
          padding: 10px 12px;
          color: #79c8bc;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: left;
          font-size: 0.75rem;
          border-bottom: none;
        }

        tbody tr {
          background: #1b1b1b;
          border-radius: 6px;
          transition: background-color 0.2s ease;
          cursor: default;
          font-weight: 500;
        }

        tbody tr.running {
          /* no glow, just subtle border */
          border-left: 4px solid #0ab5a7;
        }

        tbody tr.stopped {
          border-left: 4px solid #f4637f;
        }

        tbody tr:hover {
          background-color: #222;
        }

        td {
          padding: 8px 10px;
          vertical-align: middle;
          color: #bbb;
          white-space: nowrap;
        }

        /* Server Name */
        .server-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #b7e8e0;
          font-size: 0.9rem;
          overflow: hidden;
        }

        .server-banner {
          width: 36px;
          height: 20px;
          border-radius: 4px;
          object-fit: contain;
          flex-shrink: 0;
        }

        /* Status */
        .status-running {
          color: #0ab5a7;
          font-weight: 700;
        }

        .status-stopped {
          color: #f4637f;
          font-weight: 700;
        }

        /* Actions */
        .actions-cell {
          position: relative;
          text-align: right;
        }

        .manage-button {
          background: #0ab5a7;
          border: none;
          color: #121212;
          font-weight: 600;
          padding: 6px 14px;
          font-size: 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          user-select: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s ease;
        }
        .manage-button:hover,
        .manage-button:focus {
          background: #089d93;
          outline: none;
        }

        .arrow {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-right: 2px solid #121212;
          border-bottom: 2px solid #121212;
          transform: rotate(45deg);
          transition: transform 0.3s ease;
          margin-left: 4px;
        }
        .arrow.open {
          transform: rotate(-135deg);
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          background: #232323;
          border-radius: 6px;
          padding: 6px 0;
          min-width: 160px;
          z-index: 999;
          font-size: 0.85rem;
          box-shadow: 0 4px 6px rgb(0 0 0 / 0.8);
          user-select: none;
        }

        .dropdown-item {
          background: transparent;
          border: none;
          color: #ddd;
          width: 100%;
          text-align: left;
          padding: 8px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dropdown-item:hover:not(:disabled),
        .dropdown-item:focus:not(:disabled) {
          background-color: #0ab5a7;
          color: #121212;
          outline: none;
        }

        .dropdown-item:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dropdown-divider {
          margin: 6px 0;
          border: none;
          border-top: 1px solid #444;
        }

        .dropdown-item.delete {
          color: #f4637f;
          font-weight: 700;
          border-radius: 0 0 6px 6px;
          user-select: none;
        }
        .dropdown-item.delete:hover {
          background-color: #da5a65;
          color: #121212;
        }

        /* Responsive tweaks */
        @media (max-width: 640px) {
          .myservers-container {
            padding: 1rem 1rem;
          }
          h1 {
            font-size: 1.3rem;
          }
          thead th {
            font-size: 0.7rem;
            padding: 6px 8px;
          }
          td {
            font-size: 0.8rem;
            padding: 5px 8px;
          }
          .server-banner {
            width: 30px;
            height: 18px;
          }
          .manage-button {
            padding: 5px 10px;
            font-size: 0.75rem;
          }
          .dropdown-menu {
            min-width: 140px;
          }
        }
      `}</style>
    </div>
  );
};

export default MyServers;
