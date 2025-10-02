"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModManager from "./ModManager"; // this is your actual feature component

export default function ModManagerPage() {
  return (
    <DashboardLayout>
      <ModManager />
    </DashboardLayout>
  );
}
