"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ServerSettings from "./ServerSettings";

export default function ServerSettingsFancy() {
  return (
    <DashboardLayout>
      <ServerSettings />
    </DashboardLayout>
  );
}
