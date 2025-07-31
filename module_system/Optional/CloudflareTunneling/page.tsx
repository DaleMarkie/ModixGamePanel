"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import CloudflareTunneling from "./CloudflareTunneling";

export default function CloudflareTunnelingPage() {
  return (
    <DashboardLayout>
      <CloudflareTunneling />
    </DashboardLayout>
  );
}
