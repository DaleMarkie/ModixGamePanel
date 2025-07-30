"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModProfiles from "./ModProfiles"; // <-- Correct import

export default function ModProfilesPage() {
  return (
    <DashboardLayout>
      <ModProfilesPage />
    </DashboardLayout>
  );
}
