"use client";

import "./welcome-popup.css";

interface WelcomePopupProps {
  username: string;
  logs?: { date: string; event: string }[];
  onClose: () => void;
}

const WelcomePopup = ({ username, logs = [], onClose }: WelcomePopupProps) => {
  return (
    <div className="welcome-popup-overlay">
      <div className="welcome-popup-card">
        <header className="welcome-popup-header">
          <h2>👋 Welcome back, {username}!</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </header>

        <section className="welcome-popup-body">
          <p className="intro-text">
            <strong className="brand">Modix</strong> is an evolving project that’s{" "}
            <span className="highlight">actively being developed</span> by{" "}
            <span className="team">OV3RLORD</span> &{" "}
            <span className="team">GameSmithOnline</span>.
          </p>

          <p className="intro-subtext">
            Our goal is simple — to build the <span className="highlight">perfect game panel</span>:
            sleek, powerful, and made for <span className="pz-highlight">Project Zomboid</span>, with
            future support planned for other titles.
          </p>

          <div className="update-info">
            <p>
              🧩 We’re constantly improving Modix — fixing bugs, optimizing systems, and adding
              new features that make managing your server smoother than ever.
            </p>
            <p>
              You can always check out the latest progress on the{" "}
              <a
                href="https://5mllc2-3000.csb.app/server/updater"
                target="_blank"
                rel="noopener noreferrer"
                className="changelog-link"
              >
                📜 Change Logs
              </a>{" "}
              page.
            </p>
          </div>

          {logs.length ? (
            <>
              <h3 className="update-header">🆕 Recent Local Updates</h3>
              <ul className="welcome-logs">
                {logs.map((log, idx) => (
                  <li key={idx}>
                    <span className="log-date">
                      {new Date(log.date).toLocaleString()}
                    </span>{" "}
                    - <span className="log-event">{log.event}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="no-logs">By using Modix: Game Panel you agree to the terms of use.</p>
          )}
        </section>

        <footer className="welcome-popup-footer">
          <button className="close-footer-btn" onClick={onClose}>
            Continue to Panel 🚀
          </button>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePopup;
