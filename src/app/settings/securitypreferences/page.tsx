"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import SecurityPreferences from "./SecurityPreferences"; // <-- Correct import

export default function SecurityPreferencesPage() {
  return (
    <DashboardLayout>
      <SecurityPreferences />
    </DashboardLayout>
  );
}
