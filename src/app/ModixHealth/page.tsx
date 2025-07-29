"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModixHealth from "./ModixHealth"; // <-- Correct import

export default function ModixHealthPage() {
  return (
    <DashboardLayout>
      <ModixHealth />
    </DashboardLayout>
  );
}
