"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import License from "./License"; // <-- Correct import

export default function LicensePage() {
  return (
    <DashboardLayout>
      <License />
    </DashboardLayout>
  );
}
