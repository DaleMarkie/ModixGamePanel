"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import FileBrowser from "./FileBrowser"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function FileBrowserPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <FileBrowser />
      </DashboardLayout>
    </AuthWrapper>
  );
}
