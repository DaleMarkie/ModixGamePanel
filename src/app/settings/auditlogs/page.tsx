"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ThemeManager from "./ThemeManager"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function ThemeManagerPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <ThemeManager />
      </DashboardLayout>
    </AuthWrapper>
  );
}
