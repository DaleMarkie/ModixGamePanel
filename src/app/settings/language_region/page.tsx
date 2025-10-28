"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Language_Region from "./Language_Region"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function Language_RegionPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Language_Region />
      </DashboardLayout>
    </AuthWrapper>
  );
}
