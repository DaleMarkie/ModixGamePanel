"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Dashboard from "./Dashboard2"; // <-- Correct import

export default function Dashboard2Page() {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}
