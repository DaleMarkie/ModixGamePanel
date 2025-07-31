"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import CrashAnalyzer from "./CrashAnalyzer";

export default function CrashAnalyzerPage() {
  return (
    <DashboardLayout>
      <CrashAnalyzer />
    </DashboardLayout>
  );
}
