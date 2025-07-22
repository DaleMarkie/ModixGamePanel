
import React, { useState, useEffect } from "react";
import { FaLaptop, FaServer, FaUser } from "react-icons/fa";
import { useUser } from "../../app/UserContext";
import { useContainer } from "../../app/ContainerContext";

export default function SidebarUserInfo() {
  const { user, authenticated, loading } = useUser();
  const { selectedContainer } = useContainer();
  const [hostname, setHostname] = useState(null);

  useEffect(() => {
    // Replace this with real fetch if you have a backend for server/host info
    setTimeout(() => {
      setHostname("modix-prod-server-01.longname.example.com");
    }, 400);
  }, []);

  if (loading) return null;
  if (!authenticated || !user) return null;
  if (!hostname || !selectedContainer) return null;

  return (
    <section aria-label="Server Information" className="server-info-section">
      {[
        { icon: <FaLaptop size={12} />, label: "Host", value: hostname },
        { icon: <FaServer size={12} />, label: "Container", value: selectedContainer },
        { icon: <FaUser size={12} />, label: "User", value: user.username },
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
