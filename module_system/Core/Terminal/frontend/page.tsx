"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Terminal from "./Terminal";

export default function TerminalPage() {
  return (
    <DashboardLayout>
      <Terminal />
    </DashboardLayout>
  );
}
