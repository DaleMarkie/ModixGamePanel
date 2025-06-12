import React, { useEffect, useState } from "react";
import {
  FaServer,
  FaCheckCircle,
  FaTimesCircle,
  FaUserFriends,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import "./MyServers.css";

const MyServers = () => {
  const [servers, setServers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [newServer, setNewServer] = useState({
    name: "",
    ip: "",
    status: "Running",
    players: 0,
    image: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setServers([
      {
        id: 1,
        name: "Project Zomboid",
        status: "Running",
        ip: "192.168.0.2",
        players: 3,
        image: "/images/zomboid.jpg",
      },
      {
        id: 2,
        name: "Valheim Server",
        status: "Offline",
        ip: "192.168.0.9",
        players: 0,
        image: "/images/valheim.jpg",
      },
      {
        id: 3,
        name: "Minecraft Server",
        status: "Running",
        ip: "192.168.0.15",
        players: 5,
        image: "/images/minecraft.jpg",
      },
    ]);
  }, []);

  const filteredServers = servers.filter((server) =>
    server.name.toLowerCase().includes(search.toLowerCase())
  );

  const generateId = () =>
    servers.length ? Math.max(...servers.map((s) => s.id)) + 1 : 1;

  const validate = () => {
    const errs = {};
    if (!newServer.name.trim()) errs.name = "Server name is required.";
    if (!newServer.ip.trim()) {
      errs.ip = "IP address is required.";
    } else {
      // Basic IP validation (IPv4 only)
      const ipRegex =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
      if (!ipRegex.test(newServer.ip.trim())) {
        errs.ip = "Invalid IP address format.";
      }
    }
    if (newServer.players < 0)
      errs.players = "Players cannot be negative.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewServer((prev) => ({
      ...prev,
      [name]: name === "players" ? Number(value) : value,
    }));

    // Reset error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAddServer = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setServers((prev) => [
      ...prev,
      {
        ...newServer,
        id: generateId(),
      },
    ]);

    setSuccessMsg(`Server "${newServer.name}" added successfully!`);

    // Reset form
    setNewServer({
      name: "",
      ip: "",
      status: "Running",
      players: 0,
      image: "",
    });

    // Hide form after adding
    setShowForm(false);

    // Clear success message after 3s
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const getStatusIcon = (status) => {
    if (status.toLowerCase() === "running")
      return <FaCheckCircle className="status-icon running" />;
    if (status.toLowerCase() === "offline")
      return <FaTimesCircle className="status-icon offline" />;
    return <FaServer className="status-icon unknown" />;
  };

  return (
    <div className="myservers-page" role="main">
      <h1>My Servers</h1>

      <div className="controls-top">
        <input
          type="search"
          placeholder="Search servers..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search servers"
          spellCheck="false"
        />

        <button
          className={`toggle-form-btn ${showForm ? "active" : ""}`}
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          aria-controls="new-server-form"
        >
          {showForm ? (
            <>
              <FaTimes /> Cancel
            </>
          ) : (
            <>
              <FaPlus /> Add Server
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form
          className="new-server-form"
          onSubmit={handleAddServer}
          id="new-server-form"
          noValidate
          aria-live="polite"
        >
          <div className={`form-group ${errors.name ? "has-error" : ""}`}>
            <input
              type="text"
              name="name"
              id="server-name"
              value={newServer.name}
              onChange={handleInputChange}
              required
              spellCheck="false"
              aria-describedby="name-error"
            />
            <label htmlFor="server-name">Server Name *</label>
            {errors.name && (
              <span className="error-msg" id="name-error" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className={`form-group ${errors.ip ? "has-error" : ""}`}>
            <input
              type="text"
              name="ip"
              id="server-ip"
              value={newServer.ip}
              onChange={handleInputChange}
              required
              spellCheck="false"
              aria-describedby="ip-error"
            />
            <label htmlFor="server-ip">IP Address *</label>
            {errors.ip && (
              <span className="error-msg" id="ip-error" role="alert">
                {errors.ip}
              </span>
            )}
          </div>

          <div className="form-group select-group">
            <label htmlFor="server-status">Status</label>
            <select
              name="status"
              id="server-status"
              value={newServer.status}
              onChange={handleInputChange}
            >
              <option value="Running">Running</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div className={`form-group ${errors.players ? "has-error" : ""}`}>
            <input
              type="number"
              name="players"
              id="server-players"
              min="0"
              value={newServer.players}
              onChange={handleInputChange}
              aria-describedby="players-error"
            />
            <label htmlFor="server-players">Players</label>
            {errors.players && (
              <span className="error-msg" id="players-error" role="alert">
                {errors.players}
              </span>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="image"
              id="server-image"
              value={newServer.image}
              onChange={handleInputChange}
              spellCheck="false"
            />
            <label htmlFor="server-image">Image URL</label>
          </div>

          <button
            type="submit"
            className="add-server-btn"
            disabled={!newServer.name.trim() || !newServer.ip.trim()}
            aria-disabled={!newServer.name.trim() || !newServer.ip.trim()}
          >
            Add Server
          </button>
        </form>
      )}

      {successMsg && <div className="success-message">{successMsg}</div>}

      <div className="server-grid" aria-live="polite">
        {filteredServers.length > 0 ? (
          filteredServers.map((server) => (
            <div
              className="server-card fade-in"
              key={server.id}
              tabIndex={0}
              aria-label={`${server.name} server, ${server.status} status`}
            >
              <div className="server-image-wrapper">
                <img
                  src={server.image || "/images/default-server.jpg"}
                  alt={`${server.name} thumbnail`}
                  className="server-image"
                  loading="lazy"
                />
              </div>

              <div className="server-info">
                <h3 className="server-name">{server.name}</h3>

                <p className="server-ip">
                  <strong>IP:</strong> {server.ip}
                </p>

                <p className="server-players">
                  <FaUserFriends className="players-icon" />
                  {server.players} player{server.players !== 1 ? "s" : ""}
                </p>

                <div className="server-status">
                  {getStatusIcon(server.status)}
                  <span className={`status-tag ${server.status.toLowerCase()}`}>
                    {server.status}
                  </span>
                </div>
              </div>

              <button
                className="manage-btn"
                aria-label={`Manage ${server.name}`}
                tabIndex={0}
              >
                Manage
              </button>
            </div>
          ))
        ) : (
          <p className="no-results">No servers found.</p>
        )}
      </div>
    </div>
  );
};

export default MyServers;
