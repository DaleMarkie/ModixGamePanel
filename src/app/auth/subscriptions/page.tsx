"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import subscriptions from "./subscriptions"; // <-- Correct import

export default function subscriptionsPage() {
  return (
    <DashboardLayout>
      <subscriptions />
    </DashboardLayout>
  );
}
