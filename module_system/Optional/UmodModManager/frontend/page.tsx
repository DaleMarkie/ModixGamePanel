"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import UmodModManager from "./UmodModManagerPage";

export default function UmodModManagerPage() {
  return (
    <DashboardLayout>
      <UmodModManager />
    </DashboardLayout>
  );
}
