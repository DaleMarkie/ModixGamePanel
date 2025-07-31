"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import LicenseModal from "./LicenseModal"; // <-- Correct import

export default function LicenseModalPage() {
  return (
    <DashboardLayout>
      <LicenseModal />
    </DashboardLayout>
  );
}
