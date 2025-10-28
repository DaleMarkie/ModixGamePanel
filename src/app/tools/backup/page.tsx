"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import BackUp from "./BackUp"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function BackUpPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <BackUp />
      </DashboardLayout>
    </AuthWrapper>
  );
}
