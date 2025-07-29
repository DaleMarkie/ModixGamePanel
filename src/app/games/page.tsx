"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import Games from "./Games"; // <-- Correct import

export default function GamesPage() {
  return (
    <DashboardLayout>
      <Games />
    </DashboardLayout>
  );
}
