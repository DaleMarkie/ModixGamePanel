"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ServerManagement from "./ServerManagement"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function ServerManagementPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <ServerManagement />
      </DashboardLayout>
    </AuthWrapper>
  );
}
