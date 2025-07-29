"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Testpage from "./ServerSettings"; // <-- Correct import

export default function ServerSettingsPage() {
  return (
    <DashboardLayout>
      <Testpage />
    </DashboardLayout>
  );
}
