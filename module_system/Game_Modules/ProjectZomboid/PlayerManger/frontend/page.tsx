"use client";
import React from "react";

import DashboardLayout from "@components/sidebar/DashboardLayout";
import PlayerManager from "./PlayerManager";

export default function PlayerManagerPage() {
  return (
    <DashboardLayout>
      <PlayerManager />
    </DashboardLayout>
  );
}
