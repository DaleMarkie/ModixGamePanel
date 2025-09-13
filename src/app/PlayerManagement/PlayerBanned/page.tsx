"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import PlayersBanned from "./PlayersBanned"; // <-- Correct import

export default function PlayersBannedPage() {
  return (
    <DashboardLayout>
      <PlayersBanned />
    </DashboardLayout>
  );
}
