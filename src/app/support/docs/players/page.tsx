"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Players from "./Players"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function PlayersPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Players />
      </DashboardLayout>
    </AuthWrapper>
  );
}
