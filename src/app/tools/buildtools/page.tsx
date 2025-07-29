"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import BuildTools from "./BuildTools"; // <-- Correct import

export default function BuildToolsPage() {
  return (
    <DashboardLayout>
      <BuildTools />
    </DashboardLayout>
  );
}
