"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Welcome from "./welcome/Welcome";

export default function WelcomePage() {
  return (
    <DashboardLayout>
      <Welcome />
    </DashboardLayout>
  );
}
