"use client";

import React from "react";

interface ModUpdate {
  modId: string;
  modName: string;
  lastWorkshopUpdate?: string;
  currentVersion?: string;
  description?: string;
}

function formatDate(iso?: string) {
  if (!iso) return "Unknown";
  const date = new Date(iso);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

interface ModUpdatesProps {
  updates?: ModUpdate[];
  onClose: () => void; // Added close prop
}

export default function ModUpdates({ updates = [], onClose }: ModUpdatesProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#1b1b1b",
          borderRadius: "12px",
          width: "95%",
          maxWidth: "1300px",
          height: "85%",
          padding: "20px",
          overflowY: "auto",
          boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#ff4d4f",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            padding: "6px 12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ✖ Close
        </button>

        <h2 style={{ marginBottom: "20px", color: "#9efc9e", fontSize: "24px" }}>
          Installed Mod Updates
        </h2>

        {updates.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "900px",
                borderCollapse: "collapse",
                fontSize: "14px",
                color: "#ddd",
              }}
            >
              <thead>
                <tr style={{ background: "#222" }}>
                  <th style={{ borderBottom: "2px solid #3a3a3a", padding: "12px", textAlign: "left" }}>Mod Name</th>
                  <th style={{ borderBottom: "2px solid #3a3a3a", padding: "12px", textAlign: "left" }}>Last Workshop Update</th>
                  <th style={{ borderBottom: "2px solid #3a3a3a", padding: "12px", textAlign: "left" }}>Version</th>
                  <th style={{ borderBottom: "2px solid #3a3a3a", padding: "12px", textAlign: "left" }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((mod, idx) => (
                  <tr
                    key={mod.modId}
                    style={{
                      background: idx % 2 === 0 ? "#1f1f1f" : "#262626",
                      transition: "background 0.2s",
                    }}
                  >
                    <td style={{ padding: "12px", fontWeight: 500, color: "#fff" }}>{mod.modName}</td>
                    <td style={{ padding: "12px" }}>
                      <div>{formatDate(mod.lastWorkshopUpdate)}</div>
                      <div style={{ fontSize: "12px", color: "#8f8f8f" }}>{timeAgo(mod.lastWorkshopUpdate)}</div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {mod.currentVersion ? (
                        <span
                          style={{
                            background: "#2e7d32",
                            color: "#fff",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {mod.currentVersion}
                        </span>
                      ) : (
                        <span style={{ color: "#999" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: "12px", color: "#bbb" }}>{mod.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#aaa",
              background: "#222",
              borderRadius: "10px",
              marginTop: "20px",
            }}
          >
            <p style={{ fontSize: "16px" }}>📭 No installed mods have updates right now.</p>
            <p style={{ fontSize: "13px", marginTop: "5px" }}>
              Installed mods will appear here automatically when updates are available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
