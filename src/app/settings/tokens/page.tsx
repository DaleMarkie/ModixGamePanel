"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ApiKeys from "./ApiKeys"; // <-- Correct import

export default function ApiKeysPage() {
  return (
    <DashboardLayout>
      <ApiKeys />
    </DashboardLayout>
  );
}
