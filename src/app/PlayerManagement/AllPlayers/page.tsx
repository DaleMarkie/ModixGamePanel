"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import AllPlayers from "./AllPlayers"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function AllPlayersPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <AllPlayers />
      </DashboardLayout>
    </AuthWrapper>
  );
}
