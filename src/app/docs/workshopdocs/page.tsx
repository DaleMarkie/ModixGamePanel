"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import WorkshopDocs from "./WorkshopDocs"; // <-- Correct import

export default function WorkshopDocsPage() {
  return (
    <DashboardLayout>
      <WorkshopDocsPage />
    </DashboardLayout>
  );
}
