"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Performance from "./Performance";

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <Performance />
    </DashboardLayout>
  );
}
