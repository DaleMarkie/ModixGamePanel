"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import {
  FaSteam,
  FaDiscord,
  FaChevronDown,
  FaChevronUp,
  FaUndo,
} from "react-icons/fa";
import "./serversettings.css";

interface SectionSettings {
  [key: string]: string | number | boolean;
}

interface SettingsData {
  [section: string]: SectionSettings;
}

/**
 * 🧠 SMART PROJECT ZOMBOID SETTINGS MAP
 * Only known settings get special UI (dropdowns, toggles, etc)
 */
const PZ_SETTING_MAP: Record<
  string,
  Record<
    string,
    {
      type: "boolean" | "number" | "text" | "select";
      options?: string[];
    }
  >
> = {
  SandboxVars: {
    Zombies: { type: "select", options: ["0", "1", "2", "3", "4"] },
    LootRarity: {
      type: "select",
      options: ["VeryRare", "Rare", "Normal", "Abundant"],
    },
    DayLength: { type: "select", options: ["15", "30", "60", "120"] },
    StarterKit: { type: "boolean" },
  },

  Server: {
    Password: { type: "text" },
    Public: { type: "boolean" },
    PauseEmpty: { type: "boolean" },
    MaxPlayers: { type: "number" },
  },
};

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
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [iniFiles, setIniFiles] = useState<string[]>([]);
  const [selectedIni, setSelectedIni] = useState<string>("");
  const [search, setSearch] = useState("");

  // ---------------- LOAD INI LIST ----------------
  useEffect(() => {
    fetch(`/api/server_settings/list-inis`)
      .then((res) => res.json())
      .then((data: string[]) => {
        setIniFiles(data || []);
        if (data?.length) setSelectedIni(data[0]);
      })
      .catch(() =>
        setMessage({ text: "Failed to list .ini files.", type: "error" })
      );
  }, []);

  // ---------------- LOAD FILE ----------------
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
        const safe = data || {};

        setSettings(safe);
        setOriginalSettings(JSON.parse(JSON.stringify(safe)));

        setOpenSections(
          Object.keys(safe).reduce(
            (acc, s) => ({ ...acc, [s]: true }),
            {} as Record<string, boolean>
          )
        );

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setMessage({ text: "Failed to load settings.", type: "error" });
      });
  }, [selectedIni]);

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    section: string,
    key: string
  ) => {
    let value: any = e.target.value;

    if (e.target instanceof HTMLInputElement) {
      if (e.target.type === "checkbox") value = e.target.checked;
      if (e.target.type === "number") value = value === "" ? "" : Number(value);
    }

    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: value,
      },
    }));
  };

  // ---------------- UNDO ----------------
  const undoSection = (section: string) => {
    if (!originalSettings[section]) return;

    setSettings((prev) => ({
      ...prev,
      [section]: JSON.parse(JSON.stringify(originalSettings[section])),
    }));
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    if (!selectedIni) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/server_settings/projectzomboid?file=${encodeURIComponent(
          selectedIni
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        setMessage({ text: "Saved successfully!", type: "success" });
      } else {
        setMessage({
          text: data.error || "Save failed.",
          type: "error",
        });
      }
    } catch {
      setMessage({ text: "Save failed.", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // ---------------- TOGGLE SECTION ----------------
  const toggleSection = (section: string) => {
    setOpenSections((p) => ({ ...p, [section]: !p[section] }));
  };

  // ---------------- SMART FIELD TYPE ----------------
  const getField = (section: string, key: string, value: any) => {
    return (
      PZ_SETTING_MAP?.[section]?.[key] || {
        type:
          typeof value === "boolean"
            ? "boolean"
            : typeof value === "number"
            ? "number"
            : "text",
      }
    );
  };

  // ---------------- FILTER ----------------
  const filtered: SettingsData = {};

  Object.entries(settings || {}).forEach(([section, keys]) => {
    const filteredKeys = Object.fromEntries(
      Object.entries(keys || {}).filter(([k]) =>
        k.toLowerCase().includes(search.toLowerCase())
      )
    );

    if (Object.keys(filteredKeys).length) filtered[section] = filteredKeys;
  });

  // ---------------- CHANGE CHECK ----------------
  const isChanged = (s: string, k: string) =>
    settings?.[s]?.[k] !== originalSettings?.[s]?.[k];

  return (
    <div className="server-settings-container">
      <header className="server-header">
        <img src={PROJECT_ZOMBOID.logo} className="game-logo" />

        <div className="header-info">
          <h1>Project Zomboid Server Settings</h1>
          <p>Edit server INI files</p>

          <div className="header-links">
            <a href={PROJECT_ZOMBOID.steam} target="_blank">
              <FaSteam /> Steam
            </a>
            <a href={PROJECT_ZOMBOID.discord} target="_blank">
              <FaDiscord /> Discord
            </a>
          </div>
        </div>
      </header>

      <div className="ini-selector">
        <select
          value={selectedIni}
          onChange={(e) => setSelectedIni(e.target.value)}
        >
          {iniFiles.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      <input
        placeholder="Search settings..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <div>Loading...</div>}

      {message && <div className={message.type}>{message.text}</div>}

      {!loading &&
        Object.entries(filtered).map(([section, values]) => (
          <div key={section} className="settings-section">
            <div onClick={() => toggleSection(section)}>
              <h2>{section}</h2>
              {openSections[section] ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            <button onClick={() => undoSection(section)}>
              <FaUndo />
            </button>

            {openSections[section] && (
              <div>
                {Object.entries(values).map(([key, val]) => {
                  const field = getField(section, key, val);

                  return (
                    <div
                      key={key}
                      className={isChanged(section, key) ? "changed" : ""}
                    >
                      <label>{key}</label>

                      {field.type === "boolean" ? (
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => handleChange(e, section, key)}
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={val as any}
                          onChange={(e) => handleChange(e, section, key)}
                        >
                          {field.options?.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={val as any}
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

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
