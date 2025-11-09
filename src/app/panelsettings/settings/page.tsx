"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Settings from "./Settings"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function SettingsPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Settings />
      </DashboardLayout>
    </AuthWrapper>
  );
}
