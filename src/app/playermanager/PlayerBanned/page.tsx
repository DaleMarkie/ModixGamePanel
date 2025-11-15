"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import PlayersBanned from "./PlayersBanned"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function PlayersBannedPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <PlayersBanned />
      </DashboardLayout>
    </AuthWrapper>
  );
}
