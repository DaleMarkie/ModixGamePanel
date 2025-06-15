import React, { useState, useEffect, useRef } from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: "#121212",
  borderRadius: 12,
  padding: 24,
  minWidth: 400,
  maxWidth: "90vw",
  color: "#00FF00",
  fontFamily: "'Courier New', Courier, monospace",
  boxShadow: "0 0 20px #00FF00aa",
  display: "flex",
  flexDirection: "column",
};

const terminalStyle = {
  backgroundColor: "#000",
  borderRadius: 8,
  padding: 16,
  height: 200,
  overflowY: "auto",
  fontSize: 14,
  lineHeight: 1.4,
  marginTop: 12,
  whiteSpace: "pre-wrap",
};

const buttonRowStyle = {
  marginTop: 20,
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

const buttonStyle = {
  padding: "10px 18px",
  borderRadius: 6,
  border: "none",
  fontWeight: "600",
  cursor: "pointer",
};

const downloadButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#1DB954",
  color: "black",
};

const closeButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#555",
  color: "white",
};

function DownloadMod({ mod, onClose }) {
  const [logs, setLogs] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const terminalRef = useRef(null);

  // Compose Steam Workshop URL based on mod.id
  const workshopUrl = mod?.id
    ? `https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.id}`
    : "Unknown Mod ID";

  // Fake logs to simulate download progress including mod URL
  const fakeLogs = [
    `Starting download for mod "${mod?.name || "Unknown Mod"}"...`,
    `Using Steam Workshop URL: ${workshopUrl}`,
    "Connecting to SteamCMD...",
    "Fetching mod data...",
    "Downloading files...",
    "Extracting content...",
    "Finalizing installation...",
    "Download complete! 🎉",
  ];

  // Simulate log output line-by-line
  useEffect(() => {
    if (!downloading) return;

    let lineIndex = 0;
    const interval = setInterval(() => {
      setLogs((prev) => [...prev, fakeLogs[lineIndex]]);
      lineIndex++;

      if (lineIndex >= fakeLogs.length) {
        clearInterval(interval);
        setDownloading(false);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [downloading]);

  // Auto-scroll terminal to bottom on new log
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: "#1DB954" }}>Download Mod</h2>
        <p>
          Downloading mod:{" "}
          <strong style={{ color: "white" }}>{mod?.name || "Unknown Mod"}</strong>
        </p>
        <p style={{ fontSize: 12, color: "#888" }}>
          Workshop URL:{" "}
          <a href={workshopUrl} target="_blank" rel="noreferrer" style={{ color: "#1DB954" }}>
            {workshopUrl}
          </a>
        </p>

        <div style={terminalStyle} ref={terminalRef}>
          {logs.length === 0 ? (
            <span style={{ color: "#555" }}>Click "Download" to start...</span>
          ) : (
            logs.map((line, i) => <div key={i}>{line}</div>)
          )}
        </div>

        <div style={buttonRowStyle}>
          <button
            style={downloadButtonStyle}
            onClick={() => {
              if (!downloading) {
                setLogs([]);
                setDownloading(true);
              }
            }}
            disabled={downloading}
          >
            {downloading ? "Downloading..." : "Download"}
          </button>
          <button style={closeButtonStyle} onClick={onClose} disabled={downloading}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DownloadMod;
