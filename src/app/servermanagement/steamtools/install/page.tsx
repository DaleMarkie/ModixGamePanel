"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Install from "./Install"; // your actual feature component
import AuthWrapper from "@/app/auth"; // central wrapper

export default function InstallPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Install />
      </DashboardLayout>
    </AuthWrapper>
  );
}
