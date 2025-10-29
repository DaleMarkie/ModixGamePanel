"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import PortCheck from "./PortCheck"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function PortCheckPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <PortCheck />
      </DashboardLayout>
    </AuthWrapper>
  );
}
