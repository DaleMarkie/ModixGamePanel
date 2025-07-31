"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import LogViewer from "./LogViewer";

export default function LogViewerPage() {
  return (
    <DashboardLayout>
      <LogViewer />
    </DashboardLayout>
  );
}
