"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import JavaProfiler from "./JavaProfiler";

export default function JavaProfilerPage() {
  return (
    <DashboardLayout>
      <JavaProfiler />
    </DashboardLayout>
  );
}
