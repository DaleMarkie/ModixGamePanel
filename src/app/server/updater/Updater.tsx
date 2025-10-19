"use client";

import React, { useState, KeyboardEvent } from "react";
import "./Updater.css";

interface Changelog {
  version: string;
  date: string;
  details: string[];
  tags: string[];
  unavailable?: boolean;
}

const placeholderChangelogs: Changelog[] = [
  {
    version: "v1.1.2",
    date: "2025-06-10",
    tags: ["Updater", "Mods", "UI"],
    details: [
      "This page will be updated in a later update.",
      "It currently does not connect to any API.",
    ],
  },
  {
    version: "v1.1.1",
    date: "2025-05-25",
    tags: ["Updater"],
    details: ["Placeholder entry."],
    unavailable: true,
  },
];

interface ModalProps extends Partial<Changelog> {
  open: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({
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

        <header className="modal-header">
          <h2 id="modal-title">{version ?? "N/A"}</h2>
          <span className="changelog-date">({date ?? "Unknown"})</span>
          {unavailable && <span className="badge-unavailable">Unavailable</span>}
        </header>

        <div className="changelog-tags">
          {tags?.map((tag, idx) => (
            <span key={idx} className="badge-tag">
              {tag}
            </span>
          ))}
        </div>

        <ul id="modal-description" className="changelog-details">
          {details?.map((item, idx) => (
            <li key={idx}>{item}</li>
          )) || <li>No details available</li>}
        </ul>
      </div>
    </div>
  );
};

export default function Updater() {
  const [modalData, setModalData] = useState<Changelog | null>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, changelog: Changelog) => {
    if (e.key === "Enter" || e.key === " ") setModalData(changelog);
  };

  return (
    <div className="updater-container">
      <div className="api-status error">
        ⚠️ This updater page is a placeholder. It will be functional in a later update.
      </div>

      <header className="updater-header">
        <h1>Modix Game Panel Updater</h1>
        <p className="subtitle">
          Current version: <strong>v1.1.2</strong>
        </p>
        <p className="update-status">
          No updates available. This page is under development.
        </p>
      </header>

      <section className="changelog-section">
        <h2>Changelog (Placeholder)</h2>
        <div className="changelog-list">
          {placeholderChangelogs.map((log) => (
            <div
              key={log.version}
              className={`changelog-entry ${log.unavailable ? "disabled" : ""}`}
              onClick={() => !log.unavailable && setModalData(log)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, log)}
              aria-label={`Open changelog details for ${log.version}`}
            >
              <div className="changelog-header">
                <h3>{log.version}</h3>
                <span className="changelog-date">{log.date}</span>
              </div>

              <div className="changelog-tags">
                {log.unavailable && <span className="badge-unavailable">Unavailable</span>}
                {log.tags.map((tag, idx) => (
                  <span key={idx} className="badge-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="changelog-preview">{log.details[0]}...</p>
            </div>
          ))}
        </div>
      </section>

      <Modal
        open={!!modalData}
        onClose={() => setModalData(null)}
        {...(modalData || {})}
      />
    </div>
  );
}
