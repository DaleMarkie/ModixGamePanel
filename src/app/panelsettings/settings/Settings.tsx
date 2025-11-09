"use client";

import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { FaSave, FaSyncAlt } from "react-icons/fa";
import "./Settings.css";

interface PanelSettings {
  headerColor: string;
  textColor: string;
  backgroundColor: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<PanelSettings>({
    headerColor: "#2e7d32",
    textColor: "#ffffff",
    backgroundColor: "#111111",
  });

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch("/api/panelsettings")
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => console.log("No saved settings found"));
  }, []);

  const handleChange = (key: keyof PanelSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/panelsettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving settings.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setPreview(!preview);
    document.documentElement.style.setProperty(
      "--header-color",
      settings.headerColor
    );
    document.documentElement.style.setProperty(
      "--text-color",
      settings.textColor
    );
    document.documentElement.style.setProperty(
      "--bg-color",
      settings.backgroundColor
    );
  };

  return (
    <div className="panel-settings-container">
      <h1 className="settings-title">🎨 Panel Settings</h1>
      <div className="settings-grid">
        <div className="setting-card">
          <h3>Header Color</h3>
          <HexColorPicker
            color={settings.headerColor}
            onChange={(color) => handleChange("headerColor", color)}
          />
          <p>{settings.headerColor}</p>
        </div>

        <div className="setting-card">
          <h3>Text Color</h3>
          <HexColorPicker
            color={settings.textColor}
            onChange={(color) => handleChange("textColor", color)}
          />
          <p>{settings.textColor}</p>
        </div>

        <div className="setting-card">
          <h3>Background Color</h3>
          <HexColorPicker
            color={settings.backgroundColor}
            onChange={(color) => handleChange("backgroundColor", color)}
          />
          <p>{settings.backgroundColor}</p>
        </div>
      </div>

      <div className="settings-actions">
        <button onClick={handleSave} disabled={loading} className="save-btn">
          <FaSave /> {loading ? "Saving..." : "Save Settings"}
        </button>
        <button onClick={handlePreview} className="preview-btn">
          <FaSyncAlt /> {preview ? "Disable Preview" : "Preview Changes"}
        </button>
      </div>

      {preview && (
        <div
          className="preview-box"
          style={{
            backgroundColor: settings.backgroundColor,
            color: settings.textColor,
          }}
        >
          <div
            className="preview-header"
            style={{ backgroundColor: settings.headerColor }}
          >
            Modix Panel Preview
          </div>
          <p>This is how your panel will look with these colors.</p>
        </div>
      )}
    </div>
  );
};

export default Settings;
