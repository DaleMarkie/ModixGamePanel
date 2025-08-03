"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import TerminalDocs from "./TerminalDocs"; // <-- Correct import

export default function ThemeManagerPage() {
  return (
    <DashboardLayout>
      <TerminalDocs />
    </DashboardLayout>
  );
}
