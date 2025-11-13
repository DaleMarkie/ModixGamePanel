"use client";

import React, { useEffect, useState } from "react";
import {
  FaPuzzlePiece,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaArrowCircleUp,
} from "react-icons/fa";
import axios from "axios";
import "./ModUpdates.css";

interface ModInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  localVersion: string;
  lastModified: number;
  updated?: boolean;
}

type ErrorCode =
  | "NO_MODS_FOUND"
  | "WORKSHOP_PATH_MISSING"
  | "FAILED_TO_LOAD"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

interface ModUpdatesProps {
  activeGameId: string;
}

export default function ModUpdates({ activeGameId }: ModUpdatesProps) {
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    code: ErrorCode;
    message: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  const BACKEND_URL = "http://127.0.0.1:2010";

  const fetchMods = async () => {
    if (!activeGameId) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/mods/updates?gameId=${activeGameId}`
      );
      const data = response.data.mods || [];

      if (!data.length) {
        throw {
          code: "NO_MODS_FOUND",
          message: "No Workshop mods found for this game.",
        };
      }

      setMods((prev) => {
        return data.map((mod: any) => {
          const lastModified = new Date(mod.localVersion).getTime();
          const prevMod = prev.find((m) => m.id === mod.id);

          // Trigger notification if mod updated
          if (prevMod && prevMod.lastModified !== lastModified) {
            setNotifications((n) => [
              ...n,
              `Mod "${mod.name}" has a new update available!`,
            ]);
          }

          return {
            id: mod.id,
            name: mod.name,
            description: mod.description,
            path: mod.folder,
            localVersion: mod.localVersion,
            lastModified,
            updated: prevMod ? prevMod.lastModified !== lastModified : false,
          };
        });
      });

      setError(null);
    } catch (err: any) {
      console.error("⚠️ ModUpdates Error:", err);
      if (err.response) {
        const status = err.response.status;
        if (status === 404) {
          setError({
            code: "WORKSHOP_PATH_MISSING",
            message: "Workshop folder not found. Verify your Steam path.",
          });
        } else {
          setError({
            code: "FAILED_TO_LOAD",
            message: `Backend returned HTTP ${status}`,
          });
        }
      } else if (err.request) {
        setError({
          code: "NETWORK_ERROR",
          message: `Could not connect to backend at ${BACKEND_URL}. Is it running?`,
        });
      } else if (err.code && err.message) {
        setError(err);
      } else {
        setError({
          code: "UNKNOWN_ERROR",
          message: "Unexpected issue while loading mods.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMods();
    const interval = setInterval(fetchMods, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [activeGameId]);

  const retryLoad = () => window.location.reload();

  return (
    <div className="mod-updates-page">
      {loading && (
        <div className="loading">
          <FaSyncAlt className="spin" />
          <p>Loading Steam Workshop mods...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <FaExclamationTriangle className="error-icon" />
          <h2>Error: {error.code}</h2>
          <p>{error.message}</p>
          <button className="retry-btn" onClick={retryLoad}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <h1 className="page-title">
            <FaPuzzlePiece /> Steam Workshop Mod Updates
          </h1>

          {/* Notification Area */}
          {notifications.length > 0 && (
            <div className="mod-notifications">
              {notifications.map((msg, idx) => (
                <div key={idx} className="notification">
                  <FaArrowCircleUp /> {msg}
                </div>
              ))}
            </div>
          )}

          <div className="mods-grid">
            {mods.map((mod) => (
              <div
                key={mod.id}
                className={`mod-card ${mod.updated ? "updated" : ""}`}
              >
                <div className="mod-header">
                  <h3>{mod.name}</h3>
                  {mod.updated ? (
                    <span className="status-badge update">
                      <FaArrowCircleUp /> Updated!
                    </span>
                  ) : (
                    <span className="status-badge ok">
                      <FaCheckCircle /> Installed
                    </span>
                  )}
                </div>
                <p className="mod-description">{mod.description}</p>
                <div className="version-info">
                  <strong>Local Version:</strong> {mod.localVersion}
                </div>
                <div className="path-info">
                  <strong>Folder:</strong> {mod.path}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
