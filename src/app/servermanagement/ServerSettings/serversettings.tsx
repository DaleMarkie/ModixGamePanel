"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import {
  FaSteam,
  FaDiscord,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaTimes,
  FaUndo,
} from "react-icons/fa";
import "./serversettings.css";

interface SectionSettings {
  [key: string]: string | number | boolean;
}

interface SettingsData {
  [section: string]: SectionSettings;
}

const PROJECT_ZOMBOID = {
  id: "108600",
  name: "Project Zomboid",
  logo: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
  steam: "https://store.steampowered.com/app/108600/Project_Zomboid/",
  discord: "https://discord.com/invite/theindiestone",
};

export default function ServerSettings() {
  const [settings, setSettings] = useState<SettingsData>({});
  const [originalSettings, setOriginalSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [iniFiles, setIniFiles] = useState<string[]>([]);
  const [selectedIni, setSelectedIni] = useState<string>("");
  const [search, setSearch] = useState("");

  // =======================
  // FETCH AVAILABLE INI FILES
  // =======================
  useEffect(() => {
    fetch(`/api/server_settings/list-inis`)
      .then((res) => res.json())
      .then((data: string[]) => {
        setIniFiles(data);
        if (data.length > 0) setSelectedIni(data[0]);
      })
      .catch(() =>
        setMessage({ text: "Failed to list .ini files.", type: "error" })
      );
  }, []);

  // =======================
  // LOAD SELECTED INI SETTINGS
  // =======================
  useEffect(() => {
    if (!selectedIni) return;
    setLoading(true);
    fetch(
      `/api/server_settings/projectzomboid?file=${encodeURIComponent(
        selectedIni
      )}`
    )
      .then((res) => res.json())
      .then((data: SettingsData) => {
        setSettings(data);
        setOriginalSettings(JSON.parse(JSON.stringify(data))); // deep copy
        setOpenSections(
          Object.keys(data).reduce((acc, s) => ({ ...acc, [s]: true }), {})
        );
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setMessage({ text: "Failed to load settings.", type: "error" });
      });
  }, [selectedIni]);

  // =======================
  // HANDLE INPUT CHANGE
  // =======================
  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    section: string,
    key: string
  ) => {
    let value: string | number | boolean = e.target.value;
    if (e.target.type === "checkbox") value = e.target.checked;
    if (e.target.type === "number") value = Number(value);

    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  // =======================
  // UNDO SECTION
  // =======================
  const undoSection = (section: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...originalSettings[section] },
    }));
  };

  // =======================
  // SAVE SETTINGS
  // =======================
  const handleSave = () => {
    if (!selectedIni) return;
    setLoading(true);
    fetch(
      `/api/server_settings/projectzomboid?file=${encodeURIComponent(
        selectedIni
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }
    )
      .then(() => {
        setOriginalSettings(JSON.parse(JSON.stringify(settings))); // update original
        setMessage({ text: "Settings saved successfully!", type: "success" });
        setTimeout(() => setMessage(null), 3000);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ text: "Failed to save settings.", type: "error" });
        setTimeout(() => setMessage(null), 3000);
        setLoading(false);
      });
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // =======================
  // FILTERED SETTINGS
  // =======================
  const filteredSettings: SettingsData = {};
  Object.entries(settings).forEach(([section, keys]) => {
    const filteredKeys = Object.fromEntries(
      Object.entries(keys).filter(([k]) =>
        k.toLowerCase().includes(search.toLowerCase())
      )
    );
    if (Object.keys(filteredKeys).length > 0)
      filteredSettings[section] = filteredKeys;
  });

  // =======================
  // DETERMINE IF VALUE CHANGED
  // =======================
  const isChanged = (section: string, key: string) => {
    return settings[section][key] !== originalSettings[section][key];
  };

  return (
    <div className="server-settings-container">
      <header className="server-header">
        <img
          src={PROJECT_ZOMBOID.logo}
          alt="Project Zomboid"
          className="game-logo"
        />
        <div className="header-info">
          <h1>Project Zomboid Server Settings</h1>
          <p>Edit your servertest.ini easily.</p>
          <div className="header-links">
            <a href={PROJECT_ZOMBOID.steam} target="_blank" rel="noreferrer">
              <FaSteam /> Steam
            </a>
            <a href={PROJECT_ZOMBOID.discord} target="_blank" rel="noreferrer">
              <FaDiscord /> Discord
            </a>
          </div>
        </div>
      </header>

      {/* =======================
          INI FILE SELECT
      ======================= */}
      {iniFiles.length > 0 && (
        <div className="ini-selector">
          <label>Select server config:</label>
          <select
            value={selectedIni}
            onChange={(e) => setSelectedIni(e.target.value)}
          >
            {iniFiles.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* =======================
          SEARCH SETTINGS
      ======================= */}
      <div className="settings-search">
        <input
          type="text"
          placeholder="Search settings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* =======================
          STATUS MESSAGES
      ======================= */}
      {loading && <div className="status loading">Loading settings…</div>}
      {message && (
        <div className={`status message ${message.type}`}>{message.text}</div>
      )}

      {/* =======================
          SETTINGS SECTIONS
      ======================= */}
      {!loading &&
        Object.entries(filteredSettings).map(([section, values]) => (
          <div key={section} className="settings-section">
            <div className="section-header">
              <div onClick={() => toggleSection(section)}>
                <h2>{section}</h2>
                {openSections[section] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              <button
                className="undo-btn"
                onClick={() => undoSection(section)}
                title="Undo changes"
              >
                <FaUndo />
              </button>
            </div>

            {openSections[section] && (
              <div className="section-body">
                {Object.entries(values).map(([key, val]) => {
                  const inputType =
                    typeof val === "boolean"
                      ? "checkbox"
                      : typeof val === "number"
                      ? "number"
                      : "text";
                  return (
                    <div
                      key={key}
                      className={`setting-item ${
                        isChanged(section, key) ? "changed" : ""
                      }`}
                    >
                      <label>{key}</label>
                      {inputType === "checkbox" ? (
                        <input
                          type="checkbox"
                          checked={val as boolean}
                          onChange={(e) => handleChange(e, section, key)}
                        />
                      ) : (
                        <input
                          type={inputType}
                          value={val as string | number}
                          onChange={(e) => handleChange(e, section, key)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

      {/* =======================
          SAVE BUTTON (sticky bottom)
      ======================= */}
      <div className="sticky-save">
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={loading || !selectedIni}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
