"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModManager from "./ModManager"; // <-- import your actual component

export default function ModManagerPage() {
  return (
    <DashboardLayout>
      <ModManager />
    </DashboardLayout>
  );
}
