"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ServerSettingsFancy from "./ServerSettings"; // Correct import

export default function ServerSettingsPage() {
  // You can set a default game here, e.g., "zomboid"
  const defaultGame = "zomboid";

  return (
    <DashboardLayout>
      <ServerSettingsFancy game={defaultGame} />
    </DashboardLayout>
  );
}
