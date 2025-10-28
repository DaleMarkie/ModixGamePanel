"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import MyAccount from "./MyAccount";
import AuthWrapper from "@/app/auth"; // central wrapper

export default function MyAccountPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin", "SubUser"]}>
      <DashboardLayout>
        <MyAccount />
      </DashboardLayout>
    </AuthWrapper>
  );
}
