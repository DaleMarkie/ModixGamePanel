"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Welcome from "./Welcome"; // this is your actual feature component

export default function InstalledPage() {
  return (
    <DashboardLayout>
      <Welcome />
    </DashboardLayout>
  );
}
