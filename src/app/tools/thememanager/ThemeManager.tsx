"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const themeVariablesMap: Record<string, Record<string, string>> = {
  default: {
    "--bg-color": "#0e0e0e",
    "--card-bg": "#1b1b1b",
    "--card-border": "#2a2a2a",
    "--highlight": "#4caf50",
    "--disabled": "#444",
    "--main-text": "#f0f0f0",
    "--muted-text": "#999",
    "--badge-bg": "#e53935",
    "--text-color": "#f0f0f0",
  },
  dark: {
    "--bg-color": "#121212",
    "--card-bg": "#1e1e1e",
    "--card-border": "#333",
    "--highlight": "#81c784",
    "--disabled": "#555",
    "--main-text": "#e0e0e0",
    "--muted-text": "#bbb",
    "--badge-bg": "#d32f2f",
    "--text-color": "#e0e0e0",
  },
  light: {
    "--bg-color": "#fafafa",
    "--card-bg": "#fff",
    "--card-border": "#ddd",
    "--highlight": "#4caf50",
    "--disabled": "#ccc",
    "--main-text": "#222",
    "--muted-text": "#666",
    "--badge-bg": "#e53935",
    "--text-color": "#222",
  },
  neon: {
    "--bg-color": "#000",
    "--card-bg": "#111",
    "--card-border": "#0ff",
    "--highlight": "#0ff",
    "--disabled": "#088",
    "--main-text": "#0ff",
    "--muted-text": "#044",
    "--badge-bg": "#f0f",
    "--text-color": "#0ff",
  },
};

const themes = [
  {
    id: "default",
    name: "Default Theme",
    description: "Classic familiar look.",
    enabled: true,
  },
  {
    id: "dark",
    name: "Dark Theme",
    description: "Easy on the eyes, all dark.",
    enabled: true,
  },
  {
    id: "light",
    name: "Light Theme",
    description: "Clean and bright interface.",
    enabled: true,
  },
  {
    id: "neon",
    name: "Neon Glow",
    description: "Bold colors, minimal distraction.",
    enabled: true,
  },
];

// Helper to generate random color for custom theme randomize
const randomColor = () =>
  "#" +
  Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");

const defaultCustomTheme = {
  "--bg-color": "#222222",
  "--card-bg": "#333333",
  "--card-border": "#444444",
  "--highlight": "#4caf50",
  "--disabled": "#555555",
  "--main-text": "#e0e0e0",
  "--muted-text": "#999999",
  "--badge-bg": "#e53935",
  "--text-color": "#e0e0e0",
};

const ThemeManager = () => {
  const router = useRouter();

  const [selectedThemeId, setSelectedThemeId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedTheme") || "default";
    }
    return "default";
  });

  // State for custom theme editing
  const [customThemeVars, setCustomThemeVars] = useState<
    Record<string, string>
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("customThemeVars");
      return saved ? JSON.parse(saved) : defaultCustomTheme;
    }
    return defaultCustomTheme;
  });

  // Detect if selected theme is custom
  const isCustomTheme = selectedThemeId === "custom";

  // Apply the CSS variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Clear all previous theme variables
    Object.values(themeVariablesMap).forEach((vars) => {
      Object.keys(vars).forEach((key) => root.style.removeProperty(key));
    });
    Object.keys(defaultCustomTheme).forEach((key) =>
      root.style.removeProperty(key)
    );

    // Apply either preset or custom variables
    const vars = isCustomTheme
      ? customThemeVars
      : themeVariablesMap[selectedThemeId];
    if (vars) {
      Object.entries(vars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    }

    // Save theme selection and custom vars locally
    localStorage.setItem("selectedTheme", selectedThemeId);
    if (isCustomTheme) {
      localStorage.setItem("customThemeVars", JSON.stringify(customThemeVars));
    }
  }, [selectedThemeId, customThemeVars, isCustomTheme]);

  const selectedTheme = isCustomTheme
    ? {
        id: "custom",
        name: "Custom Theme",
        description: "Your personalized style",
        enabled: true,
      }
    : themes.find((t) => t.id === selectedThemeId);

  // Handle color change for custom theme inputs
  function handleCustomColorChange(varName: string, value: string) {
    setCustomThemeVars((prev) => ({ ...prev, [varName]: value }));
  }

  // Reset custom theme to default
  function resetCustomTheme() {
    setCustomThemeVars(defaultCustomTheme);
  }

  // Randomize custom theme colors
  function randomizeCustomTheme() {
    const randomized = Object.keys(defaultCustomTheme).reduce((acc, key) => {
      acc[key] = randomColor();
      return acc;
    }, {} as Record<string, string>);
    setCustomThemeVars(randomized);
  }

  return (
    <main
      className="theme-manager"
      style={{
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: "var(--bg-color)",
        color: "var(--main-text)",
      }}
    >
      <header
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Pick your theme</h1>
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          style={{
            cursor: "pointer",
            border: "none",
            background: "var(--highlight)",
            color: "#000",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#388e3c")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--highlight)")
          }
        >
          ← Back
        </button>
      </header>

      <section
        aria-label="Available themes"
        role="list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {themes
          .concat([
            {
              id: "custom",
              name: "Custom Theme",
              description: "Create your own style",
              enabled: true,
            },
          ])
          .map((theme) => {
            const isSelected = selectedThemeId === theme.id;

            return (
              <article
                key={theme.id}
                role={theme.enabled ? "listitem" : "presentation"}
                tabIndex={theme.enabled ? 0 : -1}
                aria-pressed={isSelected}
                aria-disabled={!theme.enabled}
                onClick={() => theme.enabled && setSelectedThemeId(theme.id)}
                onKeyDown={(e) => {
                  if (theme.enabled && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setSelectedThemeId(theme.id);
                  }
                }}
                className={`theme-card${isSelected ? " selected" : ""}`}
                style={{
                  cursor: theme.enabled ? "pointer" : "not-allowed",
                  border: isSelected
                    ? `3px solid var(--highlight)`
                    : `2px solid var(--card-border)`,
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: "var(--card-bg)",
                  boxShadow: isSelected
                    ? "0 8px 20px rgba(76,175,80,0.4)"
                    : "0 2px 8px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  outline: "none",
                }}
              >
                {/* Color swatch preview */}
                <div
                  aria-hidden="true"
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  {(theme.id === "custom"
                    ? Object.entries(customThemeVars)
                    : Object.entries(themeVariablesMap[theme.id] || {})
                  )
                    .filter(
                      ([key]) => key.includes("color") || key.includes("bg")
                    )
                    .slice(0, 5)
                    .map(([key, color]) => (
                      <div
                        key={key}
                        style={{
                          backgroundColor: color,
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border: "1px solid #333",
                        }}
                        title={key}
                      />
                    ))}
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontWeight: "700",
                    color: isSelected ? "var(--highlight)" : "var(--main-text)",
                    textAlign: "center",
                    userSelect: "none",
                  }}
                >
                  {theme.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "var(--muted-text)",
                    textAlign: "center",
                    userSelect: "none",
                  }}
                >
                  {theme.description}
                </p>

                {!theme.enabled && (
                  <div
                    aria-label="Coming Soon"
                    style={{
                      marginTop: "auto",
                      color: "#f44336",
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      userSelect: "none",
                    }}
                  >
                    Coming Soon
                  </div>
                )}
              </article>
            );
          })}
      </section>

      {/* Custom theme editor if selected */}
      {isCustomTheme && (
        <section
          aria-label="Custom theme editor"
          style={{
            marginBottom: 32,
            backgroundColor: "var(--card-bg)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <h2 style={{ marginBottom: 16, color: "var(--highlight)" }}>
            Customize Your Theme
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 20,
            }}
          >
            {Object.entries(customThemeVars).map(([varName, value]) => (
              <label
                key={varName}
                htmlFor={varName}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: 14,
                  color: "var(--main-text)",
                }}
              >
                <span
                  style={{
                    marginBottom: 4,
                    fontWeight: "600",
                    userSelect: "none",
                  }}
                >
                  {varName.replace("--", "").replace(/-/g, " ").toUpperCase()}
                </span>
                <input
                  id={varName}
                  type="color"
                  value={value}
                  onChange={(e) =>
                    handleCustomColorChange(varName, e.target.value)
                  }
                  style={{
                    width: "100%",
                    height: 36,
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    padding: 0,
                  }}
                  aria-label={`Choose color for ${varName}`}
                />
              </label>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <button
              onClick={resetCustomTheme}
              style={{
                backgroundColor: "var(--badge-bg)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0.5rem 1.2rem",
                cursor: "pointer",
                fontWeight: "600",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#b71c1c")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--badge-bg)")
              }
            >
              Reset
            </button>
            <button
              onClick={randomizeCustomTheme}
              style={{
                backgroundColor: "var(--highlight)",
                color: "#000",
                border: "none",
                borderRadius: 8,
                padding: "0.5rem 1.2rem",
                cursor: "pointer",
                fontWeight: "600",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#388e3c")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--highlight)")
              }
            >
              Randomize
            </button>
          </div>
        </section>
      )}

      <footer style={{ textAlign: "center" }}>
        <button
          onClick={() =>
            alert(`Theme "${selectedTheme?.name}" is already applied.`)
          }
          disabled={!selectedTheme?.enabled}
          aria-disabled={!selectedTheme?.enabled}
          style={{
            backgroundColor: selectedTheme?.enabled
              ? "var(--highlight)"
              : "var(--disabled)",
            color: selectedTheme?.enabled ? "#000" : "#666",
            border: "none",
            borderRadius: 10,
            padding: "1rem 3rem",
            fontSize: "1.2rem",
            fontWeight: "bold",
            cursor: selectedTheme?.enabled ? "pointer" : "not-allowed",
            transition: "background-color 0.3s",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            if (selectedTheme?.enabled)
              e.currentTarget.style.backgroundColor = "#388e3c";
          }}
          onMouseLeave={(e) => {
            if (selectedTheme?.enabled)
              e.currentTarget.style.backgroundColor = "var(--highlight)";
          }}
        >
          Apply Theme
        </button>
      </footer>

      <style jsx>{`
        .theme-card:focus {
          outline: 3px solid var(--highlight);
          outline-offset: 2px;
        }
        .theme-card:hover {
          box-shadow: 0 12px 28px rgba(76, 175, 80, 0.5);
          transform: translateY(-4px);
          transition: all 0.3s ease;
        }
        .theme-card.selected {
          box-shadow: 0 12px 28px rgba(76, 175, 80, 0.8);
          transform: translateY(-6px);
        }
      `}</style>
    </main>
  );
};

export default ThemeManager;
