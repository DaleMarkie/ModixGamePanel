"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Install from "./Install"; // this is your actual feature component

export default function InstallPage() {
  return (
    <DashboardLayout>
      <Install />
    </DashboardLayout>
  );
}
