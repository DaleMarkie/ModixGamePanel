"use client";

import React, { useState } from "react";
import "./Updater.css";

const changelogs = [
  {
    version: "v1.2.3",
    date: "2025-06-10",
    details: [
      "Improved automatic update process for better reliability.",
      "Fixed minor bugs in mod synchronization.",
      "Updated UI with clearer status messages.",
    ],
  },
  {
    version: "v1.2.2",
    date: "2025-05-25",
    details: [
      "Added manual update button.",
      "Fixed issue with GitHub link.",
      "Optimized download speed.",
    ],
  },
  // Add more changelog entries here as needed
];

const Modal = ({ open, onClose, version, date, details }) => {
  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 id="modal-title">
          {version} - <span className="changelog-date">{date}</span>
        </h2>
        <ul id="modal-description">
          {details.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function Updater() {
  const [modalData, setModalData] = useState(null);

  return (
    <div className="updater-container">
      <header className="updater-header">
        <h1>Modix Game Panel Updater</h1>
        <p className="subtitle">
          Keep your panel up to date with the latest features and fixes.
        </p>
      </header>

      <section className="updater-buttons">
        <button
          className="download-button"
          onClick={() =>
            window.open(
              "https://example.com/modix-game-panel-download",
              "_blank"
            )
          }
        >
          Download Latest
        </button>
        <div className="external-links">
          <button
            onClick={() =>
              window.open(
                "https://github.com/yourrepo/modix-game-panel",
                "_blank"
              )
            }
            aria-label="Go to GitHub repository"
          >
            GitHub
          </button>
          <button
            onClick={() =>
              window.open("https://discord.gg/yourdiscord", "_blank")
            }
            aria-label="Join Discord server"
          >
            Discord
          </button>
        </div>
      </section>

      <section className="changelog-section">
        <h2>Changelog</h2>
        {changelogs.map(({ version, date, details }) => (
          <div
            key={version}
            className="changelog-entry"
            onClick={() => setModalData({ version, date, details })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setModalData({ version, date, details });
              }
            }}
            aria-label={`Open changelog details for ${version}`}
          >
            <h3>
              {version} <span className="changelog-date">{date}</span>
            </h3>
            <p>{details[0]}...</p>
          </div>
        ))}
      </section>

      <Modal
        open={!!modalData}
        onClose={() => setModalData(null)}
        {...modalData}
      />
    </div>
  );
}
