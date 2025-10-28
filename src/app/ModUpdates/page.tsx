"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModUpdates from "./ModUpdates"; // your actual feature component
import AuthWrapper from "@/app/auth"; // central wrapper

export default function ModUpdatesPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <ModUpdates />
      </DashboardLayout>
    </AuthWrapper>
  );
}
