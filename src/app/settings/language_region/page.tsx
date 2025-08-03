"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Language_Region from "./Language_Region"; // <-- Correct import

export default function Language_RegionPage() {
  return (
    <DashboardLayout>
      <Language_Region />
    </DashboardLayout>
  );
}
