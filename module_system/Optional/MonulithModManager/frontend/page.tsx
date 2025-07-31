"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import MonulithModManager from "./MonulithModManagerPage";

export default function MonulithModManagerPage() {
  return (
    <DashboardLayout>
      <MonulithModManager />
    </DashboardLayout>
  );
}
