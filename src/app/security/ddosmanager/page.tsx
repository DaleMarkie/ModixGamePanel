"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import DdosManager from "./DdosManager"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function DdosManagerPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <DdosManager />
      </DashboardLayout>
    </AuthWrapper>
  );
}
