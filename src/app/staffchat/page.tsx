"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import StaffChat from "./StaffChat"; // <-- Correct import

export default function PlayersBannedPage() {
  return (
    <DashboardLayout>
      <StaffChat />
    </DashboardLayout>
  );
}
