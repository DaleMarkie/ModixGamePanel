import React, { useState, useEffect } from "react";
import { FaLaptop, FaServer, FaUser } from "react-icons/fa";

export default function SidebarUserInfo() {
  const [serverInfo, setServerInfo] = useState(null);
  useEffect(() => {
    setTimeout(() => {
      setServerInfo({
        hostname: "modix-prod-server-01.longname.example.com",
        container: "pz-prod-container-05",
        loggedInUser: "adminUser42",
      });
    }, 400);
  }, []);

  if (!serverInfo) return null;
  const { hostname, container, loggedInUser } = serverInfo;
  if (!hostname || !container || !loggedInUser) return null;
  return (
    <section aria-label="Server Information" className="server-info-section">
      {[
        { icon: <FaLaptop size={12} />, label: "Host", value: hostname },
        { icon: <FaServer size={12} />, label: "Container", value: container },
        { icon: <FaUser size={12} />, label: "User", value: loggedInUser },
      ].map(({ icon, label, value }) => (
        <div
          key={label}
          title={`${label}: ${value}`}
          aria-label={`${label}: ${value}`}
          className="server-info-item"
        >
          <span className="server-info-icon">{icon}</span>
          <span className="server-info-label">{label}:</span>
          <span className="server-info-value">{value}</span>
        </div>
      ))}
    </section>
  );
}
