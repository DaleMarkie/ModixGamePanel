import React, { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import SidebarUserInfo from "./SidebarUserInfo";
import Sidebar from "./Sidebar";

// Example main content component for demonstration
function ExampleModuleContent() {
  return <div style={{ color: "#fff" }}>This is your module's main content area.</div>;
}

export default function ModuleTemplatePage() {
  // Example: fetch server info for SidebarUserInfo
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

  return (
    <DashboardLayout panelName="MODIX">
      {/* Sidebar can be placed here if you want a custom sidebar */}
      <Sidebar>
        <SidebarUserInfo
          hostname={serverInfo?.hostname}
          container={serverInfo?.container}
          loggedInUser={serverInfo?.loggedInUser}
        />
        {/* Add more sidebar content here if needed */}
      </Sidebar>
      {/* Main module content goes here */}
      <ExampleModuleContent />
    </DashboardLayout>
  );
}
