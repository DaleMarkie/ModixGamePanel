"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import RBAC from "./RBAC";

export default function RBACPage() {
  return (
    <DashboardLayout>
      <RBAC />
    </DashboardLayout>
  );
}
