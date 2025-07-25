"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import RBAC from "./Rbac"; // this is your actual feature component

export default function RBACPage() {
  return (
    <DashboardLayout>
      <RBAC />
    </DashboardLayout>
  );
}
