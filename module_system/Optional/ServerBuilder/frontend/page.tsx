"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ServerBuilder from "./ServerBuilderPage";

export default function ServerBuilderPage() {
  return (
    <DashboardLayout>
      <ServerBuilder />
    </DashboardLayout>
  );
}
