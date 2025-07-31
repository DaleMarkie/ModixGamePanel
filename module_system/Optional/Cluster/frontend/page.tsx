"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Cluster from "./Cluster";

export default function ClusterPage() {
  return (
    <DashboardLayout>
      <Cluster />
    </DashboardLayout>
  );
}
