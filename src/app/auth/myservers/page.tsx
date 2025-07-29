"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import MyServers from "./MyServers"; // <-- Correct import

export default function MyServersPage() {
  return (
    <DashboardLayout>
      <MyServers />
    </DashboardLayout>
  );
}
