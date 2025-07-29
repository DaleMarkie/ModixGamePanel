"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Help from "./Help"; // <-- Correct import

export default function TermsPage() {
  return (
    <DashboardLayout>
      <Help />
    </DashboardLayout>
  );
}
