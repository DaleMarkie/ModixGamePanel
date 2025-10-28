"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Debugger from "./Debugger"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function DebuggerPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Debugger />
      </DashboardLayout>
    </AuthWrapper>
  );
}
