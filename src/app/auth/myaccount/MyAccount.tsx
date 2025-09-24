import { useState, useEffect, Suspense, lazy } from "react";
import "./MyAccount.css";
import Subscriptions from "../subscriptions/subscriptions";
import Activity from "../activity/Activity";
import MyTickets from "../../support/mytickets/MyTickets";
import WelcomePopup from "./welcome/welcome-popup";
import { getServerUrl } from "@/app/config"; // centralized config

const Settings = lazy(() => import("./settings/mySettings"));

const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    className={`tab ${active ? "active" : ""}`}
    onClick={onClick}
    aria-current={active ? "page" : undefined}
  >
    {label}
  </button>
);

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("📊 Dashboard");
  const [user, setUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("modix_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setShowWelcome(true);
      } catch {
        localStorage.removeItem("modix_user");
      }
    }
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("modix_token");
        const res = await fetch(`${getServerUrl()}/api/auth/logs`, {
          headers: { Authorization: token || "" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUserLogs(data.logs || []);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };
    if (user) fetchLogs();
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch(`${getServerUrl()}/api/auth/logout`, { method: "POST" });
    } catch {}
    localStorage.removeItem("modix_user");
    localStorage.removeItem("modix_token");
    window.location.href = "/auth/login";
  };

  if (!user)
    return <div className="not-logged">Please log in to access your account.</div>;

  const tabs = [
    "📊 Dashboard",
    "🔐 Security",
    "📜 Activity",
    "🪪 Subscriptions",
    "⚙️ Settings",
    "🛠️ Support",
  ];

  return (
    <div className="myaccount-container">
      <header className="account-header">
        <h1>⚙️ My Account</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      <nav className="tabs" aria-label="Account navigation">
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            label={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </nav>

      {activeTab === "📊 Dashboard" && (
        <>
          <section className="dashboard-user-info">
            {[
              { icon: "fas fa-user", label: "Username", value: user.username },
              { icon: "fas fa-envelope", label: "Email", value: user.email || "N/A" },
              {
                icon: "fas fa-circle",
                label: "Status",
                value: user.active ? "Active ✅" : "Inactive ❌",
                className: user.active ? "status-active" : "status-inactive",
              },
              {
                icon: "fas fa-calendar-plus",
                label: "Joined",
                value: new Date(user.created_at).toLocaleDateString(),
              },
              {
                icon: "fas fa-clock",
                label: "Last Login",
                value: new Date(user.last_login).toLocaleString(),
              },
            ].map((info, idx) => (
              <div key={idx} className="info-card">
                <i className={info.icon}></i>
                <div className="info-details">
                  <span className={`info-value ${info.className || ""}`}>
                    {info.value}
                  </span>
                  <span className="info-label">{info.label}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Row with 3 boxes */}
          <section className="dashboard-row">
            {/* Last Logins */}
            <div className="dashboard-card">
              <h3>📝 Last Logins (Past 7)</h3>
              {userLogs.length ? (
                <table className="login-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>IP</th>
                      <th>Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td>{new Date(log.date).toLocaleString()}</td>
                        <td>{log.ip}</td>
                        <td>
                          <img
                            src={`https://flagcdn.com/24x18/${log.country_code.toLowerCase()}.png`}
                            alt={log.country_code}
                            title={log.country_code}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-logs">No recent logins.</p>
              )}
            </div>

            {/* Change Logs */}
            <div className="dashboard-card">
              <h3>📝 Change Logs</h3>
              {user.change_logs && user.change_logs.length ? (
                <ul>
                  {user.change_logs.map((log, idx) => (
                    <li key={idx}>
                      <span>{new Date(log.date).toLocaleDateString()}:</span> {log.change}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent changes.</p>
              )}
            </div>
          </section>
        </>
      )}

      {activeTab === "🔐 Security" && <div>Security Tab Content</div>}
      {activeTab === "📜 Activity" && <Activity />}
      {activeTab === "🪪 Subscriptions" && <Subscriptions />}
      {activeTab === "⚙️ Settings" && (
        <Suspense fallback={<div>Loading Settings...</div>}>
          <Settings />
        </Suspense>
      )}
      {activeTab === "🛠️ Support" && <MyTickets />}

      {showWelcome && (
        <WelcomePopup
          username={user.username}
          logs={userLogs.slice(0, 5)}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
};

export default MyAccount;
