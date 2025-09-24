"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Settings from "./mySettings";

export default function MyAccountPage() {
  return (
    <DashboardLayout>
      <Settings />
    </DashboardLayout>
  );
}
