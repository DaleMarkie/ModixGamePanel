"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ManageAssets from "./ManageAssets"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function ManageAssetsPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <ManageAssets />
      </DashboardLayout>
    </AuthWrapper>
  );
}
