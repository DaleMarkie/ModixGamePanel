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
            <strong className="brand">Modix</strong> has been inactive for the
            past 6 months due to life circumstances and burnout. Development
            lost focus for a while but that changes now. Updates will start
            rolling out again.
          </p>

          <p className="intro-subtext">
            I’m back and actively developing again. This is a
            <span className="highlight"> large scale project</span>, and
            progress will now be consistent moving forward.
          </p>

          <div className="update-info">
            <p>
              ⚠️ Right now, <strong>everything is under development</strong>.
              The panel is being rebuilt and improved from the ground up.
            </p>
            <p>
              🐧 Initial support will be <strong>Linux only</strong>, as it’s
              much easier to develop and maintain. Windows support will come
              after.
            </p>
            <p>
              I know I’ve said "it’s coming" before and not delivered. This
              project is massive, and I burned out but I’m back now and fully
              committed to it.
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
            <p className="no-logs">
              This is mostly sololy created by DaleMarkie aka OV3RLORD. Thanks
              for checking out Modix.
            </p>
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
