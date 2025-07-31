"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import CursforgeModManager from "./CursforgeModManager";

export default function CursforgeModManagerPage() {
  return (
    <DashboardLayout>
      <CursforgeModManager />
    </DashboardLayout>
  );
}
