"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import BackUp from "./BackUp"; // <-- Correct import

export default function BackUpPage() {
  return (
    <DashboardLayout>
      <BackUp />
    </DashboardLayout>
  );
}
