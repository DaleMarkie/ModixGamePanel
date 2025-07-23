"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModUpdater from "./ModUpdater"; // this is your actual feature component

export default function ModUpdaterPage() {
  return (
    <DashboardLayout>
      <ModUpdater />
    </DashboardLayout>
  );
}
