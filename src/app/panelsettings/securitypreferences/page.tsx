"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import SecurityPreferences from "./SecurityPreferences"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function SecurityPreferencesPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <SecurityPreferences />
      </DashboardLayout>
    </AuthWrapper>
  );
}
