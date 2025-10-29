"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ServerSettingsFancy from "./serversettings"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function serversettingsPage() {
  // You can set a default game here, e.g., "zomboid"
  const defaultGame = "zomboid";

  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <ServerSettingsFancy game={defaultGame} />
      </DashboardLayout>
    </AuthWrapper>
  );
}
