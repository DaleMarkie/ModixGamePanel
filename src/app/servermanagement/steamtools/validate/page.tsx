"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Validate from "./Validate"; // your actual feature component
import AuthWrapper from "@/app/auth"; // central wrapper

export default function ValidatePage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Validate />
      </DashboardLayout>
    </AuthWrapper>
  );
}
