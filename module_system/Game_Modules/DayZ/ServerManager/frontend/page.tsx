"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import ServerManager from "./ServerManager";

export default function BanManagerPage() {
  return (
    <DashboardLayout>
      <ServerManager />
    </DashboardLayout>
  );
}
