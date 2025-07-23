"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Team from "./Team";

export default function BuildToolsPage() {
  return (
    <DashboardLayout>
      <Team />
    </DashboardLayout>
  );
}
