import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import SidebarUserInfo from "@components/sidebar/SidebarUserInfo";

// Example main content component for demonstration
function ExampleModuleContent() {
  return <div style={{ color: "#fff" }}>This is your module's main content area.</div>;
}

export default function ModuleTemplatePage() {
  return (
    <DashboardLayout panelName="MODIX">
      {/* SidebarUserInfo is now self-contained */}
      <SidebarUserInfo />
      {/* Main module content goes here */}
      <ExampleModuleContent />
    </DashboardLayout>
  );
}
