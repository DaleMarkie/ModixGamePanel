"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Testpage from "./Docs"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function DocsPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Testpage />
      </DashboardLayout>
    </AuthWrapper>
  );
}
