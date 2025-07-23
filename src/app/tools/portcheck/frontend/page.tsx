"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import PortCheck from "./PortCheck";

export default function PortCheckPage() {
  return (
    <DashboardLayout>
      <PortCheck />
    </DashboardLayout>
  );
}
