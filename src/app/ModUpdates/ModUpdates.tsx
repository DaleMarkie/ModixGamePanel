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
  lastModified: number; // timestamp for live detection
}

type ErrorCode =
  | "NO_MODS_FOUND"
  | "WORKSHOP_PATH_MISSING"
  | "FAILED_TO_LOAD"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export default function ModUpdates() {
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    code: ErrorCode;
    message: string;
  } | null>(null);

  const BACKEND_URL = "http://127.0.0.1:2010";

  const fetchMods = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/mods/updates`);
      const data = response.data.mods || [];

      if (!data.length) {
        throw {
          code: "NO_MODS_FOUND",
          message: "No Project Zomboid Workshop mods found locally.",
        };
      }

      setMods((prev) => {
        return data.map((mod: any) => {
          const prevMod = prev.find((m) => m.id === mod.id);
          return {
            id: mod.id,
            name: mod.name,
            description: mod.description,
            path: mod.folder,
            localVersion: mod.localVersion,
            lastModified: new Date(mod.localVersion).getTime(), // or mod.lastModified from backend
            updated: prevMod
              ? prevMod.lastModified !== new Date(mod.localVersion).getTime()
              : false,
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

    // Poll every 15 seconds
    const interval = setInterval(fetchMods, 15000);
    return () => clearInterval(interval);
  }, []);

  const retryLoad = () => window.location.reload();

  if (loading) {
    return (
      <div className="mod-updates-page loading">
        <FaSyncAlt className="spin" />
        <p>Loading Steam Workshop mods...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mod-updates-page error">
        <FaExclamationTriangle className="error-icon" />
        <h2>Error: {error.code}</h2>
        <p>{error.message}</p>
        <button className="retry-btn" onClick={retryLoad}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mod-updates-page">
      <h1 className="page-title">
        <FaPuzzlePiece /> Steam Workshop Mod Updates
      </h1>
      <div className="mods-grid">
        {mods.map((mod) => (
          <div
            key={mod.id}
            className={`mod-card ${mod.updated ? "updated" : ""}`}
          >
            <div className="mod-header">
              <h3>{mod.name}</h3>
              {mod.updated && (
                <span className="status-badge update">
                  <FaArrowCircleUp /> Updated!
                </span>
              )}
              {!mod.updated && (
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
    </div>
  );
}
