"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import SteamPlayerManager from "./SteamPlayerManager"; // <-- Correct import

export default function SteamPlayerManagerPage() {
  return (
    <DashboardLayout>
      <SteamPlayerManager />
    </DashboardLayout>
  );
}
