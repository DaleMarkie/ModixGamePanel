"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Testpage from "./Docs"; // <-- Correct import

export default function DocsPage() {
  return (
    <DashboardLayout>
      <Testpage />
    </DashboardLayout>
  );
}
