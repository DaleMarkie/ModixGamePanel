"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Subscriptions from "./subscriptions"; // ✅ PascalCase

export default function SubscriptionsPage() {
  // ✅ PascalCase function name
  return (
    <DashboardLayout>
      <Subscriptions /> {/* ✅ PascalCase usage */}
    </DashboardLayout>
  );
}
