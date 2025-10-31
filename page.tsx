"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Games from "./Games"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function GamesPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Games />
      </DashboardLayout>
    </AuthWrapper>
  );
}
