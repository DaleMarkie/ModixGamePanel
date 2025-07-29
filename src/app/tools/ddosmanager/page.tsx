"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import DdosManager from "./DdosManager"; // <-- Correct import

export default function DdosManagerPage() {
  return (
    <DashboardLayout>
      <DdosManager />
    </DashboardLayout>
  );
}
