"use client";

import React, { useState, useEffect, KeyboardEvent } from "react";
import "./Updater.css";

interface Changelog {
  version: string;
  date: string;
  details: string[];
  tags: string[];
  unavailable?: boolean;
}

const fallbackChangelogs: Changelog[] = [
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
        <h2 id="modal-title">
          {version ?? "N/A"}{" "}
          <span className="changelog-date">({date ?? "Unknown"})</span>
        </h2>

        {unavailable && <span className="badge-unavailable">Unavailable</span>}

        <div className="changelog-tags">
          {tags?.map((tag: string, idx: number) => (
            <span key={idx} className="badge-tag">
              {tag}
            </span>
          ))}
        </div>

        <ul id="modal-description">
          {details?.map((item: string, idx: number) => (
            <li key={idx}>{item}</li>
          )) || <li>No details available</li>}
        </ul>
      </div>
    </div>
  );
};

export default function Updater() {
  const [modalData, setModalData] = useState<Changelog | null>(null);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [apiStatus, setApiStatus] = useState<"loading" | "connected" | "error">(
    "loading"
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    fetch("http://localhost:8000/api/changelog", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Bad response code");
        return res.json();
      })
      .then((data: Changelog[]) => {
        if (!Array.isArray(data)) throw new Error("Invalid response format");
        setChangelogs(data);
        setApiStatus("connected");
      })
      .catch((err) => {
        console.error("API failed:", err.message);
        setChangelogs(fallbackChangelogs);
        setApiStatus("error");
      });

    return () => clearTimeout(timeoutId);
  }, []);

  const handleKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    changelog: Changelog
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      setModalData(changelog);
    }
  };

  return (
    <div className="updater-container">
      <div className={`api-status ${apiStatus}`}>
        {apiStatus === "loading" && "🔄 Connecting to API..."}
        {apiStatus === "connected" && "✅ API Connected"}
        {apiStatus === "error" && "❌ API Connection Failed - Using fallback"}
      </div>

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
        {changelogs.map((changelog) => (
          <div
            key={changelog.version}
            className="changelog-entry"
            onClick={() => setModalData(changelog)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, changelog)}
            aria-label={`Open changelog details for ${changelog.version}`}
          >
            <h3>
              {changelog.version}
              <span className="changelog-date">{changelog.date}</span>
            </h3>
            <div className="changelog-tags">
              {changelog.unavailable && (
                <span className="badge-unavailable">Unavailable</span>
              )}
              {changelog.tags?.map((tag: string, idx: number) => (
                <span key={idx} className="badge-tag">
                  {tag}
                </span>
              ))}
            </div>
            <p>{changelog.details[0]}...</p>
          </div>
        ))}
      </section>

      <Modal
        open={!!modalData}
        onClose={() => setModalData(null)}
        {...(modalData || {})}
      />
    </div>
  );
}
