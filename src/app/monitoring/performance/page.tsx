"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Performance from "./Performance"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function PerformancePage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Performance />
      </DashboardLayout>
    </AuthWrapper>
  );
}
