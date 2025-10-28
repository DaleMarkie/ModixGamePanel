"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import StaffChat from "./StaffChat";
import AuthWrapper from "@/app/auth"; // central wrapper

export default function PlayersBannedPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <StaffChat />
      </DashboardLayout>
    </AuthWrapper>
  );
}
