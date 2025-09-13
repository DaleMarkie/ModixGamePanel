"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import AllPlayers from "./AllPlayers"; // <-- Correct import

export default function AllPlayersPage() {
  return (
    <DashboardLayout>
      <AllPlayers />
    </DashboardLayout>
  );
}
