"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Security from "./Security"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function SecurityPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin", "SubUser"]}>
      <DashboardLayout>
        <Security />
      </DashboardLayout>
    </AuthWrapper>
  );
}
