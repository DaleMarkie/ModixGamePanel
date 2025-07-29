"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Debugger from "./Debugger"; // <-- Correct import

export default function DebuggerPage() {
  return (
    <DashboardLayout>
      <Debugger />
    </DashboardLayout>
  );
}
