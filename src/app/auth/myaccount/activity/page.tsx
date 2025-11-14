"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Activity from "./Activity"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function ActivityPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin", "SubUser"]}>
      <DashboardLayout>
        <Activity />
      </DashboardLayout>
    </AuthWrapper>
  );
}
