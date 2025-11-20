"use client";

import React, { useEffect, useState } from "react";
import {
  FaCodeBranch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

export default function CommitStatusUnderLogin({ localCommit = "34d5f95" }) {
  const [latestCommit, setLatestCommit] = useState("");
  const [commitsBehind, setCommitsBehind] = useState(0);
  const [fullyUpdated, setFullyUpdated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const fetchCommitInfo = async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch latest commit SHA
      const latestRes = await fetch(
        "https://api.github.com/repos/DaleMarkie/ModixGamePanel/commits/main"
      );
      const latestData = await latestRes.json();
      const latestSHA = latestData.sha?.substring(0, 7);
      if (!latestSHA) throw new Error("No latest SHA found");
      setLatestCommit(latestSHA);

      // Check fully updated
      setFullyUpdated(localCommit === latestSHA);

      // Compare to see how many behind
      if (localCommit !== latestSHA) {
        try {
          const compareRes = await fetch(
            `https://api.github.com/repos/DaleMarkie/ModixGamePanel/compare/${localCommit}...${latestSHA}`
          );
          const compareData = await compareRes.json();
          setCommitsBehind(compareData.behind_by ?? -1);
        } catch {
          setCommitsBehind(-1);
        }
      } else {
        setCommitsBehind(0);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCommitInfo();
    const interval = setInterval(fetchCommitInfo, 60000);
    return () => clearInterval(interval);
  }, []);

  const commitBaseURL = "https://github.com/DaleMarkie/ModixGamePanel/commit/";

  return (
    <div style={{ marginTop: "6px", fontFamily: "Segoe UI, sans-serif" }}>
      <div
        style={{
          padding: "6px 10px",
          backgroundColor: "#1e1e1e",
          borderRadius: "6px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          fontSize: "12px",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FaCodeBranch color="#4cafef" />
          <span style={{ color: "#ccc" }}>Commit Status</span>
        </div>

        {loading ? (
          <span style={{ color: "#888" }}>Loading...</span>
        ) : error ? (
          <span style={{ color: "#f66" }}>Error</span>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {fullyUpdated ? (
                <span
                  style={{
                    backgroundColor: "#4cafef",
                    color: "#fff",
                    padding: "2px 6px",
                    borderRadius: "12px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <FaCheckCircle /> Up-to-date
                </span>
              ) : (
                <span
                  style={{
                    backgroundColor: "#ffb74d",
                    color: "#000",
                    padding: "2px 6px",
                    borderRadius: "12px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <FaExclamationTriangle />{" "}
                  {commitsBehind > 0 ? `${commitsBehind} behind` : "Outdated"}
                </span>
              )}
            </span>
            {collapsed ? (
              <FaChevronDown color="#888" />
            ) : (
              <FaChevronUp color="#888" />
            )}
          </div>
        )}
      </div>

      {!collapsed && !loading && !error && (
        <div
          style={{
            padding: "6px 10px",
            backgroundColor: "#222",
            borderRadius: "6px",
            marginTop: "4px",
            fontSize: "11px",
            color: "#ccc",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <div>
            <strong>Local:</strong>{" "}
            <a
              href={`${commitBaseURL}${localCommit}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4cafef", textDecoration: "underline" }}
            >
              {localCommit}
            </a>
          </div>
          <div>
            <strong>Latest:</strong>{" "}
            <a
              href={`${commitBaseURL}${latestCommit}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4cafef", textDecoration: "underline" }}
            >
              {latestCommit}
            </a>
          </div>
          <div>
            <strong>Status:</strong>{" "}
            {fullyUpdated
              ? "Fully Updated"
              : commitsBehind === -1
              ? "Unknown (local commit not in remote)"
              : `${commitsBehind} commit(s) behind`}
          </div>
        </div>
      )}
    </div>
  );
}
