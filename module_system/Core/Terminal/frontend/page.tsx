"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Terminal from "./Terminal";
import AuthWrapper from "@/app/auth"; // central wrapper

export default function TerminalPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Terminal />
      </DashboardLayout>
    </AuthWrapper>
  );
}
