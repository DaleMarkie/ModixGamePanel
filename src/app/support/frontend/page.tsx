"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import support from "./Support"; // <-- Correct import

export default function UserSupportTicketsPage() {
  return (
    <DashboardLayout>
      <support />
    </DashboardLayout>
  );
}
