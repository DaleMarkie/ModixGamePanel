"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModpackManager from "./ModpackManager";

export default function ModpackManagerPage() {
  return (
    <DashboardLayout>
      <ModpackManager />
    </DashboardLayout>
  );
}
