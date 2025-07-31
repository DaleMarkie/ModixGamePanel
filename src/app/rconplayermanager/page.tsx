"use client";

import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import PlayerManager from "../playermanager/PlayerManager"; // <-- Correct import

export default function PlayerManagerPage() {
  return (
    <DashboardLayout>
      <PlayerManagerPage />
    </DashboardLayout>
  );
}
