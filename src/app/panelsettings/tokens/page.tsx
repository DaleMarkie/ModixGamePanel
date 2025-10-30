"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import ApiKeys from "./ApiKeys"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function ApiKeysPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <ApiKeys />
      </DashboardLayout>
    </AuthWrapper>
  );
}
