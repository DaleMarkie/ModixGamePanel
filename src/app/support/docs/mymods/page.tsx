"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import MyMods from "./MyMods"; // Correct import
import AuthWrapper from "@/app/auth"; // central wrapper

export default function MyModsPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <MyMods />
      </DashboardLayout>
    </AuthWrapper>
  );
}
