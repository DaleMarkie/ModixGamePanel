"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Workshop from "./Workshop";

export default function WorkshopPage() {
  return (
    <DashboardLayout>
      <Workshop />
    </DashboardLayout>
  );
}
