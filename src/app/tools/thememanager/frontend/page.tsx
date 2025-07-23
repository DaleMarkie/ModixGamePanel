"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ThemeManager from "./ThemeManager"; // your actual feature component

export default function UpdaterPage() {
  return (
    <DashboardLayout>
      <ThemeManager />
    </DashboardLayout>
  );
}
