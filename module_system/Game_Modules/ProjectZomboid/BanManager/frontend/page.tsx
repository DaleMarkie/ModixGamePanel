"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import BanManager from "./BanManager";

export default function BanManagerPage() {
  return (
    <DashboardLayout>
      <BanManager />
    </DashboardLayout>
  );
}
