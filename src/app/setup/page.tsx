"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Setup from "./Setup"; // this is your actual feature component

export default function SetupPage() {
  return (
    <DashboardLayout>
      <Setup />
    </DashboardLayout>
  );
}
