"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Activity from "./Activity"; // <-- Correct import

export default function ActivityPage() {
  return (
    <DashboardLayout>
      <Activity />
    </DashboardLayout>
  );
}
