"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import AnticheatManager from "./AnticheatManager"; // <-- Correct import

export default function AnticheatManagerPage() {
  return (
    <DashboardLayout>
      <AnticheatManager />
    </DashboardLayout>
  );
}
