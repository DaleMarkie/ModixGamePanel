"use client";

import React from "react";
import DashboardLayout from "@components/sidebar/DashboardLayout";
import PlayerManager from "./PlayerManager";

export default function ServerSettingsFancy() {
  return (
    <DashboardLayout>
      <PlayerManager />
    </DashboardLayout>
  );
}
