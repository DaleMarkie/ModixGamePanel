"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import PluginInstaller from "./PluginInstaller"; // <-- Correct import

export default function PluginInstallerPage() {
  return (
    <DashboardLayout>
      <PluginInstaller />
    </DashboardLayout>
  );
}
