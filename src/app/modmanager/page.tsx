"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModManager from "./ModManager"; // your actual feature component
import AuthWrapper from "@/app/auth"; // central wrapper

export default function ModManagerPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <ModManager />
      </DashboardLayout>
    </AuthWrapper>
  );
}
