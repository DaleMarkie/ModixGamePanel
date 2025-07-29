"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import AnticheatManager from "./AnticheatManager";

export default function AnticheatPage() {
  return (
    <DashboardLayout>
      <AnticheatManager />
    </DashboardLayout>
  );
}
