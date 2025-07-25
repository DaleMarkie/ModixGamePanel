"use client";

import React, { useState } from "react";
import "./Updater.css";

const changelogs = [
  {
    version: "v1.1.2",
    date: "2025-06-10",
    tags: ["Updater", "Mods", "UI"],
    details: [
      "Improved automatic update process for better reliability.",
      "Fixed minor bugs in mod synchronization.",
      "Updated UI with clearer status messages.",
    ],
  },
  {
    version: "v1.1.1",
    date: "2025-05-25",
    tags: ["Updater"],
    details: ["unstable", "not working", "Optimized download speed."],
    unavailable: true,
  },
];

const Modal = ({
  open,
  onClose,
  version,
  date,
  details,
  tags,
  unavailable,
}) => {
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
          {version} <span className="changelog-date">({date})</span>
        </h2>

        {unavailable && <span className="badge-unavailable">Unavailable</span>}

        <div className="changelog-tags">
          {tags?.map((tag, idx) => (
            <span key={idx} className="badge-tag">
              {tag}
            </span>
          ))}
        </div>

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
          Current version: <strong>v1.1.2</strong>
        </p>
        <p className="update-status">
          You are on the latest version. No updates available.
        </p>
      </header>

      <section className="changelog-section">
        <h2>Changelog</h2>
        {changelogs.map(({ version, date, details, tags, unavailable }) => (
          <div
            key={version}
            className="changelog-entry"
            onClick={() =>
              setModalData({ version, date, details, tags, unavailable })
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setModalData({ version, date, details, tags, unavailable });
              }
            }}
            aria-label={`Open changelog details for ${version}`}
          >
            <h3>
              {version}
              <span className="changelog-date">{date}</span>
            </h3>
            <div className="changelog-tags">
              {unavailable && (
                <span className="badge-unavailable">Unavailable</span>
              )}
              {tags?.map((tag, idx) => (
                <span key={idx} className="badge-tag">
                  {tag}
                </span>
              ))}
            </div>
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
