"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import MyAccount from "./MyAccount";

export default function MyAccountPage() {
  return (
    <DashboardLayout>
      <MyAccount />
    </DashboardLayout>
  );
}
