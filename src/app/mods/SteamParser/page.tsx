"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import SteamParser from "./SteamParser"; // <-- Correct import

export default function SteamParserPage() {
  return (
    <DashboardLayout>
      <SteamParser />
    </DashboardLayout>
  );
}
