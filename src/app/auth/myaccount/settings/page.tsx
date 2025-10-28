"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Settings from "./mySettings";
import AuthWrapper from "@/app/auth"; // central wrapper

export default function MyAccountPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin", "SubUser"]}>
      <DashboardLayout>
        <Settings />
      </DashboardLayout>
    </AuthWrapper>
  );
}
