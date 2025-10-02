"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import AccountInfo from "./AccountInfo"; // <-- Correct import

export default function AccountInfoPage() {
  return (
    <DashboardLayout>
      <AccountInfo />
    </DashboardLayout>
  );
}
