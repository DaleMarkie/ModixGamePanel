"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Forums from "./forums"; // <-- Correct import

export default function PlayersBannedPage() {
  return (
    <DashboardLayout>
      <Forums />
    </DashboardLayout>
  );
}
