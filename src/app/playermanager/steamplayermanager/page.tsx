"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import SteamPlayerManager from "./SteamPlayerManager"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function SteamPlayerManagerPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <SteamPlayerManager />
      </DashboardLayout>
    </AuthWrapper>
  );
}
