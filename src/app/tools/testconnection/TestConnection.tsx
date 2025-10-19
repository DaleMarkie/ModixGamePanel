"use client";
import React from "react";
import { FaClock, FaWindows, FaLinux } from "react-icons/fa";
import "./TestConnection.css";

export default function TestConnectionPage() {
  // Detect OS
  const platform = navigator.platform.toLowerCase();
  const osInfo = platform.includes("win")
    ? { name: "Windows", supported: true }
    : platform.includes("linux")
    ? { name: "Linux", supported: false }
    : { name: platform, supported: false };

  return (
    <main className="test-connection-page">
      <div className="coming-soon-panel">
        <FaClock className="coming-soon-icon" />
        <h1 className="coming-soon-title">🚧 Connection Panel Coming Soon</h1>
        <p className="coming-soon-text">
          The Modix Connection Panel is currently under development. Soon, you'll be able to check your system, network, and Project Zomboid server compatibility directly from here.
        </p>

        <div className={`os-alert ${osInfo.supported ? "supported" : "unsupported"}`}>
          {osInfo.supported ? (
            <><FaWindows /> {osInfo.name} detected — fully supported.</>
          ) : (
            <><FaLinux /> {osInfo.name} detected — Windows recommended. Linux support is experimental.</>
          )}
        </div>

        <p className="coming-soon-note">
          This feature will arrive in a future update. Stay tuned!
        </p>
      </div>
    </main>
  );
}
