"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const defaultVars = {
  "--bg-color": "#121212",
  "--card-bg": "#1f1f1f",
  "--card-border": "#333",
  "--highlight": "#4caf50",
  "--disabled": "#555",
  "--main-text": "#eee",
  "--muted-text": "#888",
  "--badge-bg": "#e53935",
  "--text-color": "#eee",
  "--font-family": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  "--font-size": "16px",
};

const pages = [
  { id: "home", name: "Home Page" },
  { id: "dashboard", name: "Dashboard" },
  { id: "profile", name: "Profile" },
];

export default function ThemeManager() {
  const router = useRouter();

  const [selectedPage, setSelectedPage] = useState(pages[0].id);
  const [vars, setVars] = useState<Record<string, string>>(defaultVars);
  const [saved, setSaved] = useState(false);

  // Load saved vars for selected page
  useEffect(() => {
    const savedVars = localStorage.getItem(`themeVars_${selectedPage}`);
    if (savedVars) {
      setVars(JSON.parse(savedVars));
    } else {
      setVars(defaultVars);
    }
    setSaved(false);
  }, [selectedPage]);

  // Apply CSS variables to document (but do NOT save automatically)
  useEffect(() => {
    for (const [key, value] of Object.entries(vars)) {
      document.documentElement.style.setProperty(key, value);
    }
  }, [vars]);

  function handleVarChange(key: string, value: string) {
    setVars((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function resetToDefault() {
    setVars(defaultVars);
    setSaved(false);
  }

  function saveSettings() {
    localStorage.setItem(`themeVars_${selectedPage}`, JSON.stringify(vars));
    setSaved(true);
    router.refresh(); // Refresh page after saving, optional
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main
      className="theme-manager"
      role="main"
      style={{
        maxWidth: 700,
        margin: "2rem auto",
        fontFamily: vars["--font-family"],
        fontSize: vars["--font-size"],
        color: vars["--text-color"],
      }}
    >
      <header
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Theme Manager</h1>
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          style={{
            background: "none",
            border: "1px solid",
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
            color: vars["--highlight"],
          }}
        >
          ← Back
        </button>
      </header>

      <label
        htmlFor="page-select"
        style={{ fontWeight: "600", display: "block", marginBottom: 8 }}
      >
        Select Page to Customize
      </label>
      <select
        id="page-select"
        value={selectedPage}
        onChange={(e) => setSelectedPage(e.target.value)}
        style={{
          padding: 10,
          fontSize: "1rem",
          borderRadius: 6,
          border: `1px solid ${vars["--card-border"]}`,
          marginBottom: 24,
          width: "100%",
          backgroundColor: vars["--card-bg"],
          color: vars["--main-text"],
        }}
      >
        {pages.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>

      <form
        onSubmit={(e) => e.preventDefault()}
        aria-label={`Customize colors for ${
          pages.find((p) => p.id === selectedPage)?.name
        }`}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 32,
        }}
      >
        {Object.entries(vars).map(([key, value]) => {
          const isColor = value.startsWith("#");
          return (
            <div key={key} style={{ display: "flex", flexDirection: "column" }}>
              <label
                htmlFor={key}
                style={{
                  fontWeight: "600",
                  marginBottom: 6,
                  textTransform: "capitalize",
                  color: vars["--highlight"],
                }}
              >
                {key.replace("--", "").replace(/-/g, " ")}
              </label>
              {isColor ? (
                <input
                  type="color"
                  id={key}
                  value={value}
                  onChange={(e) => handleVarChange(key, e.target.value)}
                  style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 6,
                    border: `1px solid ${vars["--card-border"]}`,
                    cursor: "pointer",
                    backgroundColor: vars["--card-bg"],
                  }}
                />
              ) : (
                <input
                  type="text"
                  id={key}
                  value={value}
                  onChange={(e) => handleVarChange(key, e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: `1px solid ${vars["--card-border"]}`,
                    backgroundColor: vars["--card-bg"],
                    color: vars["--main-text"],
                    fontFamily: vars["--font-family"],
                    fontSize: vars["--font-size"],
                  }}
                />
              )}
            </div>
          );
        })}
      </form>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <button
          type="button"
          onClick={saveSettings}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: vars["--highlight"],
            color: vars["--card-bg"],
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Save Settings
        </button>

        <button
          type="button"
          onClick={resetToDefault}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid",
            backgroundColor: "transparent",
            color: vars["--highlight"],
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Reset to Default
        </button>
      </div>

      <section
        aria-label="Live Preview"
        style={{
          padding: 24,
          borderRadius: 12,
          backgroundColor: vars["--card-bg"],
          border: `1px solid ${vars["--card-border"]}`,
          color: vars["--main-text"],
          boxShadow: `0 0 10px ${vars["--highlight"]}55`,
        }}
      >
        <h2 style={{ color: vars["--highlight"], marginBottom: 12 }}>
          Live Preview
        </h2>
        <p>
          This is a live preview of your theme settings for the{" "}
          <strong>{pages.find((p) => p.id === selectedPage)?.name}</strong>.
        </p>
        <button
          style={{
            backgroundColor: vars["--highlight"],
            color: vars["--card-bg"],
            border: "none",
            padding: "10px 20px",
            borderRadius: 6,
            cursor: "pointer",
            marginTop: 16,
            fontWeight: "600",
          }}
        >
          Sample Button
        </button>
      </section>

      {saved && (
        <div
          aria-live="polite"
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#4caf50",
            color: "#fff",
            borderRadius: 8,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Settings saved!
        </div>
      )}
    </main>
  );
}
