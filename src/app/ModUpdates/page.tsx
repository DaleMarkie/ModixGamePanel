"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ModUpdates from "./ModUpdates"; // this is your actual feature component

export default function ModUpdatesPage() {
  return (
    <DashboardLayout>
      <ModUpdates />
    </DashboardLayout>
  );
}
