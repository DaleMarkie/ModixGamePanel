"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModUpdater from "./ModUpdater"; // your actual feature component
import AuthWrapper from "@/app/auth"; // central wrapper

export default function ModUpdaterPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <ModUpdater />
      </DashboardLayout>
    </AuthWrapper>
  );
}
