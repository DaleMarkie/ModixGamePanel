"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import EmbededMessages from "./EmbededMessages"; // your actual feature component
import AuthWrapper from "@/app/auth"; // central wrapper

export default function EmbededMessagesPage() {
  return (
    <AuthWrapper roles={["Owner", "Admin"]}>
      <DashboardLayout>
        <EmbededMessages />
      </DashboardLayout>
    </AuthWrapper>
  );
}
