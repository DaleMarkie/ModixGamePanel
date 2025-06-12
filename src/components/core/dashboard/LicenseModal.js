import React, { useEffect } from "react";
import "./LicenseModal.css";

const LicenseModal = ({ onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="document">
        <h2 id="modal-title" className="modal-title">📜 License & Project Info</h2>
        <div className="modal-body">
          <p>
            This software is developed solely for managing <strong>Project Zomboid</strong> servers.
            It is provided free for personal use and learning purposes.
          </p>
          <p>
            Commercial redistribution or selling of this software is prohibited without explicit permission.
          </p>
          <p>For more information and support, visit:</p>
          <ul>
            <li>
              📘{" "}
              <a href="https://modixpanel.com/docs" target="_blank" rel="noopener noreferrer" className="modal-link">
                Documentation
              </a>
            </li>
            <li>
              📨{" "}
              <a href="https://modixpanel.com/support" target="_blank" rel="noopener noreferrer" className="modal-link">
                Support Tickets
              </a>
            </li>
            <li>
              📞{" "}
              <a href="https://modixpanel.com/contact" target="_blank" rel="noopener noreferrer" className="modal-link">
                Contact Support
              </a>
            </li>
          </ul>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#ccc" }}>
            © 2024 - 2025 Modix Game Panel - All rights reserved.
          </p>
        </div>
        <button className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default LicenseModal;
