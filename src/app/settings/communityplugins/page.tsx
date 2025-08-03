"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import CommunityPlugins from "./CommunityPlugins"; // <-- Correct import

export default function CommunityPluginsPage() {
  return (
    <DashboardLayout>
      <CommunityPlugins />
    </DashboardLayout>
  );
}
