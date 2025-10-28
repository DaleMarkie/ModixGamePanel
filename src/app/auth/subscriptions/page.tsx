"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import Subscriptions from "./subscriptions"; // ✅ PascalCase

import AuthWrapper from "@/app/auth"; // central wrapper

export default function SubscriptionsPage() {
  // ✅ PascalCase function name
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <Subscriptions /> {/* ✅ PascalCase usage */}
      </DashboardLayout>
    </AuthWrapper>
  );
}
