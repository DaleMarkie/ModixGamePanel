"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import TestModule from "./ModPerformanceAnalyzer";

export default function TestModulePage() {
  return (
    <DashboardLayout>
      <TestModule />
    </DashboardLayout>
  );
}
