"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import HarmonyModManager from "./HarmonyModManager";

export default function HarmonyModManagerPage() {
  return (
    <DashboardLayout>
      <HarmonyModManager />
    </DashboardLayout>
  );
}
