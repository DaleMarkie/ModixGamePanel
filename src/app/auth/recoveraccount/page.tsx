"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import RecoverAccount from "./RecoverAccount"; // <-- Correct import

export default function RecoverAccountPage() {
  return (
    <DashboardLayout>
      <RecoverAccount />
    </DashboardLayout>
  );
}
