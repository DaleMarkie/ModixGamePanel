"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import "./ServerSettings.css";

interface Setting {
  name: string;
  label: string;
  type: "text" | "number" | "checkbox";
  valueType: "string" | "number" | "boolean";
  default: string | number | boolean;
}

interface Category {
  category: string;
  description: string;
  settings: Setting[];
}

export default function ServerSettingsFancy() {
  const [game, setGame] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string | number | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // -------------------
  // Fetch active game first
  // -------------------
  useEffect(() => {
    const fetchActiveGame = async () => {
      try {
        const res = await fetch("/api/active-game");
        if (!res.ok) throw new Error("Failed to get active game");
        const data = await res.json();
        if (data.active_game?.appId) setGame(data.active_game.appId);
        else setGame(""); // fallback if no active game
      } catch (err: any) {
        console.error(err);
        setGame(""); 
      }
    };
    fetchActiveGame();
  }, []);

  // -------------------
  // Fetch schema from backend
  // -------------------
  useEffect(() => {
    if (!game) return;

    const fetchSchema = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/server_settings/schema/${game}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Failed to load server settings");
        }
        const data = await res.json();
        setCategories(data.categories);

        // Initialize settings values
        const init: Record<string, any> = {};
        data.categories.forEach((cat: Category) => {
          cat.settings.forEach((s: Setting) => {
            init[s.name] = s.default;
          });
        });
        setSettings(init);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();
  }, [game]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, type: string, name: string) => {
    let val: string | number | boolean;
    if (type === "checkbox") val = e.target.checked;
    else if (type === "number") val = Number(e.target.value);
    else val = e.target.value;
    setSettings(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    if (!game) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/server_settings/${game}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save settings");
      setMessage("✅ Settings saved successfully!");
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!game) return <p>No active game selected. Please select a game first.</p>;
  if (loading) return <p>Loading settings...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="fancy-wrapper">
      <header>
        <h1>⚙️ {game === "108600" ? "Project Zomboid" : game} Server Settings</h1>
        <p>Editing settings for the active game.</p>
      </header>
      <main>
        {categories.map(cat => (
          <section key={cat.category}>
            <h2>{cat.category}</h2>
            {cat.description && <p>{cat.description}</p>}
            {cat.settings.map(s => (
              <label key={s.name}>
                {s.label}:
                {s.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={!!settings[s.name]}
                    onChange={e => handleChange(e, s.type, s.name)}
                  />
                ) : (
                  <input
                    type={s.type}
                    value={settings[s.name] as string | number}
                    onChange={e => handleChange(e, s.type, s.name)}
                  />
                )}
              </label>
            ))}
          </section>
        ))}
      </main>
      <footer>
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "💾 Save Settings"}
        </button>
        {message && <p>{message}</p>}
      </footer>
    </div>
  );
}
