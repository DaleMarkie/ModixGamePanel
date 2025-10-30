"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Monitoring from "./Monitoring"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function MonitoringPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Monitoring />
      </DashboardLayout>
    </AuthWrapper>
  );
}
