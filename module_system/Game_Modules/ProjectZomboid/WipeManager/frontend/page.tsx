"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import WipeManager from "./WipeManager";

export default function WipeManagerPage() {
  return (
    <DashboardLayout>
      <WipeManager />
    </DashboardLayout>
  );
}
