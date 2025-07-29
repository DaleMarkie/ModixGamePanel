"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ThemeManager from "./ThemeManager"; // <-- Correct import

export default function ThemeManagerPage() {
  return (
    <DashboardLayout>
      <ThemeManager />
    </DashboardLayout>
  );
}
